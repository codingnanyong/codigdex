import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { applyPixelFontToScene, createButton } from "../ui";
import { getPixelFontFamily } from "../pixelFont";

const CARD_WIDTH = 230;
const CARD_HEIGHT = 92;

type NodeIcon = "git" | "docker" | "unknown";

interface PathNode {
  id: string;
  x: number;
  y: number;
  label: string;
  chapter: string;
  icon: NodeIcon;
}

// Chapters flow left-to-right like a research tree. Future chapters can
// branch vertically by sharing the same tier x-coordinate.
const NODES: PathNode[] = [
  { id: "git", x: 170, y: 310, label: "Git", chapter: "COMMON 01", icon: "git" },
  { id: "docker", x: 480, y: 220, label: "Docker", chapter: "COMMON 02", icon: "docker" },
  { id: "unknown", x: 790, y: 310, label: "???", chapter: "COMING SOON", icon: "unknown" },
];

const EDGES: Array<[string, string]> = [
  ["git", "docker"],
  ["docker", "unknown"],
];

export class PathMapScene extends Phaser.Scene {
  private toast?: Phaser.GameObjects.Text;

  constructor() {
    super("path-map");
  }

  create() {
    const { width, height } = this.scale;

    this.drawMapSurface(width, height);
    this.drawHeader(width);
    this.drawTierLabels();
    this.drawConnections();
    NODES.forEach((node) => this.drawNode(node));

    createButton(this, width / 2, height - 34, 150, 34, "돌아가기", () =>
      this.scene.start("world-map")
    );

    applyPixelFontToScene(this);
  }

  private drawMapSurface(width: number, height: number) {
    this.add.rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 1);

