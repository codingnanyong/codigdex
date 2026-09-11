import Phaser from "phaser";
import { DEX_MONSTERS } from "@/lib/domain/chapters";
import { DetailCard } from "../dex/detailCard";
import { buildDexEntries, type DexEntry } from "../dex/entry";
import { EntryList } from "../dex/entryList";
import { PreviewPane } from "../dex/previewPane";
import { DEX_PANEL, drawDexShell } from "../dex/shell";
import { preloadMonsterArt } from "../monsterArt";
import { readDexState } from "../registryAdapter";
import { addShade, applyPixelFontToScene, createButton } from "../ui";

const PREVIEW_COLUMN = 240;

interface CodigdexData {
  /** The scene that launched the dex, resumed when it closes. */
  returnTo?: string;
}

/** The dex, launched over a paused map: a Pokédex-style list with a live preview and full cards. */
export class CodigdexScene extends Phaser.Scene {
  private returnTo = "world-map";
  private entries: DexEntry[] = [];
  private selectedIndex = 0;
  private preview!: PreviewPane;
  private list!: EntryList;
  private detail!: DetailCard;

  constructor() {
    super("codigdex");
  }

  init(data?: CodigdexData) {
    this.returnTo = data?.returnTo ?? "world-map";
  }

  preload() {
    preloadMonsterArt(this, DEX_MONSTERS);
  }

  create() {
    addShade(this, 0.7);
    const screen = drawDexShell(this);
    const bodyTop = screen.top + 52;

    this.entries = buildDexEntries(readDexState(this.registry).cards);
    this.selectedIndex = Math.max(0, this.entries.findIndex((entry) => entry.card));

    this.detail = new DetailCard(this);
    this.preview = new PreviewPane(this, screen.left + 16 + PREVIEW_COLUMN / 2, bodyTop);
    this.list = new EntryList(this, this.entries, {
      left: screen.left + 16 + PREVIEW_COLUMN + 16,
      right: screen.left + screen.width - 16,
      top: bodyTop,
      onHover: (index) => this.select(index),
      onPick: (index) => this.pick(index),
    });
    this.preview.show(this.entries[this.selectedIndex]);
    this.list.highlight(this.selectedIndex);

    createButton(
      this,
      screen.centerX,
      screen.centerY + DEX_PANEL.height / 2 - DEX_PANEL.inset - 14,
      100,
      30,
      "닫기",
      () => this.close()
    );

    applyPixelFontToScene(this);
  }

  private select(index: number) {
    if (index === this.selectedIndex) return;
    this.selectedIndex = index;
    this.list.highlight(index);
    this.preview.show(this.entries[index]);
  }

  private pick(index: number) {
    this.select(index);
    const { monster, card } = this.entries[index];
    if (card) this.detail.open(monster, card);
  }

  private close() {
    this.scene.stop();
    this.scene.resume(this.returnTo);
  }
}
