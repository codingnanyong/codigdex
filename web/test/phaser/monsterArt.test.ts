import { describe, expect, it } from "vitest";
import { fitTextureSize } from "@/lib/phaser/monsterArt";

describe("fitTextureSize", () => {
  it("contains square art without distortion", () => {
    expect(fitTextureSize(256, 256, 176, 176)).toEqual({
      scale: 176 / 256,
      width: 176,
      height: 176,
    });
  });

  it("reserves an even safety inset for near-edge monster pixels", () => {
    expect(fitTextureSize(256, 256, 176, 176, 14)).toEqual({
      scale: 148 / 256,
      width: 148,
      height: 148,
    });
  });

  it("keeps wide art inside both axes after applying the inset", () => {
    expect(fitTextureSize(300, 200, 216, 136, 14)).toEqual({
      scale: 108 / 200,
      width: 162,
      height: 108,
    });
  });
});
