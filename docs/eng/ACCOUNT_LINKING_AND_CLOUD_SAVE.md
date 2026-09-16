# Account linking and cloud-save architecture

## Goal

Codigdex remains playable without an account. Once a player links an account,
Web and Android/iOS clients signed in as that same user share one durable game
progress record.

The initial implementation uses **Supabase Auth, PostgreSQL, and Row Level
Security**:

- signed-out play stays local and does not create an anonymous server user;
- `auth.users.id` is the only ownership key;
- Google, GitHub, and Apple are identities linked to that user;
- the current save is a versioned JSON snapshot guarded by an optimistic
  `revision`;
- save migration, canonicalization, and merge rules live in
  `@codigdex/game-core` and are shared by Web and Mobile;
- RLS prevents cross-user access, while an atomic compare-and-set operation
  prevents a stale device from silently overwriting newer progress.

Social features, rankings, and multiplayer are out of scope.

## Identity model

```text
Google ─┐
GitHub ─┼─> Supabase Auth ─> one auth.users.id ─> one game_saves row
Apple ──┘
```

Provider email addresses are attributes, not ownership keys. Apple private
relay email may differ from the player's Google or GitHub email, so the product
must not depend on email equality. A signed-in player links another provider
from Account Settings. Automatic linking of verified matching emails is only a
convenience.

If a player accidentally creates two permanent users, do not merge them based
on a claim or matching display name. A future account-merge flow must
reauthenticate both accounts and transfer data in a server transaction. The MVP
offers export/recovery support instead.

## Provider and callback matrix

| Provider | Web | Mobile | Notes |
| --- | --- | --- | --- |
| Google | OAuth PKCE callback | browser OAuth or native ID token | keep environment-specific redirect allow-lists |
| GitHub | OAuth PKCE callback | browser OAuth plus app deep link | never key ownership by public GitHub email |
| Apple | OAuth callback | native Sign in with Apple ID token preferred | handle private relay and key maintenance |

```text
Production Web: https://codigdex.vercel.app/auth/callback
Preview Web:    explicitly allowed Vercel preview callback
Mobile dev:     codigdex://auth/callback
Mobile prod:    Universal/App Link with custom-scheme fallback
```

Web uses `@supabase/ssr`, cookie-based sessions, and PKCE. Mobile uses
`@supabase/supabase-js`, Expo Linking, and a SecureStore-backed session
adapter. The service-role key is never shipped to either client.

## Storage model

```sql
create table public.game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version smallint not null,
  revision bigint not null default 1 check (revision > 0),
  payload jsonb not null,
  payload_hash text not null,
  source_device_id uuid,
  updated_at timestamptz not null default now()
);
```

Local sync metadata is stored separately from save v3:

```ts
interface LocalSyncMetadata {
  accountUserId?: string;
  cloudRevision?: number;
  lastSyncedHash?: string;
  lastSyncedAt?: string;
  dirty: boolean;
  deviceId: string;
}
```

The cloud envelope adds revision and field clocks around the shared save
payload. Captures and career history merge by item; current job selection and
locale use field clocks and may produce an explicit user-facing conflict.
Ephemeral UI state is not synchronized.

## Account attribution

On the first sign-in:

1. Read and migrate the local save.
2. Fetch the authenticated user's cloud save.
3. If no cloud save exists, create revision 1 from the canonical local save.
4. If one exists, merge local and cloud data and show a merge summary.
5. Write with the expected cloud revision.
6. Replace local state with the server-confirmed result and store sync
   metadata.

From that point on, the progress belongs to `auth.users.id`, independently of
which linked provider or client is used to sign in.

## Deterministic merge policy

| Data | Rule |
| --- | --- |
| captures | union by monster ID; retain the earliest valid capture time |
| career unlock/selection history | retain the earliest valid first occurrence |
| career mastery | recompute from merged captures; retain earliest valid mastery time |
| current primary/secondary/tertiary job | accept a one-sided change; prompt on concurrent divergence |
| locale | latest field clock; current device wins an exact tie |
| tutorial seen | logical OR |

The merge function must be idempotent and commutative for progress collections.
It returns a conflict instead of guessing for divergent scalar selections.

## Concurrency and offline play

Updates use compare-and-set:

```text
expected revision == database revision
  -> update and increment revision

expected revision != database revision
  -> return conflict, fetch latest, merge, retry
```

The check and update run in one PostgreSQL transaction/RPC. Timestamps alone
are not concurrency tokens. A disconnected client continues to save locally,
marks sync metadata dirty, and retries after sign-in, foreground resume,
network recovery, a manual sync, or a debounced meaningful progress change.
Sync failure must never block a result screen or map navigation.

## Authorization

Enable RLS on every exposed table. A representative policy is:

```sql
create policy "read own save"
on public.game_saves for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);
```

Use `auth.uid()` inside restricted save RPCs rather than trusting a client
supplied user ID. Do not trust uploaded mastery flags; canonicalize and
recompute them from captures. Keep service-role operations server-only.

## Lifecycle and privacy

- Sign-out clears the session and account-specific sync metadata; the player
  chooses whether the local save remains on the device.
- Identity unlink requires recent authentication and at least one remaining
  sign-in method.
- Account deletion requires recent authentication, offers JSON export, deletes
  profile and cloud save by user ID, and does not delete the external Google,
  GitHub, or Apple account.
- Never log JWTs, provider tokens, complete save payloads, or unnecessary
  provider profile data.

## Free-tier operation

Avoid creating server-side anonymous users, synchronize meaningful progress
instead of every UI event, and keep packaged art out of Supabase Storage. Free
projects require off-site encrypted database dumps because automatic backups
are not included, and they may pause after low activity. Re-check current
limits before production launch.

## Delivery order

1. COD-254: provider, callback, session, retention, and privacy ADR
2. COD-255: schema, RLS, revision RPC, and migrations
3. COD-256/COD-257: Web and Mobile authentication
4. COD-258: local attribution, merge UI, and shared merge function
5. COD-259: online/offline synchronization and conflict retry
6. COD-260: identity management, export, and deletion
7. COD-261/COD-262: security and cross-platform E2E

## Acceptance criteria

- Google, GitHub, and Apple identities can belong to one user.
- Web and Mobile restore the same progress for that user.
- Pre-login local progress survives the first account link.
- Offline captures made on two devices survive synchronization.
- Divergent current-career selections are never silently overwritten.
- A user cannot read or modify another user's save.
- OAuth cancellation, expiry, network loss, and duplicate requests do not
  prevent local play.
- unlink, export, and account deletion are covered by tests.

## Official references

- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Identity Linking](https://supabase.com/docs/guides/auth/auth-identity-linking)
- [React Native Auth quickstart](https://supabase.com/docs/guides/auth/quickstarts/react-native)
- [Next.js server-side Auth](https://supabase.com/docs/guides/auth/server-side)
- [PostgreSQL Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Free project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Database backups](https://supabase.com/docs/guides/platform/backups)
