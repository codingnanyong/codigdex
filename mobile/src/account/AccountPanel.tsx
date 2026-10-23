import { createContext, useContext, useEffect, type PropsWithChildren } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { ACCOUNT_PROVIDERS, ACCOUNT_STATUS_COPY, useAccount } from "@codigdex/game-account";
import { useSave } from "../state/SaveProvider";
import { PixelButton } from "../ui/PixelButton";
import { colors, font } from "../ui/theme";
import { mobileSupabase, openMobileAuth, finishMobileAuth } from "./client";

const AccountContext = createContext<ReturnType<typeof useAccount> | null>(null);
export function useGameAccount() { return useContext(AccountContext)!; }

export function AccountProvider({ children }: PropsWithChildren) {
  const { save, replaceSave, hydrated } = useSave();
  const account = useAccount({ client: mobileSupabase, storage: AsyncStorage, save, writeSave: replaceSave, openAuth: openMobileAuth, ready: hydrated });
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") { mobileSupabase?.auth.startAutoRefresh(); void account.sync(); }
      else mobileSupabase?.auth.stopAutoRefresh();
    });
    // Foreground retries also cover returning from an offline session.
    const timer = setInterval(() => { if (AppState.currentState === "active") void account.sync(); }, 30_000);
    const links = Linking.addEventListener("url", ({ url }) => { void finishMobileAuth(url).catch(() => undefined); });
    void Linking.getInitialURL().then((url) => { if (url) void finishMobileAuth(url).catch(() => undefined); });
    return () => { subscription.remove(); links.remove(); clearInterval(timer); mobileSupabase?.auth.stopAutoRefresh(); };
  }, [account.sync]);
  return <AccountContext.Provider value={account}>{children}</AccountContext.Provider>;
}

export function AccountPanel() {
  const account = useGameAccount();
  const { locale } = useSave();
  const ko = locale === "ko";
  const busy = account.status === "syncing";
  return <View style={styles.panel}>
    <Text accessibilityRole="header" style={styles.title}>{ko ? "계정 · 진행도 연동" : "ACCOUNT · PROGRESS SYNC"}</Text>
    <Text accessibilityLiveRegion="polite" style={styles.body}>{ACCOUNT_STATUS_COPY[locale][account.status]}</Text>
    {account.session ? <>
      <Text style={styles.body}>{account.session.user.email ?? account.session.user.id}</Text>
      {account.status === "attribution" ? <PixelButton disabled={busy} onPress={() => void account.sync(true)}>{ko ? "이 기기 진행도와 합치기" : "MERGE DEVICE PROGRESS"}</PixelButton> : null}
      {account.status === "conflict" ? <><PixelButton onPress={() => void account.sync(false, "local")}>{ko ? "이 기기 직업 유지" : "KEEP THIS DEVICE'S CAREER"}</PixelButton><PixelButton onPress={() => void account.sync(false, "remote")}>{ko ? "클라우드 직업 사용" : "USE CLOUD CAREER"}</PixelButton></> : null}
      <PixelButton disabled={busy} onPress={() => void account.sync()}>{ko ? "지금 동기화" : "SYNC NOW"}</PixelButton>
      {ACCOUNT_PROVIDERS.filter((provider) => !account.session!.user.identities?.some((identity) => identity.provider === provider)).map((provider) => <PixelButton key={provider} disabled={busy} variant="secondary" onPress={() => void account.signIn(provider, true)}>{provider.toUpperCase()} {ko ? "연결 추가" : "LINK"}</PixelButton>)}
      <PixelButton disabled={busy} variant="quiet" onPress={() => void account.signOut()}>{ko ? "로그아웃 · 기기 기록 유지" : "SIGN OUT · KEEP DEVICE SAVE"}</PixelButton>
    </> : mobileSupabase ? ACCOUNT_PROVIDERS.map((provider) => <PixelButton key={provider} variant="secondary" onPress={() => void account.signIn(provider)}>{provider.toUpperCase()} {ko ? "로그인" : "SIGN IN"}</PixelButton>) : null}
    <Text style={styles.body}>{ko ? "로그아웃해도 이 기기의 기록은 유지됩니다. 다른 계정으로 전환할 때 기록을 자동으로 합치지 않습니다." : "Signing out keeps the device save. Switching accounts never automatically merges their progress."}</Text>
  </View>;
}

const styles = StyleSheet.create({ panel: { gap: 12, paddingVertical: 14 }, title: { color: colors.text, fontFamily: font, fontSize: 20 }, body: { color: colors.muted, fontFamily: font, fontSize: 15, lineHeight: 23 } });
