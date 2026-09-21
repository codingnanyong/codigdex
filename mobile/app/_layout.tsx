import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SaveProvider } from "@/state/SaveProvider";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Galmuri14: require("galmuri/dist/Galmuri14Bitmap-Regular-2.40.3.ttf"),
  });

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <SaveProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      </SaveProvider>
    </SafeAreaProvider>
  );
}
