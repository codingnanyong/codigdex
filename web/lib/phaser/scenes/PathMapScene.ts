import Phaser from "phaser";
import {
  COMMON_TECHNOLOGY_SPECIMENS,
  TECHNOLOGY_SPECIMENS,
} from "../../domain/technologySpecimens";
import { PALETTE, PALETTE_HEX } from "../palette";
import { applyPixelFontToScene, createButton } from "../ui";
import { pixelText } from "../pixelFont";

type PathNodeKind = "common" | "promotion" | "career";
type NodeIcon = "promotion";

interface PathNode {
  id: string;
  x: number;
  y: number;
  label: string;
  eyebrow: string;
  icon?: NodeIcon;
  spriteKey?: string;
  kind: PathNodeKind;
}

const COMMON_NODES: PathNode[] = [
  { id: "git", x: 115, y: 272, label: "Git", eyebrow: "CH.01", spriteKey: TECHNOLOGY_SPECIMENS.git.textureKey, kind: "common" },
  { id: "terminal", x: 300, y: 272, label: "터미널\nLinux", eyebrow: "CH.02", spriteKey: TECHNOLOGY_SPECIMENS.linux.textureKey, kind: "common" },
];

const PROMOTION_NODE: PathNode = {
  id: "promotion",
  x: 490,
  y: 272,
  label: "전직",
  eyebrow: "PATH SELECT",
  icon: "promotion",
  kind: "promotion",
};

const CAREER_NODES: PathNode[] = [
  { id: "frontend", x: 790, y: 132, label: "웹 프론트엔드 개발자", eyebrow: "WEB", spriteKey: "career-frontend", kind: "career" },
  { id: "backend", x: 790, y: 202, label: "백엔드 개발자", eyebrow: "SERVER", spriteKey: "career-backend", kind: "career" },
  { id: "devops", x: 790, y: 272, label: "DevOps 엔지니어", eyebrow: "INFRA", spriteKey: "career-devops", kind: "career" },
  { id: "data-engineer", x: 790, y: 342, label: "데이터 엔지니어", eyebrow: "DATA", spriteKey: "career-data-engineer", kind: "career" },
  { id: "data-analyst", x: 790, y: 412, label: "데이터 분석가", eyebrow: "ANALYTICS", spriteKey: "career-data-analyst", kind: "career" },
];

const ALL_NODES = [...COMMON_NODES, PROMOTION_NODE, ...CAREER_NODES];
const COMMON_WIDTH = 164;
const COMMON_HEIGHT = 86;
/**
 * Sprite box and text column inside a node. A specimen is not guaranteed to
 * be transparent out to its own edges, so the text column has to clear the
 * full sprite box — not just the medallion circle drawn behind it.
 */
const SPRITE_BOX = { common: 46, career: 44 } as const;
const SPRITE_GAP = 8;
const PROMOTION_SIZE = 92;
const CAREER_WIDTH = 244;
const CAREER_HEIGHT = 54;

export class PathMapScene extends Phaser.Scene {
  private toast?: Phaser.GameObjects.Text;

  constructor() {
    super("path-map");
  }

  preload() {
    COMMON_TECHNOLOGY_SPECIMENS.forEach(({ textureKey, assetPath }) => {
      this.load.image(textureKey, assetPath);
    });
    this.load.image("career-frontend", "/assets/careers/frontend-developer.png");
    this.load.image("career-backend", "/assets/careers/backend-developer.png");
    this.load.image("career-devops", "/assets/careers/devops-engineer.png");
    this.load.image("career-data-engineer", "/assets/careers/data-engineer.png");
    this.load.image("career-data-analyst", "/assets/careers/data-analyst.png");
  }

  create() {
    const { width, height } = this.scale;

    this.drawMapSurface(width, height);
    this.drawHeader(width);
    this.drawSectionLabels();
    this.drawConnections();
    ALL_NODES.forEach((node) => this.drawNode(node));

    createButton(this, width / 2, height - 27, 140, 32, "돌아가기", () =>
      this.scene.start("world-map")
    );

    applyPixelFontToScene(this);
  }

  private drawMapSurface(width: number, height: number) {
    this.add.rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 1);

