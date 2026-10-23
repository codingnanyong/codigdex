"use client";

import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { ACCOUNT_PROVIDERS, ACCOUNT_STATUS_COPY, useAccount } from "@codigdex/game-account";
import { applySaveToRegistry, SAVE_CHANGE_EVENT, snapshotRegistry, SAVE_STORAGE_KEY, persistRegistry } from "@/lib/phaser/registryAdapter";
import { announceLocale } from "@/lib/phaser/i18n";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import { getBrowserSupabase } from "@/lib/account/client";

export function AccountPanel({ game, locale }: { game: Phaser.Game; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [save, setSave] = useState(() => snapshotRegistry(game.registry));
  const [saveFailed, setSaveFailed] = useState(false);
  const client = getBrowserSupabase();
  const account = useAccount({
    client, save,
    storage: { async getItem(key) { return localStorage.getItem(key); }, async setItem(key, value) { localStorage.setItem(key, value); } },
    async writeSave(next) {
      // Fail before changing live state if storage is unavailable.
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(next));
      applySaveToRegistry(game.registry, next);
      setSave(next);
      announceLocale(next.ui.locale ?? locale);
      for (const scene of game.scene.getScenes(true)) {
        if (!["code-battle", "capture-quiz"].includes(scene.sys.settings.key)) scene.scene.restart();
      }
    },
    async openAuth(provider, link) {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const result = link ? await client!.auth.linkIdentity({ provider, options: { redirectTo } }) : await client!.auth.signInWithOAuth({ provider, options: { redirectTo } });
      if (result.error) throw result.error;
    },
  });
  const sync = account.sync;
  const previousUser = useRef<string | undefined>(undefined);
  const sessionUserId = account.session?.user.id;
  useEffect(() => {
    if (previousUser.current === sessionUserId) return;
    previousUser.current = sessionUserId;
    // Cancel any in-flight battle before a different account's save is applied.
    for (const scene of game.scene.getScenes(false)) scene.scene.stop();
    game.scene.start("intro");
  }, [game, sessionUserId]);
  useEffect(() => {
    const update = () => { const next = snapshotRegistry(game.registry); setSave((current) => JSON.stringify(current) === JSON.stringify(next) ? current : next); };
    const failed = () => setSaveFailed(true);
    const saved = () => { update(); setSaveFailed(false); };
    window.addEventListener(SAVE_CHANGE_EVENT, saved);
    window.addEventListener("codigdex-save-error", failed);
    const resume = () => { if (document.visibilityState === "visible") void sync(); };
    const online = () => { void sync(); };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", online);
    return () => { window.removeEventListener(SAVE_CHANGE_EVENT, saved); window.removeEventListener("codigdex-save-error", failed); document.removeEventListener("visibilitychange", resume); window.removeEventListener("online", online); };
  }, [game, sync]);
  const ko = locale === "ko";
  const busy = account.status === "syncing";
  return <div className="account-menu">
    <button aria-expanded={open} onClick={() => setOpen(!open)}>{ko ? "계정 · 저장" : "ACCOUNT · SAVE"}</button>
    {saveFailed && !open ? <p role="alert"><button onClick={() => persistRegistry(game.registry)}>{ko ? "저장 실패 · 다시 저장" : "SAVE FAILED · RETRY"}</button></p> : null}
    {open ? <section className="account-panel" aria-label={ko ? "계정과 저장" : "Account and save"}>
      <button onClick={() => setOpen(false)}>{ko ? "닫기" : "CLOSE"}</button>
      <p aria-live="polite">{ACCOUNT_STATUS_COPY[locale][account.status]}</p>
      {account.session ? <>
        <p>{account.session.user.email ?? account.session.user.id}</p>
        {account.status === "attribution" ? <button disabled={busy} onClick={() => void account.sync(true)}>{ko ? "이 기기 진행도와 합치기" : "MERGE DEVICE PROGRESS"}</button> : null}
        {account.status === "conflict" ? <><button onClick={() => void account.sync(false, "local")}>{ko ? "이 기기 직업 유지" : "KEEP THIS DEVICE'S CAREER"}</button><button onClick={() => void account.sync(false, "remote")}>{ko ? "클라우드 직업 사용" : "USE CLOUD CAREER"}</button></> : null}
        <button disabled={busy} onClick={() => void account.sync()}>{ko ? "지금 동기화" : "SYNC NOW"}</button>
        {ACCOUNT_PROVIDERS.filter((provider) => !account.session!.user.identities?.some((identity) => identity.provider === provider)).map((provider) => <button key={provider} disabled={busy} onClick={() => void account.signIn(provider, true)}>{provider.toUpperCase()} {ko ? "연결 추가" : "LINK"}</button>)}
        <button disabled={busy} onClick={() => void account.signOut()}>{ko ? "로그아웃 · 기기 기록 유지" : "SIGN OUT · KEEP DEVICE SAVE"}</button>
      </> : client ? ACCOUNT_PROVIDERS.map((provider) => <button key={provider} onClick={() => void account.signIn(provider)}>{provider.toUpperCase()} {ko ? "로그인" : "SIGN IN"}</button>) : null}
      {saveFailed ? <><p role="alert">{ko ? "기기 저장에 실패했습니다." : "Device save failed."}</p><button onClick={() => persistRegistry(game.registry)}>{ko ? "다시 저장" : "RETRY SAVE"}</button></> : null}
      <p>{ko ? "로그아웃해도 이 기기의 기록은 유지됩니다. 다른 계정으로 전환할 때 기록을 자동으로 합치지 않습니다." : "Signing out keeps the device save. Switching accounts never automatically merges their progress."}</p>
    </section> : null}
  </div>;
}
