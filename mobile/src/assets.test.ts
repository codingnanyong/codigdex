import { expect, it, vi } from "vitest";
import { mobileAssetSource } from "./assets";
const resolve = vi.hoisted(() => vi.fn(() => 42));
vi.mock("./assets.generated", () => ({ MOBILE_ASSETS: { "monsters/example.png": resolve } }));
it("initializes only requested artwork and rejects missing assets before resolution", () => {
  expect(resolve).not.toHaveBeenCalled();
  expect(() => mobileAssetSource("missing.png")).toThrow("not bundled");
  expect(() => mobileAssetSource("__proto__")).toThrow("not bundled");
  expect(resolve).not.toHaveBeenCalled();
  expect(mobileAssetSource("monsters/example.png")).toBe(42);
  expect(resolve).toHaveBeenCalledOnce();
});
