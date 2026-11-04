import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { PixelScene } from "./PixelScene";
const calls = vi.hoisted(() => ({ source: vi.fn(() => 42), image: vi.fn(() => null) }));
vi.mock("../assets", () => ({ mobileAssetSource: calls.source }));
vi.mock("@shopify/react-native-skia", () => ({ Canvas: () => null, Image: () => null, FilterMode: {}, MipmapMode: {}, useImage: calls.image }));
vi.mock("react-native", () => ({ View: () => null, StyleSheet: { create: (value: unknown) => value } }));
it("passes a resolved numeric asset module to Skia rather than a lazy resolver", () => {
  renderToStaticMarkup(<PixelScene assetKey="wallpapers/tutorial-loop-forest-v1.png" />);
  expect(calls.source).toHaveBeenCalledWith("wallpapers/tutorial-loop-forest-v1.png");
  expect(calls.image).toHaveBeenCalledWith(42);
});
