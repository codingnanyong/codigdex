import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncSaveStorage } from "./saveStorage";
import { QA_ENABLED, qaFaults } from "../qa/runtime";

export const mobileSaveStorage = createAsyncSaveStorage({
  getItem: (key) => AsyncStorage.getItem(key),
  removeItem: (key) => AsyncStorage.removeItem(key),
  async setItem(key, value) {
    qaFaults.beforeSave();
    await AsyncStorage.setItem(key, value);
  },
}, QA_ENABLED ? "qa-sprint04" : undefined);
