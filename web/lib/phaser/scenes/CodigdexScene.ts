import Phaser from "phaser";
import {
  CAREER_CATALOG,
  careerEmblemTextureKey,
  type CareerId,
} from "@codigdex/game-content/domain/careerDex";
import {
  findJob,
  findSecondaryJob,
  findTertiaryJob,
  JOB_REGISTRY_KEY,
  SECONDARY_JOB_REGISTRY_KEY,
  TERTIARY_JOB_REGISTRY_KEY,
} from "@codigdex/game-content/domain/player/jobs";
import { assetUrl } from "../../assets";
import { CareerPanel } from "../dex/careerPanel";
import { DetailCard } from "../dex/detailCard";
import { t } from "../i18n";
import {
  buildDexEntries,
  cardsForDexDisplay,
  initialDexMonsters,
  type DexEntry,
} from "../dex/entry";
import { EntryList } from "../dex/entryList";
import { PreviewPane } from "../dex/previewPane";
import { DEX_FOOTER, dexFooterLayout, drawDexShell } from "../dex/shell";
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
  private careerAssetsLoading = false;
  private readonly monsterArtLoads = new Map<
    string,
    { event: string; complete: () => void; callbacks: Set<() => void> }
  >();

  constructor() {
    super("codigdex");
  }

  init(data?: CodigdexData) {
    this.returnTo = data?.returnTo ?? "world-map";
  }

  preload() {
    // Load only the initially selected card. Other captured art is fetched on
    // demand as the cursor reaches it, so a mature save with 100+ cards opens
    // just as quickly as a new save.
    const savedCards = readDexState(this.registry).cards;
    const displayCards = cardsForDexDisplay(savedCards, process.env.NODE_ENV === "development");
    this.entries = buildDexEntries(displayCards);
    this.selectedIndex = Math.max(0, this.entries.findIndex((entry) => entry.card));
    preloadMonsterArt(this, initialDexMonsters(this.entries, this.selectedIndex));
  }

  create() {
    this.scene.bringToTop();
    this.careerPanel = undefined;
    this.careerAssetsLoading = false;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.monsterArtLoads.forEach(({ event, complete }) => this.load.off(event, complete));
      this.monsterArtLoads.clear();
    });
    addShade(this, 1);
    const screen = drawDexShell(this);
    const bodyTop = screen.top + 52;
    const footer = dexFooterLayout(screen);

    this.detail = new DetailCard(this);
    this.preview = new PreviewPane(this, screen.left + 16 + PREVIEW_COLUMN / 2, bodyTop);
    this.list = new EntryList(this, this.entries, {
      left: screen.left + 16 + PREVIEW_COLUMN + 16,
      right: screen.left + screen.width - 16,
      top: bodyTop,
      onHover: (index) => this.select(index),
      onPick: (index) => this.pick(index),
    });
    this.showPreview(this.selectedIndex);
    this.list.highlight(this.selectedIndex);

    createButton(
      this,
      screen.centerX + 66,
      footer.buttonY,
      100,
      DEX_FOOTER.buttonHeight,
      t(this, "common.close"),
      () => this.close()
    );
    createButton(
      this,
      screen.centerX - 66,
      footer.buttonY,
      120,
      DEX_FOOTER.buttonHeight,
      t(this, "dex.lineage"),
      () => this.openCareerLineage()
    );
    createHomeButton(this).setDepth(30);

    createButton(this, screen.left + 58, screen.top + 22, 88, 28, t(this, "dex.tabMonsters"), () => {
      this.careerPanel?.destroy();
      this.careerPanel = undefined;
    }).setDepth(20);
    createButton(this, screen.left + 152, screen.top + 22, 88, 28, t(this, "dex.tabCareers"), () => {
      this.showCareerPanel(screen, bodyTop, footer.contentBottom);
    }).setDepth(20);

    applyPixelFontToScene(this);
  }

  private showCareerPanel(
    screen: ReturnType<typeof drawDexShell>,
    bodyTop: number,
    contentBottom: number
  ) {
    const missingEmblems = CAREER_CATALOG.filter(
      (career) => !this.textures.exists(careerEmblemTextureKey(career.id))
    );
    if (missingEmblems.length > 0) {
      if (this.careerAssetsLoading) return;
      this.careerAssetsLoading = true;
      missingEmblems.forEach((career) =>
        this.load.image(careerEmblemTextureKey(career.id), assetUrl(career.emblemAssetKey))
      );
      this.load.once(Phaser.Loader.Events.COMPLETE, () => {
        this.careerAssetsLoading = false;
        if (this.sys.isActive()) this.showCareerPanel(screen, bodyTop, contentBottom);
      });
      this.load.start();
      return;
    }

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
        bottom: contentBottom,
      },
      state,
      activeIds
    );
  }

  private select(index: number) {
    if (index === this.selectedIndex) return;
    this.selectedIndex = index;
    this.list.highlight(index);
    this.showPreview(index);
  }

  private pick(index: number) {
    this.select(index);
    const { monster, card } = this.entries[index];
    if (monster && card) {
      this.ensureMonsterArt(monster, () => this.detail.open(monster, card));
    }
  }

  private showPreview(index: number) {
    const entry = this.entries[index];
    this.preview.show(entry);
    if (!entry.card || !entry.monster) return;
    this.ensureMonsterArt(entry.monster, () => {
      if (this.selectedIndex === index) this.preview.show(entry);
    });
  }

  private ensureMonsterArt(monster: NonNullable<DexEntry["monster"]>, onReady: () => void) {
    if (this.textures.exists(monster.textureKey)) {
      onReady();
      return;
    }
    const pending = this.monsterArtLoads.get(monster.textureKey);
    if (pending) {
      pending.callbacks.add(onReady);
      return;
    }
    const event = `filecomplete-image-${monster.textureKey}`;
    const callbacks = new Set([onReady]);
    const complete = () => {
      this.monsterArtLoads.delete(monster.textureKey);
      if (!this.sys.isActive()) return;
      callbacks.forEach((callback) => callback());
    };
    this.monsterArtLoads.set(monster.textureKey, { event, complete, callbacks });
    this.load.once(event, complete);
    this.load.image(monster.textureKey, assetUrl(monster.assetKey));
    if (!this.load.isLoading()) this.load.start();
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
