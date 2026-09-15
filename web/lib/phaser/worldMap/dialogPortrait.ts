import type Phaser from "phaser";

/** Builds an upper-body cutout that can break out above a cinematic dialog bar. */
export function createDialogPortrait(
  scene: Phaser.Scene,
  textureKey: string,
  x: number,
  y: number,
  width = 176,
  height = 184
): Phaser.GameObjects.Image[] {
  const source = scene.textures.get(textureKey).getSourceImage() as {
    width: number;
    height: number;
  };
  const cropX = Math.round(source.width * 0.15);
  const cropY = Math.round(source.height * 0.03);
  const cropWidth = Math.round(source.width * 0.7);
  const cropHeight = Math.round(source.height * 0.64);
  const portrait = scene.add
    .image(x, y, textureKey)
    .setCrop(cropX, cropY, cropWidth, cropHeight)
    .setOrigin(
      (cropX + cropWidth / 2) / source.width,
      (cropY + cropHeight / 2) / source.height
    )
    .setScale(width / cropWidth, height / cropHeight);

  return [portrait];
}
