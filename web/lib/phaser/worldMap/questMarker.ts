import type Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { drawOrnateFrame } from "../ui";

/** The pulsing quest pin over the well, with its label plate above it. */
export class QuestMarker {
  readonly group: Phaser.GameObjects.Container;
  private readonly hitArea: Phaser.GameObjects.Rectangle;
  private readonly pin: Phaser.GameObjects.Arc;
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, onClick: () => void, position?: { x: number; y: number }) {
    const { width, height } = scene.scale;
    const x = position?.x ?? width / 2;
    const y = position?.y ?? height / 2 + 12;

    this.hitArea = scene.add
      .rectangle(x, y - 12, 280, 72, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    this.pin = scene.add.circle(x, y, 14, PALETTE.maroon, 0.85).setStrokeStyle(2, PALETTE.ink);
    const plate = drawOrnateFrame(scene, x, y - 26, 260, 30, { radius: 8 });
    this.label = scene.add
      .text(x, y - 26, "", { ...pixelText("body"), color: PALETTE_HEX.ink })
      .setOrigin(0.5);

    scene.tweens.add({
      targets: this.pin,
      scale: { from: 1, to: 1.35 },
      alpha: { from: 0.7, to: 1 },
      duration: 650,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });

    this.group = scene.add.container(0, 0, [this.hitArea, plate, this.pin, this.label]).setDepth(4);
    this.hitArea.on("pointerup", onClick);
  }

  setEnabled(enabled: boolean) {
    if (!this.isAlive()) return;
    if (enabled) {
      this.hitArea.setInteractive({ useHandCursor: true });
    } else {
      this.hitArea.disableInteractive();
    }
  }

  /** Labels the quest, greying the pin out once its monster is in the dex. */
  update(label: string, captured: boolean) {
    if (!this.isAlive()) return;
    if (captured) {
      this.pin.setFillStyle(PALETTE.sand, 0.6);
      this.label.setText(`${label} (캡처 완료)`);
    } else {
      this.label.setText(label);
    }
  }

  private isAlive(): boolean {
    return this.group.active && this.hitArea.active && this.pin.active && this.label.active && Boolean(this.label.scene);
  }
}
