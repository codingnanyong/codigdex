import Phaser from "phaser";
import {
  CAREER_CATALOG,
  careerRecord,
  careerStatus,
  type CareerCatalogEntry,
  type CareerDexState,
  type CareerId,
  type CareerStatus,
} from "@/lib/domain/careerDex";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { createCareerEmblem } from "./careerEmblem";
import {
  addShade,
  applyPixelFontToScene,
  createButton,
  drawOrnateFrame,
  fitTextInside,
  popIn,
  setButtonEnabled,
} from "../ui";

interface CareerPanelBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const PREVIEW_WIDTH = 240;
const PORTRAIT_SIZE = 164;
const ROW_HEIGHT = 34;
const ROW_STEP = 40;
const VISIBLE_ROWS = 7;
const STATUS_LABEL: Record<CareerStatus, string> = {
  locked: "LOCKED",
  unlocked: "전직 가능",
  active: "현재 직업",
  mastered: "MASTER",
};
const TIER_LABEL = ["전직 전", "1차 직업", "2차 직업", "3차 직업"] as const;

/** Pokédex-style career collection with a preview, scrolling list, and detail card. */
export class CareerPanel {
  private readonly root: Phaser.GameObjects.Container;
  private preview?: Phaser.GameObjects.Container;
  private listWindow?: Phaser.GameObjects.Container;
  private detailShade?: Phaser.GameObjects.Rectangle;
  private detail?: Phaser.GameObjects.Container;
  private rows: Phaser.GameObjects.Rectangle[] = [];
  private selectedIndex = 0;
  private offset = 0;
  private readonly upButton: Phaser.GameObjects.Container;
  private readonly downButton: Phaser.GameObjects.Container;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bounds: CareerPanelBounds,
    private readonly state: CareerDexState,
    private readonly activeCareerIds: ReadonlySet<CareerId>
  ) {
    const activeIndex = CAREER_CATALOG.findIndex(({ id }) => activeCareerIds.has(id));
    const firstRegisteredIndex = CAREER_CATALOG.findIndex(
      ({ id }) => careerStatus(state, id, activeCareerIds) !== "locked"
    );
    this.selectedIndex = Math.max(0, activeIndex >= 0 ? activeIndex : firstRegisteredIndex);
    this.offset = Phaser.Math.Clamp(
      this.selectedIndex - VISIBLE_ROWS + 1,
      0,
      Math.max(0, CAREER_CATALOG.length - VISIBLE_ROWS)
    );
    const background = scene.add
      .rectangle(
        (bounds.left + bounds.right) / 2,
        (bounds.top + bounds.bottom) / 2,
        bounds.right - bounds.left,
        bounds.bottom - bounds.top,
        PALETTE.nightBrown,
        1
      )
      .setInteractive();
    this.root = scene.add.container(0, 0, [background]).setDepth(10);

    const listLeft = bounds.left + PREVIEW_WIDTH + 18;
    const statsY = bounds.top + VISIBLE_ROWS * ROW_STEP + 7;
    const registered = CAREER_CATALOG.filter(
      ({ id }) => careerStatus(state, id, activeCareerIds) !== "locked"
    ).length;
    const mastered = state.careers.filter((career) => Boolean(career.masteredAt)).length;
    this.root.add(
      scene.add
        .text(listLeft, statsY, `등록 ${registered}/${CAREER_CATALOG.length} · MASTER ${mastered}`, {
          ...pixelText("body"),
          color: PALETTE_HEX.sand,
        })
        .setOrigin(0, 0)
    );
    this.upButton = createButton(scene, bounds.right - 52, statsY + 9, 28, 24, "▲", () =>
      this.scrollBy(-1)
    );
    this.downButton = createButton(scene, bounds.right - 18, statsY + 9, 28, 24, "▼", () =>
      this.scrollBy(1)
    );
    this.root.add([this.upButton, this.downButton]);

    this.renderPreview();
    this.renderList();
    scene.input.on("wheel", this.onWheel, this);
    applyPixelFontToScene(scene);
  }

  destroy() {
    this.closeDetail();
    this.scene.input.off("wheel", this.onWheel, this);
    this.root.destroy(true);
  }

  private readonly onWheel = (
    _pointer: Phaser.Input.Pointer,
    _over: unknown,
    _dx: number,
    dy: number
  ) => this.scrollBy(Math.sign(dy));

  private select(index: number) {
    if (index === this.selectedIndex) return;
    this.selectedIndex = index;
    this.renderPreview();
    this.restyleRows();
  }

  private scrollBy(step: number) {
    const maximum = Math.max(0, CAREER_CATALOG.length - VISIBLE_ROWS);
    const next = Phaser.Math.Clamp(this.offset + step, 0, maximum);
    if (next === this.offset) return;
    this.offset = next;
    this.renderList();
  }

  private renderPreview() {
    this.preview?.destroy(true);
    const entry = CAREER_CATALOG[this.selectedIndex];
    const status = careerStatus(this.state, entry.id, this.activeCareerIds);
    const locked = status === "locked";
    const centerX = this.bounds.left + PREVIEW_WIDTH / 2;
    const portraitY = this.bounds.top + PORTRAIT_SIZE / 2 + 4;
    const items: Phaser.GameObjects.GameObject[] = [
      this.scene.add
        .rectangle(centerX, portraitY, PORTRAIT_SIZE, PORTRAIT_SIZE, PALETTE.ink, 1)
        .setStrokeStyle(2, status === "mastered" ? PALETTE.amber : PALETTE.mutedBrown),
    ];

    items.push(createCareerEmblem(this.scene, entry, status, centerX, portraitY, 144));

    let cursor = this.bounds.top + PORTRAIT_SIZE + 18;
    const addLine = (copy: string, style: Phaser.Types.GameObjects.Text.TextStyle, gap: number) => {
      const line = this.scene.add.text(centerX, cursor, copy, style).setOrigin(0.5, 0);
      items.push(line);
      cursor += line.height + gap;
    };
    addLine(`JOB.${String(this.selectedIndex).padStart(3, "0")} · ${TIER_LABEL[entry.tier]}`, {
      ...pixelText("body"),
      color: PALETTE_HEX.sand,
    }, 3);
    addLine(locked ? "???" : entry.name, {
      ...pixelText("subtitle"),
      color: PALETTE_HEX.cream,
      align: "center",
      wordWrap: { width: PREVIEW_WIDTH - 18 },
    }, 4);
    addLine(STATUS_LABEL[status], {
      ...pixelText("body"),
      color: status === "mastered" || status === "active" ? PALETTE_HEX.amber : PALETTE_HEX.mutedBrown,
    }, 0);

    this.preview = this.scene.add.container(0, 0, items);
    this.root.add(this.preview);
    applyPixelFontToScene(this.scene);
  }

  private renderList() {
    this.listWindow?.destroy(true);
    this.rows = [];
    const items: Phaser.GameObjects.GameObject[] = [];
    const listLeft = this.bounds.left + PREVIEW_WIDTH + 18;
    const listRight = this.bounds.right;
    const centerX = (listLeft + listRight) / 2;
    const width = listRight - listLeft;

    CAREER_CATALOG.slice(this.offset, this.offset + VISIBLE_ROWS).forEach((entry, slot) => {
      const index = this.offset + slot;
      const status = careerStatus(this.state, entry.id, this.activeCareerIds);
      const locked = status === "locked";
      const y = this.bounds.top + ROW_HEIGHT / 2 + slot * ROW_STEP;
      const row = this.scene.add
        .rectangle(centerX, y, width, ROW_HEIGHT, PALETTE.ink, 1)
        .setInteractive({ useHandCursor: true });
      row.on("pointerover", () => {
        row.setFillStyle(PALETTE.wood);
        this.select(index);
      });
      row.on("pointerout", () => row.setFillStyle(PALETTE.ink));
      row.on("pointerup", () => {
        this.select(index);
        if (!locked) this.openDetail(entry, index, status);
      });

      const marker = this.scene.add
        .circle(listLeft + 18, y, 7, this.statusColor(status), 1)
        .setStrokeStyle(2, PALETTE.ink);
      const label = this.scene.add
        .text(listLeft + 36, y, `JOB.${String(index).padStart(3, "0")}  ${locked ? "???" : entry.name}`, {
          ...pixelText("body"),
          color: locked ? PALETTE_HEX.mutedBrown : PALETTE_HEX.cream,
        })
        .setOrigin(0, 0.5);
      fitTextInside(label, width - 145, 18);
      const badge = this.scene.add
        .text(listRight - 10, y, STATUS_LABEL[status], {
          ...pixelText("caption"),
          color: status === "active" || status === "mastered" ? PALETTE_HEX.amber : PALETTE_HEX.mutedBrown,
        })
        .setOrigin(1, 0.5);
      items.push(row, marker, label, badge);
      this.rows.push(row);
    });

    this.listWindow = this.scene.add.container(0, 0, items);
    this.root.add(this.listWindow);
    this.restyleRows();
    setButtonEnabled(this.upButton, this.offset > 0);
    setButtonEnabled(this.downButton, this.offset + VISIBLE_ROWS < CAREER_CATALOG.length);
    applyPixelFontToScene(this.scene);
  }

  private restyleRows() {
    this.rows.forEach((row, slot) =>
      row.setStrokeStyle(2, this.offset + slot === this.selectedIndex ? PALETTE.amber : PALETTE.mutedBrown)
    );
  }

  private openDetail(entry: CareerCatalogEntry, index: number, status: CareerStatus) {
    if (this.detail) return;
    const record = careerRecord(this.state, entry.id);
    const { width, height } = this.scene.scale;
    this.detailShade = addShade(this.scene, 0.78, 30);
    this.detailShade.on("pointerup", () => this.closeDetail());
    const panelWidth = 610;
    const panelHeight = 360;
    const frame = drawOrnateFrame(this.scene, 0, 0, panelWidth, panelHeight);
    const items: Phaser.GameObjects.GameObject[] = [frame];
    items.push(createCareerEmblem(this.scene, entry, status, -220, -82, 112));
    const number = this.scene.add.text(-140, -132, `JOB.${String(index).padStart(3, "0")} · ${TIER_LABEL[entry.tier]}`, {
      ...pixelText("body"),
      color: PALETTE_HEX.mutedBrown,
    });
    const name = this.scene.add.text(-140, -102, entry.name, {
      ...pixelText("subtitle"),
      color: PALETTE_HEX.ink,
    });
    fitTextInside(name, 400, 26);
    const statusText = this.scene.add.text(-140, -65, STATUS_LABEL[status], {
      ...pixelText("body"),
      color: PALETTE_HEX.maroon,
    });
    items.push(number, name, statusText);
    if (entry.guideName) {
      items.push(
        this.scene.add.text(-140, -38, `가이드 · ${entry.guideName}`, {
          ...pixelText("caption"),
          color: PALETTE_HEX.amber,
        })
      );
    }

    const requirementNames = entry.requires.map(
      (id) => CAREER_CATALOG.find((career) => career.id === id)?.name ?? id
    );
    items.push(
      this.scene.add
        .text(0, 18, entry.tagline, {
          ...pixelText("body"),
          color: PALETTE_HEX.ink,
          align: "center",
          wordWrap: { width: panelWidth - 100 },
        })
        .setOrigin(0.5, 0),
      this.scene.add
        .text(0, 72, requirementNames.length ? `전직 조건 · ${requirementNames.join(" + ")}` : "모든 개발자의 시작점", {
          ...pixelText("body"),
          color: PALETTE_HEX.maroon,
          align: "center",
          wordWrap: { width: panelWidth - 80 },
        })
        .setOrigin(0.5, 0),
      this.scene.add
        .text(
          0,
          112,
          record?.masteredAt
            ? `MASTER 등록 · ${new Date(record.masteredAt).toLocaleDateString("ko-KR")}`
            : record?.selectedAt
              ? `최초 전직 · ${new Date(record.selectedAt).toLocaleDateString("ko-KR")}`
              : "도감에 발견된 직업",
          { ...pixelText("caption"), color: PALETTE_HEX.mutedBrown }
        )
        .setOrigin(0.5, 0)
    );
    items.push(createButton(this.scene, 0, 148, 100, 30, "닫기", () => this.closeDetail()));

    this.detail = this.scene.add.container(width / 2, height / 2, items).setDepth(31);
    popIn(this.scene, this.detail);
    applyPixelFontToScene(this.scene);
  }

  private closeDetail() {
    this.detailShade?.destroy();
    this.detailShade = undefined;
    this.detail?.destroy(true);
    this.detail = undefined;
  }

  private statusColor(status: CareerStatus): number {
    if (status === "active") return PALETTE.maroon;
    if (status === "mastered") return PALETTE.amber;
    if (status === "unlocked") return PALETTE.sand;
    return PALETTE.mutedBrown;
  }
}
