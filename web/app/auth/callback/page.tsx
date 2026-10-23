"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/account/client";
import Link from "next/link";

export default function AuthCallback() {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const client = getBrowserSupabase();
    const code = new URL(window.location.href).searchParams.get("code");
    // A single exchange also survives React StrictMode's repeated effects.
    let active = true;
    if (!client || !code) { queueMicrotask(() => { if (active) setFailed(true); }); return () => { active = false; }; }
    const pending = exchange(client, code);
    void pending.then((ok) => { if (active) { if (ok) window.location.replace("/"); else setFailed(true); } });
    return () => { active = false; };
  }, []);
  return <main style={{ padding: 24 }}><p role="status">{failed ? "계정 연결에 실패했습니다. / Account connection failed." : "계정을 연결하고 있습니다. / Connecting your account."}</p><Link href="/">게임으로 돌아가기 / Return to game</Link></main>;
}

let codeExchange: { code: string; pending: Promise<boolean> } | undefined;
function exchange(client: NonNullable<ReturnType<typeof getBrowserSupabase>>, code: string) {
  if (codeExchange?.code === code) return codeExchange.pending;
  const pending = client.auth.exchangeCodeForSession(code).then(({ error }) => !error, () => false);
  codeExchange = { code, pending };
  return pending;
}
