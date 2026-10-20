import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const plist = require(require.resolve("@expo/plist", { paths: [require.resolve("expo/config-plugins")] })).default;
const info = plist.parse(readFileSync(path.join(root, "ios/Codigdex/Info.plist"), "utf8"));
const app = JSON.parse(readFileSync(path.join(root, "app.json"), "utf8")).expo;
const delegate = readFileSync(path.join(root, "ios/Codigdex/AppDelegate.swift"), "utf8");
const android = readFileSync(path.join(root, "android/app/src/main/AndroidManifest.xml"), "utf8");
const scene = info.UIApplicationSceneManifest;
function check(value, message) { if (!value) throw new Error(message); }
check(scene?.UIApplicationSupportsMultipleScenes === false, "iOS must use one scene");
check(scene?.UISceneConfigurations?.UIWindowSceneSessionRoleApplication?.[0]?.UISceneDelegateClassName === "EXExpoAppSceneDelegate", "Expo scene delegate is missing");
check(delegate.includes("ExpoAppDelegate, ExpoReactNativeFactoryProvider"), "AppDelegate does not provide its React Native factory");
check(delegate.includes("reactNativeFactory = factory") && !delegate.includes("factory.startReactNative("), "Only the Expo scene delegate may start React Native");
check(app.plugins?.some((plugin) => Array.isArray(plugin) && plugin[0] === "expo-build-properties" && plugin[1]?.ios?.enableSceneSupport), "Prebuild must preserve UIScene support");
check(app.orientation === "default" && info.UISupportedInterfaceOrientations.includes("UIInterfaceOrientationPortrait"), "iOS portrait support is missing");
check(android.includes('android:screenOrientation="unspecified"') && android.includes('android:windowSoftInputMode="adjustResize"'), "Android rotation/keyboard resize configuration is missing");
console.log("Native configuration checks passed (static checks; no native compilation or device launch).");