    const grid = this.add.graphics();
    grid.lineStyle(1, PALETTE.wood, 0.14);
    for (let x = 0; x <= width; x += 48) grid.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += 48) grid.lineBetween(0, y, width, y);

    grid.fillStyle(PALETTE.wood, 0.18);
    for (let y = 105; y < height - 60; y += 72) {
      for (let x = 26 + ((y / 72) % 2) * 24; x < width; x += 96) {
        grid.fillRect(x, y, 3, 3);
      }
    }

    const vignette = this.add.graphics();
    vignette.fillStyle(PALETTE.ink, 0.55);
    vignette.fillRect(0, 0, width, 14);
    vignette.fillRect(0, height - 14, width, 14);
    vignette.fillRect(0, 0, 14, height);
    vignette.fillRect(width - 14, 0, 14, height);
    vignette.lineStyle(2, PALETTE.amber, 0.35);
    vignette.strokeRect(15, 15, width - 30, height - 30);
  }

  private drawHeader(width: number) {
    const panel = this.add.graphics();
    panel.fillStyle(PALETTE.ink, 0.92);
    panel.fillRect(130, 18, width - 260, 58);
    panel.lineStyle(2, PALETTE.amber, 0.8);
    panel.strokeRect(130, 18, width - 260, 58);
    panel.fillStyle(PALETTE.amber, 1);
    panel.fillRect(130, 18, width - 260, 5);

    this.add
      .text(width / 2, 34, "COMMON PATH", {
        fontFamily: getPixelFontFamily(),
        fontSize: "9px",
        color: PALETTE_HEX.amber,
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 55, "공통 도감 · 다음 여정을 준비 중이에요", {
        fontFamily: getPixelFontFamily(),
        fontSize: "14px",
        color: PALETTE_HEX.cream,
      })
      .setOrigin(0.5);
  }

  private drawTierLabels() {
    const tiers = [
      { x: 170, label: "FOUNDATION" },
      { x: 480, label: "WORKFLOW" },
      { x: 790, label: "NEXT PATH" },
    ];

    tiers.forEach(({ x, label }) => {
      this.add
        .text(x, 115, label, {
          fontFamily: getPixelFontFamily(),
          fontSize: "9px",
          color: PALETTE_HEX.mutedBrown,
          letterSpacing: 1,
        })
        .setOrigin(0.5);
      this.add.rectangle(x, 130, 170, 2, PALETTE.wood, 0.55);
    });
  }

  private drawConnections() {
    const nodesById = new Map(NODES.map((node) => [node.id, node]));
    const lines = this.add.graphics();

    EDGES.forEach(([fromId, toId]) => {
      const from = nodesById.get(fromId);
      const to = nodesById.get(toId);
      if (!from || !to) return;

      const startX = from.x + CARD_WIDTH / 2;
      const endX = to.x - CARD_WIDTH / 2;
      const elbowX = Math.round((startX + endX) / 2);

      lines.lineStyle(6, PALETTE.ink, 1);
      lines.beginPath();
      lines.moveTo(startX, from.y);
      lines.lineTo(elbowX, from.y);
      lines.lineTo(elbowX, to.y);
      lines.lineTo(endX, to.y);
      lines.strokePath();

      lines.lineStyle(2, PALETTE.sand, 0.85);
      lines.beginPath();
      lines.moveTo(startX, from.y);
      lines.lineTo(elbowX, from.y);
      lines.lineTo(elbowX, to.y);
      lines.lineTo(endX, to.y);
      lines.strokePath();

      lines.fillStyle(PALETTE.amber, 1);
      lines.fillRect(elbowX - 3, from.y - 3, 6, 6);
      lines.fillRect(elbowX - 3, to.y - 3, 6, 6);
    });
  }

  private drawNode(node: PathNode) {
    const card = this.add.container(node.x, node.y);
    const panel = this.add.graphics();

    panel.fillStyle(PALETTE.ink, 0.6);
    panel.fillRect(-CARD_WIDTH / 2 + 5, -CARD_HEIGHT / 2 + 6, CARD_WIDTH, CARD_HEIGHT);
    panel.fillStyle(PALETTE.amber, 1);
    panel.fillRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
    panel.fillStyle(PALETTE.cream, 1);
    panel.fillRect(-CARD_WIDTH / 2 + 4, -CARD_HEIGHT / 2 + 4, CARD_WIDTH - 8, 30);
    panel.fillStyle(PALETTE.wood, 1);
    panel.fillRect(-CARD_WIDTH / 2 + 4, -CARD_HEIGHT / 2 + 34, CARD_WIDTH - 8, CARD_HEIGHT - 38);
    panel.lineStyle(2, PALETTE.ink, 1);
    panel.strokeRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
    panel.fillStyle(PALETTE.maroon, 1);
    panel.fillRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, 7, CARD_HEIGHT);

    const icon = this.drawNodeIcon(node.icon);
    icon.setPosition(-CARD_WIDTH / 2 + 34, 2);

    const chapter = this.add.text(-CARD_WIDTH / 2 + 64, -31, node.chapter, {
      fontFamily: getPixelFontFamily(),
      fontSize: "8px",
      color: PALETTE_HEX.mutedBrown,
    });

    const label = this.add.text(-CARD_WIDTH / 2 + 64, -15, node.label, {
      fontFamily: getPixelFontFamily(),
      fontSize: "13px",
      color: PALETTE_HEX.ink,
    });

    const badgeItems: Phaser.GameObjects.GameObject[] = [];
    [-28, 0, 28].forEach((x, index) => {
      const badge = this.add.circle(x + 20, 25, 9, PALETTE.nightBrown, 0.7);
      badge.setStrokeStyle(1, PALETTE.sand, 0.55);
      const pip = this.add.rectangle(x + 20, 25, index + 3, index + 3, PALETTE.amber, 0.65);
      badgeItems.push(badge, pip);
    });

    const lock = this.add
      .text(CARD_WIDTH / 2 - 22, 24, "◆", {
        fontFamily: getPixelFontFamily(),
        fontSize: "12px",
        color: PALETTE_HEX.sand,
      })
      .setOrigin(0.5);

    card.add([panel, icon, chapter, label, ...badgeItems, lock]);
    card.setSize(CARD_WIDTH, CARD_HEIGHT).setInteractive({ useHandCursor: true });

    card.on("pointerover", () => card.setScale(1.025));
    card.on("pointerout", () => card.setScale(1));
    card.on("pointerdown", () => card.setScale(0.985));
    card.on("pointerup", () => {
      card.setScale(1.025);
      this.showToast(`${node.label} 챕터는 아직 잠겨 있어요.`);
    });
  }

  private drawNodeIcon(icon: NodeIcon) {
    const container = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(PALETTE.nightBrown, 1);
    g.fillCircle(0, 0, 24);
    g.lineStyle(3, PALETTE.amber, 1);
    g.strokeCircle(0, 0, 24);
    g.lineStyle(2, PALETTE.cream, 1);

    if (icon === "git") {
      g.lineBetween(-10, 9, -10, -9);
      g.lineBetween(-10, -1, 9, -11);
      g.fillStyle(PALETTE.amber, 1);
      g.fillCircle(-10, 10, 4);
      g.fillCircle(-10, -10, 4);
      g.fillCircle(10, -12, 4);
    } else if (icon === "docker") {
      g.strokeRect(-13, -11, 9, 8);
      g.strokeRect(-2, -11, 9, 8);
      g.strokeRect(-8, -1, 9, 8);
      g.strokeRect(3, -1, 9, 8);
      g.lineBetween(-15, 12, 14, 12);
    } else {
      const question = this.add
        .text(0, 0, "?", {
          fontFamily: getPixelFontFamily(),
          fontSize: "22px",
          color: PALETTE_HEX.cream,
        })
        .setOrigin(0.5);
      container.add(question);
    }

    container.addAt(g, 0);
    return container;
  }

  private showToast(message: string) {
    this.toast?.destroy();
    const { width, height } = this.scale;
    this.toast = this.add
      .text(width / 2, height - 78, message, {
        fontFamily: getPixelFontFamily(),
        fontSize: "11px",
        color: PALETTE_HEX.cream,
        backgroundColor: "#2a1d14ee",
        padding: { x: 12, y: 7 },
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.tweens.add({
      targets: this.toast,
      alpha: { from: 1, to: 0 },
      delay: 1200,
      duration: 400,
      onComplete: () => this.toast?.destroy(),
    });
  }
}
