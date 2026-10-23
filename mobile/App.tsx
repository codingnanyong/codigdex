import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SaveProvider } from "@/state/SaveProvider";
import { NativeGame } from "@/game/NativeGame";
import { PixelFontGate } from "@/ui/PixelFontGate";
import { AccountProvider, useGameAccount } from "@/account/AccountPanel";

export default function App() {
  return (
    <SafeAreaProvider>
      <PixelFontGate><SaveProvider><AccountProvider>
        <StatusBar hidden />
        <GameSession />
      </AccountProvider></SaveProvider></PixelFontGate>
    </SafeAreaProvider>
  );
}

function GameSession() {
  const { session } = useGameAccount();
  // An in-flight battle never transfers to another account on sign-in/sign-out.
  return <NativeGame key={session?.user.id ?? "guest"} />;
}
