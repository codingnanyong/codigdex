import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene, createButton, setButtonEnabled } from "../ui";
import type { DexEntry } from "./entry";

const ROW_HEIGHT = 36;
const ROW_STEP = ROW_HEIGHT + 6;
/** Rows that fit on the dex screen at once; a longer list scrolls. */
const VISIBLE_ROWS = 7;

export interface EntryListOptions {
  left: number;
  right: number;
  top: number;
  onHover: (index: number) => void;
  onPick: (index: number) => void;
}

/**
 * The right side of the dex: a scrolling window of rows, one per monster, and
 * a capture count underneath. Once the list outgrows the screen it scrolls
 * with ▲▼ or the mouse wheel, and the highlighted row is always kept in view.
 */
export class EntryList {
  private readonly scene: Phaser.Scene;
  private readonly entries: readonly DexEntry[];
  private readonly options: EntryListOptions;
  private readonly upButton?: Phaser.GameObjects.Container;
  private readonly downButton?: Phaser.GameObjects.Container;
  private window?: Phaser.GameObjects.Container;
  private rows: Phaser.GameObjects.Rectangle[] = [];
  private offset = 0;
  private highlighted = 0;

  constructor(scene: Phaser.Scene, entries: readonly DexEntry[], options: EntryListOptions) {
    this.scene = scene;
    this.entries = entries;
    this.options = options;

    const centerX = (options.left + options.right) / 2;
    const statsY = options.top + VISIBLE_ROWS * ROW_STEP + 10;
    const captured = entries.filter((entry) => entry.card).length;
    const released = entries.filter((entry) => !entry.planned).length;
    const planned = entries.length - released;
    scene.add
      .text(centerX, statsY, `등록 ${captured}/${released}  ·  미발견 ${planned}`, {
        ...pixelText("body"),
        color: PALETTE_HEX.sand,
      })
      .setOrigin(0.5, 0);

    if (entries.length > VISIBLE_ROWS) {
      this.upButton = createButton(scene, options.right - 52, statsY + 8, 28, 24, "▲", () => this.scrollBy(-1));
      this.downButton = createButton(scene, options.right - 18, statsY + 8, 28, 24, "▼", () => this.scrollBy(1));

      const onWheel = (_pointer: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number) =>
        this.scrollBy(Math.sign(dy));
      scene.input.on("wheel", onWheel);
      scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.input.off("wheel", onWheel));
    }

    this.render();
  }

  /** Marks `index` as the selected row, scrolling it into view if needed. */
  highlight(index: number) {
    this.highlighted = index;
    if (index < this.offset) {
      this.scrollTo(index);
    } else if (index >= this.offset + VISIBLE_ROWS) {
      this.scrollTo(index - VISIBLE_ROWS + 1);
    } else {
      this.restyleRows();
    }
  }

  private scrollBy(step: number) {
    this.scrollTo(this.offset + step);
  }

  private scrollTo(offset: number) {
    const clamped = Math.min(Math.max(0, this.entries.length - VISIBLE_ROWS), Math.max(0, offset));
    if (clamped === this.offset) {
      this.restyleRows();
      return;
    }
    this.offset = clamped;
    this.render();
  }

  private render() {
    this.window?.destroy(true);
    const { scene, options } = this;
    const width = options.right - options.left;
    const centerX = options.left + width / 2;
    const items: Phaser.GameObjects.GameObject[] = [];
    this.rows = [];

    this.entries.slice(this.offset, this.offset + VISIBLE_ROWS).forEach((entry, slot) => {
      const index = this.offset + slot;
      const rowY = options.top + ROW_HEIGHT / 2 + slot * ROW_STEP;

      const row = scene.add
        .rectangle(centerX, rowY, width, ROW_HEIGHT, PALETTE.ink, 1)
        .setInteractive({ useHandCursor: true });
      // Hovering moves the cursor like a Pokédex list; clicking opens the card.
      row.on("pointerover", () => {
        row.setFillStyle(PALETTE.wood);
        options.onHover(index);
      });
      row.on("pointerout", () => row.setFillStyle(PALETTE.ink));
      row.on("pointerup", () => options.onPick(index));

      const ball = scene.add.graphics({ x: options.left + 22, y: rowY });
      ball.fillStyle(entry.card ? PALETTE.amber : entry.planned ? PALETTE.nightBrown : PALETTE.mutedBrown, 1);
      ball.fillCircle(0, 0, 7);
      ball.lineStyle(2, PALETTE.ink, 1);
      ball.strokeCircle(0, 0, 7);

      const label = scene.add
        .text(options.left + 42, rowY, `No.${entry.dexNumber}  ${entry.card ? entry.card.name : "???"}`, {
          ...pixelText("body"),
          color: entry.card ? PALETTE_HEX.cream : PALETTE_HEX.mutedBrown,
        })
        .setOrigin(0, 0.5);

      this.rows.push(row);
      items.push(row, ball, label);
    });

    this.window = scene.add.container(0, 0, items);
    this.restyleRows();
    if (this.upButton && this.downButton) {
      setButtonEnabled(this.upButton, this.offset > 0);
      setButtonEnabled(this.downButton, this.offset + VISIBLE_ROWS < this.entries.length);
    }
    applyPixelFontToScene(scene);
  }

  private restyleRows() {
    this.rows.forEach((row, slot) =>
      row.setStrokeStyle(2, this.offset + slot === this.highlighted ? PALETTE.amber : PALETTE.mutedBrown)
    );
  }
}