    const grid = this.add.graphics();
    grid.lineStyle(1, PALETTE.wood, 0.14);
    for (let x = 0; x <= width; x += 32) grid.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += 32) grid.lineBetween(0, y, width, y);

    const frame = this.add.graphics();
    frame.lineStyle(2, PALETTE.amber, 0.42);
    frame.strokeRect(14, 14, width - 28, height - 28);
    frame.lineStyle(1, PALETTE.sand, 0.18);
    frame.strokeRect(20, 20, width - 40, height - 40);
  }

  private drawHeader(width: number) {
    const panel = this.add.graphics();
    panel.fillStyle(PALETTE.ink, 0.95);
    panel.fillRect(170, 18, width - 340, 58);
    panel.lineStyle(2, PALETTE.amber, 0.8);
    panel.strokeRect(170, 18, width - 340, 58);
    panel.fillStyle(PALETTE.amber, 1);
    panel.fillRect(170, 18, width - 340, 4);

    this.add
      .text(width / 2, 34, "JUNIOR DEVELOPER PATH", {
        ...pixelText("caption"),
        color: PALETTE_HEX.amber,
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 56, "공통 기술을 익히고 원하는 직업으로 전직하세요", {
        ...pixelText("body"),
        color: PALETTE_HEX.cream,
      })
      .setOrigin(0.5);
  }

  private drawSectionLabels() {
    this.drawSectionLabel(205, "COMMON", "주니어 공통 과정");
    this.drawSectionLabel(490, "PROMOTION", "전직 선택");
    this.drawSectionLabel(790, "CAREER PATH", "직업별 전문 과정");
  }

  private drawSectionLabel(x: number, english: string, korean: string) {
    this.add
      .text(x, 94, english, {
        ...pixelText("caption"),
        color: PALETTE_HEX.amber,
        letterSpacing: 1,
      })
      .setOrigin(0.5);
    this.add
      .text(x, 110, korean, {
        ...pixelText("caption"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5);
  }

  private drawConnections() {
    const lines = this.add.graphics();
    const drawPath = (points: Array<[number, number]>, active: boolean) => {
      lines.lineStyle(6, PALETTE.ink, 1);
      lines.beginPath();
      lines.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => lines.lineTo(x, y));
      lines.strokePath();

      lines.lineStyle(2, active ? PALETTE.amber : PALETTE.mutedBrown, active ? 0.95 : 0.62);
      lines.beginPath();
      lines.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => lines.lineTo(x, y));
      lines.strokePath();
    };

    // Derived from the node geometry rather than hardcoded, so resizing a
    // card can't leave a connector stubbed short or buried under a panel.
    const [git, terminal] = COMMON_NODES;
    const commonHalf = COMMON_WIDTH / 2;
    drawPath([[git.x + commonHalf, git.y], [terminal.x - commonHalf, terminal.y]], true);
    drawPath(
      [
        [terminal.x + commonHalf, terminal.y],
        [PROMOTION_NODE.x - PROMOTION_SIZE / 2, PROMOTION_NODE.y],
      ],
      true
    );

    const branchX = 620;
    drawPath(
      [
        [PROMOTION_NODE.x + PROMOTION_SIZE / 2, PROMOTION_NODE.y],
        [branchX, PROMOTION_NODE.y],
      ],
      false
    );
    lines.lineStyle(6, PALETTE.ink, 1);
    lines.lineBetween(branchX, CAREER_NODES[0].y, branchX, CAREER_NODES.at(-1)!.y);
    lines.lineStyle(2, PALETTE.mutedBrown, 0.62);
    lines.lineBetween(branchX, CAREER_NODES[0].y, branchX, CAREER_NODES.at(-1)!.y);

    CAREER_NODES.forEach((node) => {
      drawPath([[branchX, node.y], [node.x - CAREER_WIDTH / 2, node.y]], false);
      lines.fillStyle(PALETTE.amber, 0.8);
      lines.fillRect(branchX - 3, node.y - 3, 6, 6);
    });
  }

  private drawNode(node: PathNode) {
    if (node.kind === "promotion") {
      this.drawPromotionNode(node);
      return;
    }

    const width = node.kind === "common" ? COMMON_WIDTH : CAREER_WIDTH;
    const height = node.kind === "common" ? COMMON_HEIGHT : CAREER_HEIGHT;
    const card = this.add.container(node.x, node.y);
    const panel = this.add.graphics();
    const unlocked = node.id === "git";

    panel.fillStyle(PALETTE.ink, 0.7);
    panel.fillRect(-width / 2 + 4, -height / 2 + 5, width, height);
    panel.fillStyle(unlocked ? PALETTE.cream : PALETTE.wood, 1);
    panel.fillRect(-width / 2, -height / 2, width, height);
    panel.lineStyle(2, unlocked ? PALETTE.amber : PALETTE.mutedBrown, 1);
    panel.strokeRect(-width / 2, -height / 2, width, height);
    panel.fillStyle(unlocked ? PALETTE.maroon : PALETTE.nightBrown, 1);
    panel.fillRect(-width / 2, -height / 2, 6, height);

    const spriteBox = node.kind === "common" ? SPRITE_BOX.common : SPRITE_BOX.career;
    const spriteCenterX = -width / 2 + 12 + spriteBox / 2;
    const icon = node.spriteKey
      ? this.drawNodeSprite(node.spriteKey, spriteCenterX, 0, spriteBox, unlocked)
      : this.drawIcon(node.icon!, spriteCenterX, 0, unlocked);
    const textLeft = spriteCenterX + spriteBox / 2 + SPRITE_GAP;
    const eyebrow = this.add
      .text(textLeft, -13, node.eyebrow, {
        ...pixelText("caption"),
        color: unlocked ? PALETTE_HEX.maroon : PALETTE_HEX.sand,
      })
      .setOrigin(0, 0.5);
    const label = this.add
      .text(textLeft, 10, node.label, {
        ...pixelText("body"),
        color: unlocked ? PALETTE_HEX.ink : PALETTE_HEX.cream,
      })
      .setOrigin(0, 0.5);
    const lock = this.add
      .text(width / 2 - 16, 0, unlocked ? "▶" : "◆", {
        ...pixelText("caption"),
        color: unlocked ? PALETTE_HEX.maroon : PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5);

    card.add([panel, icon, eyebrow, label, lock]);
    card.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    card.input!.cursor = "pointer";
    card.on("pointerover", () => card.setScale(1.025));
    card.on("pointerout", () => card.setScale(1));
    card.on("pointerup", () => this.onNodeSelected(node));
  }

  private drawPromotionNode(node: PathNode) {
    const card = this.add.container(node.x, node.y);
    const panel = this.add.graphics();
    const half = PROMOTION_SIZE / 2;
    const diamond = [
      new Phaser.Math.Vector2(0, -half),
      new Phaser.Math.Vector2(half, 0),
      new Phaser.Math.Vector2(0, half),
      new Phaser.Math.Vector2(-half, 0),
    ];

    panel.fillStyle(PALETTE.ink, 0.65);
    panel.fillPoints(diamond.map((point) => new Phaser.Math.Vector2(point.x + 4, point.y + 5)), true);
    panel.fillStyle(PALETTE.maroon, 1);
    panel.fillPoints(diamond, true);
    panel.lineStyle(3, PALETTE.amber, 1);
    panel.strokePoints(diamond, true);

    const icon = this.drawIcon(node.icon!, 0, -13, false);
    const label = this.add
      .text(0, 20, node.label, {
        ...pixelText("body"),
        color: PALETTE_HEX.cream,
      })
      .setOrigin(0.5);

    card.add([panel, icon, label]);
    card.setInteractive(
      new Phaser.Geom.Rectangle(-half, -half, PROMOTION_SIZE, PROMOTION_SIZE),
      Phaser.Geom.Rectangle.Contains
    );
    card.input!.cursor = "pointer";
    card.on("pointerover", () => card.setScale(1.04));
    card.on("pointerout", () => card.setScale(1));
    card.on("pointerup", () => this.onNodeSelected(node));
  }

  private drawIcon(icon: NodeIcon, x: number, y: number, active: boolean) {
    const glyphs: Record<NodeIcon, string> = {
      promotion: "★",
    };
    const circle = this.add.circle(x, y, 18, PALETTE.nightBrown, 1);
    circle.setStrokeStyle(2, active ? PALETTE.amber : PALETTE.mutedBrown, 1);
    const glyph = this.add
      .text(x, y, glyphs[icon], {
        ...pixelText("body"),
        color: active ? PALETTE_HEX.amber : PALETTE_HEX.sand,
      })
      .setOrigin(0.5);
    return this.add.container(0, 0, [circle, glyph]);
  }

  private drawNodeSprite(
    textureKey: string,
    x: number,
    y: number,
    size: number,
    active: boolean
  ) {
    // Specimen art has to be transparent to its edges for this to read as a
    // portrait in a ring rather than a square on a disc — the sprite is drawn
    // at the full box size, wider than the medallion behind it.
    const medallion = this.add.circle(x, y, size / 2 - 2, PALETTE.nightBrown, 1);
    medallion.setStrokeStyle(2, PALETTE.amber, 0.72);

    const portrait = this.add
      .image(x, y + 1, textureKey)
      .setDisplaySize(size, size)
      .setAlpha(active ? 1 : 0.78);

    return this.add.container(0, 0, [medallion, portrait]);
  }

  private onNodeSelected(node: PathNode) {
    if (node.id === "git") {
      this.showToast("CH.01 Git 챕터는 다음 업데이트에서 시작할 수 있어요.");
    } else if (node.kind === "promotion") {
      this.showToast("Git와 터미널·Linux를 완료하면 직업 전직이 열립니다.");
    } else if (node.kind === "career") {
      this.showToast(`${node.label} 전직 경로는 아직 잠겨 있어요.`);
    } else {
      this.showToast(`${node.label} 챕터는 아직 잠겨 있어요.`);
    }
  }

  private showToast(message: string) {
    this.toast?.destroy();
    const { width, height } = this.scale;
    this.toast = this.add
      .text(width / 2, height - 65, message, {
        ...pixelText("body"),
        color: PALETTE_HEX.cream,
        backgroundColor: "#2a1d14f2",
        padding: { x: 12, y: 7 },
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.tweens.add({
      targets: this.toast,
      alpha: { from: 1, to: 0 },
      delay: 1_400,
      duration: 400,
      onComplete: () => this.toast?.destroy(),
    });
  }
}
