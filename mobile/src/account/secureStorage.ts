import * as SecureStore from "expo-secure-store";

/** JWT sessions may exceed a Keychain value's limit. All chunks remain in secure storage. */
export const secureSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    const header = await SecureStore.getItemAsync(key);
    if (!header) return null;
    if (!header.startsWith("chunks:")) return header;
    const [, generation, countText] = header.split(":");
    const count = Number(countText);
    if (!generation || !Number.isInteger(count) || count < 1 || count > 100) return null;
    const values = await Promise.all(Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(`${key}.${generation}.${index}`)));
    return values.some((value) => value === null) ? null : values.join("");
  },
  async setItem(key: string, value: string) {
    const previous = await SecureStore.getItemAsync(key);
    const generation = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const chunks = value.match(/[\s\S]{1,1500}/g) ?? [""];
    if (chunks.length > 100) throw new Error("Session exceeds secure storage limit");
    await Promise.all(chunks.map((chunk, index) => SecureStore.setItemAsync(`${key}.${generation}.${index}`, chunk)));
    await SecureStore.setItemAsync(key, `chunks:${generation}:${chunks.length}`);
    await removeChunks(key, previous);
  },
  async removeItem(key: string) {
    const previous = await SecureStore.getItemAsync(key);
    await SecureStore.deleteItemAsync(key);
    await removeChunks(key, previous);
  },
};

async function removeChunks(key: string, header: string | null) {
  if (!header?.startsWith("chunks:")) return;
  const [, generation, count] = header.split(":");
  const size = Number(count);
  if (!generation || !Number.isInteger(size) || size < 1 || size > 100) return;
  await Promise.all(Array.from({ length: size }, (_, index) => SecureStore.deleteItemAsync(`${key}.${generation}.${index}`)));
}
