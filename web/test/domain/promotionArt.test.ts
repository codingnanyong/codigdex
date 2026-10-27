import { describe, expect, it } from "vitest";
import sharp from "sharp";
import path from "node:path";
import { PROMOTION_MISSIONS } from "@codigdex/game-content/domain/promotionChapters";
import { ASSET_KEYS } from "@codigdex/game-assets/manifest";

describe("tier-two creature and guide art", () => {
  it("ships transparent, limited-color 256px sprites with a shared 64px pixel grid and safe margin", async () => {
    const sprites = Object.values(PROMOTION_MISSIONS).flatMap(({ chapter, guideAssetKey }) => [...chapter.stages.map(({ assetKey }) => assetKey), guideAssetKey]);
    for (const assetKey of sprites) {
      expect(ASSET_KEYS).toContain(assetKey);
      const { data, info } = await sharp(path.resolve(import.meta.dirname, "../../../packages/game-assets/files", assetKey)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      expect([info.width, info.height]).toEqual([256, 256]);
      const colors = new Set<string>();
      let visible = 0;
      let aligned = true;
      let safeMargin = true;
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
        const offset = (y * 256 + x) * 4;
        const pixel = data.subarray(offset, offset + 4);
        const reference = ((y - y % 4) * 256 + x - x % 4) * 4;
        if (!pixel.equals(data.subarray(reference, reference + 4))) aligned = false;
        if (pixel[3]) {
          visible++;
          colors.add(pixel.toString("hex"));
          if (!(x >= 16 && x < 240 && y >= 16 && y < 240)) safeMargin = false;
        }
      }
      expect(visible).toBeGreaterThan(1000);
      expect(aligned).toBe(true);
      expect(safeMargin).toBe(true);
      expect(colors.size).toBeLessThanOrEqual(24);
    }
  });
  it("provides distinct compact opaque 320px chapter backgrounds", async () => {
    const keys = Object.values(PROMOTION_MISSIONS).map(({ chapter }) => chapter.arena!.assetKey);
    expect(new Set(keys).size).toBe(5);
    for (const key of keys) {
      expect(ASSET_KEYS).toContain(key);
      const { data, info } = await sharp(path.resolve(import.meta.dirname, "../../../packages/game-assets/files", key)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      expect([info.width, info.height]).toEqual([320, 180]);
      let opaque = true;
      for (let i = 3; i < data.length; i += 4) if (data[i] !== 255) opaque = false;
      expect(opaque).toBe(true);
    }
  });
});
