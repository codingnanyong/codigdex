import { CryptoDigestAlgorithm, digest, getRandomValues, randomUUID } from "expo-crypto";

// Hermes does not provide WebCrypto. Supply the primitives used by Supabase PKCE
// so native OAuth uses a cryptographic verifier and S256, just like Web.
const nativeCrypto = globalThis.crypto ?? {} as Crypto;
if (typeof nativeCrypto.getRandomValues !== "function") Object.defineProperty(nativeCrypto, "getRandomValues", { value: getRandomValues });
if (typeof nativeCrypto.randomUUID !== "function") Object.defineProperty(nativeCrypto, "randomUUID", { value: randomUUID });
if (!nativeCrypto.subtle) Object.defineProperty(nativeCrypto, "subtle", { value: {
  digest(algorithm: AlgorithmIdentifier, bytes: BufferSource) {
    const name = typeof algorithm === "string" ? algorithm : algorithm.name;
    if (name.toUpperCase() !== "SHA-256") return Promise.reject(new Error("Only SHA-256 is supported by the PKCE adapter"));
    return digest(CryptoDigestAlgorithm.SHA256, bytes);
  },
} });
if (!globalThis.crypto) Object.defineProperty(globalThis, "crypto", { value: nativeCrypto, configurable: true });
