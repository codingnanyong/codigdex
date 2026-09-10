import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { createButton, drawOrnateFrame, applyPixelFontToScene } from "../ui";
import { getPixelFontFamily } from "../pixelFont";

const INK = PALETTE_HEX.ink;
const NODE_RADIUS = 26;

interface PathNode {
  x: number;
  y: number;
  label: string;
}

// The "공통 도감" leg: tool/concept chapters every job track shares, walked
// after the tutorial. None of these have real content yet, so every node is
// a locked "coming soon" placeholder. Job selection only unlocks once this
// path actually has something to finish — for now everyone stays the
// default job (see DEFAULT_JOB in lib/domain/player/jobs.ts).
const NODES: PathNode[] = [
  { x: 480, y: 400, label: "Git" },
  { x: 480, y: 270, label: "Docker" },
  { x: 480, y: 140, label: "???" },
];

export class PathMapScene extends Phaser.Scene {
  private toast?: Phaser.GameObjects.Text;

  constructor() {
    super("path-map");
  }

  create() {
    const { width, height } = this.scale;

    // Placeholder background — flat fill until a real map illustration
    // exists (like WorldMapScene's "tutorial-loop-path-map" wallpaper).
    // Once one does, preload() + this.add.image(...).setDisplaySize(width,
    // height) here, same pattern as WorldMapScene.
    this.add.rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 1);

    this.add
      .text(width / 2, 36, "공통 도감 · 다음 여정을 준비 중이에요", {
        fontFamily: getPixelFontFamily(),
        fontSize: "15px",
        color: PALETTE_HEX.cream,
      })
      .setOrigin(0.5);

    this.drawPath();
    NODES.forEach((node) => this.drawNode(node));

    createButton(this, width / 2, height - 40, 160, 38, "돌아가기", () =>
      this.scene.start("world-map")
    );

    applyPixelFontToScene(this);
  }

  private drawPath() {
    const g = this.add.graphics();
    g.lineStyle(3, PALETTE.mutedBrown, 0.6);
    for (let i = 0; i < NODES.length - 1; i++) {
      g.lineBetween(NODES[i].x, NODES[i].y, NODES[i + 1].x, NODES[i + 1].y);
    }
  }

  private drawNode(node: PathNode) {
    const circle = this.add
      .circle(node.x, node.y, NODE_RADIUS, PALETTE.mutedBrown, 0.5)
      .setStrokeStyle(3, PALETTE.ink)
      .setInteractive({ useHandCursor: true });

    const labelY = node.y + NODE_RADIUS + 20;
    drawOrnateFrame(this, node.x, labelY, 220, 30, { radius: 8 });
    this.add
      .text(node.x, labelY, node.label, {
        fontFamily: getPixelFontFamily(),
        fontSize: "11px",
        color: INK,
      })
      .setOrigin(0.5);

    circle.on("pointerup", () => this.showToast("아직 잠겨 있어요. 곧 공개됩니다!"));
  }

  private showToast(message: string) {
    this.toast?.destroy();
    const { width, height } = this.scale;
    this.toast = this.add
      .text(width / 2, height - 90, message, {
        fontFamily: getPixelFontFamily(),
        fontSize: "12px",
        color: PALETTE_HEX.cream,
        backgroundColor: "#2a1d14cc",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: this.toast,
      alpha: { from: 1, to: 0 },
      delay: 1200,
      duration: 400,
      onComplete: () => this.toast?.destroy(),
    });
  }
}
