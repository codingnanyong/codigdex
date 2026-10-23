import "react-native-url-polyfill/auto";
import "./pkceCrypto";
import { createClient } from "@supabase/supabase-js";
import { secureSessionStorage } from "./secureStorage";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { AccountProviderId } from "@codigdex/game-account";
import { QA_ENABLED } from "../qa/runtime";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// QA progress is isolated from accounts as well as from normal device saves.
export const mobileSupabase = !QA_ENABLED && url && key ? createClient(url, key, { auth: {
  storage: secureSessionStorage,
  flowType: "pkce", autoRefreshToken: true, persistSession: true, detectSessionInUrl: false,
} }) : null;

const redirectTo = "codigdex://auth/callback";
let pendingCode: { code: string; result: Promise<void> } | undefined;
export function finishMobileAuth(callback: string): Promise<void> {
  const parsed = Linking.parse(callback);
  if (parsed.scheme !== "codigdex" || parsed.hostname !== "auth" || parsed.path !== "callback") return Promise.resolve();
  const code = parsed.queryParams?.code;
  if (!mobileSupabase || typeof code !== "string") return Promise.reject(new Error("Authentication was cancelled"));
  if (pendingCode?.code === code) return pendingCode.result;
  const result = mobileSupabase.auth.exchangeCodeForSession(code).then(({ error }) => { if (error) throw error; });
  pendingCode = { code, result };
  return result;
}

export async function openMobileAuth(provider: AccountProviderId, link: boolean) {
  if (!mobileSupabase) return;
  const options = { redirectTo, skipBrowserRedirect: true };
  const result = link ? await mobileSupabase.auth.linkIdentity({ provider, options }) : await mobileSupabase.auth.signInWithOAuth({ provider, options });
  if (result.error || !result.data.url) throw new Error("Could not start authentication");
  const response = await WebBrowser.openAuthSessionAsync(result.data.url, redirectTo);
  if (response.type === "success") await finishMobileAuth(response.url);
}
