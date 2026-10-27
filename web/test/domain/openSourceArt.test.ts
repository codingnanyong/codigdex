import { createHash } from "node:crypto";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { OPEN_SOURCE_CATALOG } from "@codigdex/game-content/domain/openSourceCatalog";
import { ASSET_KEYS } from "@codigdex/game-assets/manifest";

describe("open-source creature sprites", () => {
  it("provides a distinct transparent 64px-grid, 16-color production sprite for every catalog entry", async () => {
    const hashes = new Set<string>();
    const keys = new Set<string>();
    for (const entry of OPEN_SOURCE_CATALOG) {
      expect(entry.character.artStatus).toBe("ready");
      const key = entry.character.assetKey!;
      expect(key).toBe(`characters/open-source/${entry.id}-v1.png`);
      expect(ASSET_KEYS).toContain(key);
      keys.add(key);
      const { data, info } = await sharp(path.resolve(import.meta.dirname, "../../../packages/game-assets/files", key)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      expect([info.width, info.height], key).toEqual([256, 256]);
      const colors = new Set<string>();
      let visible = 0, aligned = true, binary = true, safe = true;
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
        const offset = (y * 256 + x) * 4;
        const pixel = data.subarray(offset, offset + 4);
        const reference = ((y - y % 4) * 256 + x - x % 4) * 4;
        if (!pixel.equals(data.subarray(reference, reference + 4))) aligned = false;
        if (pixel[3] !== 0 && pixel[3] !== 255) binary = false;
        if (pixel[3]) {
          visible++;
          colors.add(pixel.toString("hex"));
          if (x < 16 || x >= 240 || y < 16 || y >= 240) safe = false;
        }
      }
      expect(aligned, key).toBe(true);
      expect(binary, key).toBe(true);
      expect(safe, key).toBe(true);
      expect(visible, key).toBeGreaterThan(1000);
      expect(colors.size, key).toBeLessThanOrEqual(16);
      hashes.add(createHash("sha256").update(data).digest("hex"));
    }
    expect(keys.size).toBe(OPEN_SOURCE_CATALOG.length);
    expect(hashes.size).toBe(OPEN_SOURCE_CATALOG.length);
  });
});
