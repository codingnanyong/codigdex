import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncSaveStorage } from "./saveStorage";
import { E2E_ENABLED, QA_ENABLED, qaFaults } from "../qa/runtime";

export const mobileSaveNamespace = E2E_ENABLED ? "qa-home-e2e" : QA_ENABLED ? "qa-sprint04" : undefined;

export const mobileSaveStorage = createAsyncSaveStorage({
  getItem: (key) => AsyncStorage.getItem(key),
  removeItem: (key) => AsyncStorage.removeItem(key),
  async setItem(key, value) {
    qaFaults.beforeSave();
    await AsyncStorage.setItem(key, value);
  },
}, mobileSaveNamespace);

export const mobileSourceStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  async setItem(key: string, value: string) { qaFaults.beforeSourceSave(); await AsyncStorage.setItem(key, value); },
};
