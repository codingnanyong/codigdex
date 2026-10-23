create table public.game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version smallint not null check (schema_version = 3),
  revision bigint not null default 1 check (revision > 0),
  payload jsonb not null,
  payload_hash text not null,
  updated_at timestamptz not null default now(),
  constraint game_save_payload check (
    jsonb_typeof(payload) = 'object' and payload->>'version' = '3'
    and jsonb_typeof(payload->'progress'->'captures') = 'array'
    and jsonb_typeof(payload->'progress'->'careers') = 'array'
    and jsonb_typeof(payload->'player') = 'object'
    and jsonb_typeof(payload->'ui') = 'object'
    and octet_length(payload::text) <= 1048576
  )
);

alter table public.game_saves enable row level security;
revoke all on public.game_saves from anon, authenticated;
grant select on public.game_saves to authenticated;
create policy read_own_save on public.game_saves for select to authenticated
  using ((select auth.uid()) = user_id);

create function public.read_game_save(p_user_id uuid) returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
begin
  if auth.uid() is null or p_user_id is distinct from auth.uid() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  return (select jsonb_build_object('revision', revision, 'payload', payload)
    from public.game_saves where user_id = auth.uid());
end;
$$;

-- The insert/update and revision comparison are one database operation.
-- Clients cannot directly write the table or choose another user's ownership key.
create function public.write_game_save(p_user_id uuid, p_expected_revision bigint, p_payload jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare saved public.game_saves;
begin
  if auth.uid() is null or p_user_id is distinct from auth.uid() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_payload is null or not (
    coalesce(jsonb_typeof(p_payload) = 'object', false)
    and coalesce(p_payload->>'version' = '3', false)
    and coalesce(jsonb_typeof(p_payload->'progress'->'captures') = 'array', false)
    and coalesce(jsonb_typeof(p_payload->'progress'->'careers') = 'array', false)
    and coalesce(jsonb_typeof(p_payload->'player') = 'object', false)
    and coalesce(jsonb_typeof(p_payload->'ui') = 'object', false)
    and octet_length(p_payload::text) <= 1048576
  ) then raise exception 'Invalid save' using errcode = '22023'; end if;
  if p_expected_revision is null then
    insert into public.game_saves(user_id, schema_version, revision, payload, payload_hash)
      values (auth.uid(), 3, 1, p_payload, encode(sha256(convert_to(p_payload::text, 'UTF8')), 'hex'))
      on conflict (user_id) do nothing returning * into saved;
  else
    update public.game_saves set payload = p_payload, revision = revision + 1,
      payload_hash = encode(sha256(convert_to(p_payload::text, 'UTF8')), 'hex'), updated_at = now()
      where user_id = auth.uid() and revision = p_expected_revision returning * into saved;
  end if;
  if saved.user_id is null then return null; end if;
  return jsonb_build_object('revision', saved.revision, 'payload', saved.payload);
end;
$$;

revoke all on function public.read_game_save(uuid) from public, anon;
revoke all on function public.write_game_save(uuid, bigint, jsonb) from public, anon;
grant execute on function public.read_game_save(uuid) to authenticated;
grant execute on function public.write_game_save(uuid, bigint, jsonb) to authenticated;
