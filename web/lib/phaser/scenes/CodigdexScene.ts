import Phaser from "phaser";
import {
  CAREER_CATALOG,
  careerEmblemTextureKey,
  type CareerId,
} from "@/lib/domain/careerDex";
import { DEX_MONSTERS } from "@/lib/domain/chapters";
import {
  findJob,
  findSecondaryJob,
  findTertiaryJob,
  JOB_REGISTRY_KEY,
  SECONDARY_JOB_REGISTRY_KEY,
  TERTIARY_JOB_REGISTRY_KEY,
} from "@/lib/domain/player/jobs";
import { CareerPanel } from "../dex/careerPanel";
import { DetailCard } from "../dex/detailCard";
import { t } from "../i18n";
import { buildDexEntries, type DexEntry } from "../dex/entry";
import { EntryList } from "../dex/entryList";
import { PreviewPane } from "../dex/previewPane";
import { DEX_PANEL, drawDexShell } from "../dex/shell";
import { preloadMonsterArt } from "../monsterArt";
import { createHomeButton } from "../navigation";
import { readDexState, reconcileCareerDexRegistry } from "../registryAdapter";
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
  private careerPanel?: CareerPanel;

  constructor() {
    super("codigdex");
  }

  init(data?: CodigdexData) {
    this.returnTo = data?.returnTo ?? "world-map";
  }

  preload() {
    preloadMonsterArt(this, DEX_MONSTERS);
    CAREER_CATALOG.forEach((career) =>
      this.load.image(careerEmblemTextureKey(career.id), career.emblemAssetPath)
    );
  }

  create() {
    this.scene.bringToTop();
    this.careerPanel = undefined;
    addShade(this, 1);
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
      screen.centerX + 66,
      screen.centerY + DEX_PANEL.height / 2 - DEX_PANEL.inset - 14,
      100,
      30,
      t(this, "common.close"),
      () => this.close()
    );
    createButton(
      this,
      screen.centerX - 66,
      screen.centerY + DEX_PANEL.height / 2 - DEX_PANEL.inset - 14,
      120,
      30,
      t(this, "dex.lineage"),
      () => this.openCareerLineage()
    );
    createHomeButton(this).setDepth(30);

    createButton(this, screen.left + 58, screen.top + 22, 88, 28, t(this, "dex.tabMonsters"), () => {
      this.careerPanel?.destroy();
      this.careerPanel = undefined;
    }).setDepth(20);
    createButton(this, screen.left + 152, screen.top + 22, 88, 28, t(this, "dex.tabCareers"), () => {
      this.showCareerPanel(screen, bodyTop);
    }).setDepth(20);

    applyPixelFontToScene(this);
  }

  private showCareerPanel(screen: ReturnType<typeof drawDexShell>, bodyTop: number) {
    this.careerPanel?.destroy();
    const state = reconcileCareerDexRegistry(this.registry);
    const activeIds = new Set<CareerId>();
    activeIds.add(findJob(this.registry.get(JOB_REGISTRY_KEY) as string | undefined).id);
    const secondary = findSecondaryJob(
      this.registry.get(SECONDARY_JOB_REGISTRY_KEY) as string | null | undefined
    );
    const tertiary = findTertiaryJob(
      this.registry.get(TERTIARY_JOB_REGISTRY_KEY) as string | null | undefined
    );
    if (secondary) activeIds.add(secondary.id);
    if (tertiary) activeIds.add(tertiary.id);

    this.careerPanel = new CareerPanel(
      this,
      {
        left: screen.left + 8,
        right: screen.left + screen.width - 8,
        top: bodyTop - 6,
        bottom: screen.top + screen.height - 48,
      },
      state,
      activeIds
    );
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
    if (monster && card) this.detail.open(monster, card);
  }

  private close() {
    this.scene.stop();
    this.scene.resume(this.returnTo);
  }

  private openCareerLineage() {
    this.scene.stop(this.returnTo);
    this.scene.start("job-select");
  }
}
