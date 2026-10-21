import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SaveProvider } from "@/state/SaveProvider";
import { NativeGame } from "@/game/NativeGame";
import { PixelFontGate } from "@/ui/PixelFontGate";

export default function App() {
  return (
    <SafeAreaProvider>
      <PixelFontGate><SaveProvider>
        <StatusBar hidden />
        <NativeGame />
      </SaveProvider></PixelFontGate>
    </SafeAreaProvider>
  );
}
