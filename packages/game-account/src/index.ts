import { useCallback, useEffect, useRef, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createSaveSync, type SyncStorage } from "@codigdex/game-core/save/sync";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { createSupabaseRemote } from "@codigdex/game-core/save/supabase";
import { normalizeGameSave } from "@codigdex/game-content/domain/gameProgress";

export type AccountStatus = "disabled" | "signed-out" | "idle" | "syncing" | "synced" | "attribution" | "conflict" | "error";
export type AccountProviderId = "google" | "github" | "apple";
export interface AccountOptions {
  client: SupabaseClient | null;
  storage: SyncStorage;
  save: StoredGameStateV3;
  writeSave(save: StoredGameStateV3): Promise<void>;
  openAuth(provider: AccountProviderId, link: boolean): Promise<void>;
  ready?: boolean;
}

/** The same lifecycle, debounce, attribution and conflict UI state on both platforms. */
export function useAccount(options: AccountOptions) {
  const latest = useRef(options);
  latest.current = options;
  const currentSave = useRef(options.save);
  currentSave.current = options.save;
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AccountStatus>(options.client ? "signed-out" : "disabled");
  const [engine] = useState(() => options.client ? createSaveSync({
    remote: createSupabaseRemote(options.client), storage: options.storage,
    readLocal: () => currentSave.current,
    writeLocal: async (save) => { currentSave.current = save; await latest.current.writeSave(save); }, normalize: normalizeGameSave,
  }) : null);
  const userId = useRef<string | undefined>(undefined);
  const sequence = useRef(0);
  const sync = useCallback(async (importGuest = false, resolution?: "local" | "remote") => {
    const id = userId.current;
    if (!id || !engine || latest.current.ready === false) return;
    const turn = sequence.current;
    setStatus("syncing");
    try {
      const result = await engine.sync(id, importGuest, resolution);
      if (sequence.current === turn && result !== "cancelled") setStatus(result);
    } catch { if (sequence.current === turn) setStatus("error"); }
  }, [engine]);

  useEffect(() => {
    const client = options.client;
    if (!client) return;
    let active = true;
    const updateSession = (next: Session | null) => {
      if (!active) return;
      if (userId.current !== next?.user.id) { sequence.current += 1; engine?.cancel(); }
      userId.current = next?.user.id;
      setSession(next);
      setStatus(next ? "idle" : "signed-out");
    };
    // Do not await auth or database requests inside onAuthStateChange's locked callback.
    let authEvents = 0;
    const { data } = client.auth.onAuthStateChange((_event, next) => { authEvents += 1; updateSession(next); });
    const initialVersion = authEvents;
    void client.auth.getSession().then(({ data, error }) => { if (authEvents !== initialVersion) return; if (error) { if (active) setStatus("error"); } else updateSession(data.session); }).catch(() => { if (active && authEvents === initialVersion) setStatus("error"); });
    return () => { active = false; sequence.current += 1; engine?.cancel(); data.subscription.unsubscribe(); };
  }, [options.client, engine]);

  useEffect(() => {
    if (!session || options.ready === false) return;
    const timer = setTimeout(() => { void sync(); }, 700);
    return () => clearTimeout(timer);
  }, [session, options.save, options.ready, sync]);

  async function signIn(provider: AccountProviderId, link = false) {
    try { await latest.current.openAuth(provider, link); }
    catch { setStatus("error"); }
  }
  async function signOut() {
    const previousUser = userId.current;
    sequence.current += 1;
    engine?.cancel();
    userId.current = undefined;
    try {
      const { error } = await options.client!.auth.signOut({ scope: "local" });
      if (error) throw error;
      setSession(null); setStatus("signed-out");
    } catch { userId.current = previousUser; setStatus("error"); }
  }
  return { session, status, sync, signIn, signOut };
}

export const ACCOUNT_PROVIDERS: readonly AccountProviderId[] = ["google", "github", "apple"];
export const ACCOUNT_STATUS_COPY = {
  ko: { disabled: "계정 연동을 준비 중입니다. 진행도는 이 기기에 저장됩니다.", "signed-out": "계정을 연결하면 Web과 모바일에서 진행도를 이어갈 수 있습니다.", idle: "계정이 연결되었습니다.", syncing: "진행도를 동기화하고 있습니다.", synced: "진행도를 동기화했습니다.", attribution: "이 기기의 진행도를 계정에 합칠까요? 기존 포획 기록은 함께 보존됩니다.", conflict: "다른 기기에서 서로 다른 직업을 선택했습니다. 유지할 직업 선택을 골라주세요. 양쪽 포획 기록은 보존됩니다.", error: "계정 연결 또는 동기화에 실패했습니다. 기기에서 계속 플레이하고 다시 시도할 수 있습니다." },
  en: { disabled: "Account linking is being prepared. Progress is saved on this device.", "signed-out": "Link an account to continue on Web and mobile.", idle: "Account connected.", syncing: "Syncing progress.", synced: "Progress synced.", attribution: "Merge this device's progress with your account? Existing captures will be kept.", conflict: "Different careers were selected on two devices. Choose which selection to keep. Captures from both devices will be kept.", error: "Account connection or sync failed. Keep playing locally and retry." },
} as const;
