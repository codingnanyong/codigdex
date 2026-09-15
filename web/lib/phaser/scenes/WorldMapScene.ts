import Phaser from "phaser";
import { CHAPTERS, currentStageIndex, isCommonPathComplete } from "@codigdex/game-content/domain/chapters";
import { TUTORIAL_MONSTER, TUTORIAL_ONBOARDING_LINES } from "@codigdex/game-content/domain/chapters/tutorial";
import type { ChapterDefinition, MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { capturedIds } from "@codigdex/game-core/domain/dex/capture";
import {
  findJob,
  guideDisplayName,
  JOB_REGISTRY_KEY,
  type JobId,
  type JobOption,
} from "@codigdex/game-content/domain/player/jobs";
import { playAmbience } from "../ambience";
import { lt, t } from "../i18n";
import { preloadMonsterArt } from "../monsterArt";
import {
  ensureDexDefaults,
  readDexState,
  TUTORIAL_ONBOARDING_SEEN_KEY,
} from "../registryAdapter";
import { applyPixelFontToScene, showToast } from "../ui";
import { drawCareerAtlas } from "../worldMap/careerAtlas";
import { routePointsFor } from "../worldMap/chapterRoute";
import {
  careerPathFor,
  careerTerrainAssetPath,
  careerTerrainTextureKey,
} from "../worldMap/careerPaths";
import { showGuideHint } from "../worldMap/guideHint";
import { createWorldMapHud } from "../worldMap/hud";
import { OnboardingDialog } from "../worldMap/onboarding";
import { WorldMapPlayer } from "../worldMap/playerMovement";
import {
  selectActiveChapter,
  selectWorldBackdrop,
  shouldEnterPrimaryJobSelection,
} from "../worldMap/progression";
import { showQuestDialog } from "../worldMap/questDialog";
import { QuestMarker } from "../worldMap/questMarker";
import { createQuestStage } from "../worldMap/questStage";

/** Progress-aware waiting screen: onboarding first, then the current chapter or career landscape. */
export class WorldMapScene extends Phaser.Scene {
  private hud!: Phaser.GameObjects.Container;
  private quest?: QuestMarker;
  private questDialog?: Phaser.GameObjects.Container;
  private guideHint?: Phaser.GameObjects.Container;
  private activeChapter?: ChapterDefinition;
  private activeMonster?: MonsterDefinition;
  private captured: ReadonlySet<string> = new Set();
  private selectedCareerId?: JobId;
  private toast?: Phaser.GameObjects.Text;
  private tutorialTravel?: () => void;
  private player?: WorldMapPlayer;
  /** Retained across scene restarts so travel only plays after real progress. */
  private readonly lastRouteIndex = new Map<string, number>();

  constructor() {
    super("world-map");
  }

  preload() {
    const { backdrop, selectedJob } = this.resolveProgress();
    this.load.image(backdrop.textureKey, backdrop.assetPath);
    this.load.image(selectedJob.overworldTextureKey, selectedJob.overworldAssetPath);
    if (selectedJob.textureKey && selectedJob.assetPath) {
      this.load.image(selectedJob.textureKey, selectedJob.assetPath);
    }
    if (selectedJob.guideTextureKey && selectedJob.guideAssetPath) {
      this.load.image(selectedJob.guideTextureKey, selectedJob.guideAssetPath);
    }
    if (selectedJob.id !== "junior") {
      const path = careerPathFor(selectedJob.id as JobId);
      path.regions.forEach((region) => {
        this.load.image(careerTerrainTextureKey(path, region), careerTerrainAssetPath(path, region));
      });
    }
    preloadMonsterArt(this, CHAPTERS.flatMap((chapter) => chapter.stages));
  }

  /** Where the player stands. A career only counts once the common path is complete. */
  private resolveProgress() {
    const captured = capturedIds(readDexState(this.registry));
    const storedJob = findJob(this.registry.get(JOB_REGISTRY_KEY) as string | undefined);
    const selectedJob = isCommonPathComplete(captured) ? storedJob : findJob(undefined);
    const careerId = selectedJob.id === "junior" ? undefined : (selectedJob.id as JobId);
    return { captured, storedJob, selectedJob, backdrop: selectWorldBackdrop(captured, careerId) };
  }

  create() {
    const { width, height } = this.scale;
    ensureDexDefaults(this.registry);
    this.resetSceneReferences();

    const { captured, storedJob, selectedJob, backdrop } = this.resolveProgress();
    this.captured = captured;
    if (shouldEnterPrimaryJobSelection(captured, selectedJob.id)) {
      this.scene.start("job-select");
      return;
    }
    this.activeChapter = selectActiveChapter(this.captured);
    this.activeMonster = this.activeChapter?.stages[currentStageIndex(this.activeChapter, this.captured)];
    this.selectedCareerId = selectedJob.id === "junior" ? undefined : (selectedJob.id as JobId);

    if (storedJob.id !== selectedJob.id) this.registry.set(JOB_REGISTRY_KEY, selectedJob.id);
    this.add.image(width / 2, height / 2, backdrop.textureKey).setDisplaySize(width, height);
    if (backdrop.ambience) playAmbience(this, backdrop.ambience);

    this.hud = createWorldMapHud(this, {
      backdrop,
      tutorialCaptured: this.isTutorialCaptured(),
      careerAtlasVisible: this.selectedCareerId !== undefined,
      onOpenChapterMap: () => this.openChapterMap(),
      onOpenCodigdex: () => this.openCodigdex(),
    });
    if (this.activeChapter && this.activeMonster) {
      this.createQuestActors(selectedJob);
    } else if (this.selectedCareerId) {
      this.createCareerAtlas(this.selectedCareerId);
    }
    this.hud.setDepth(30);
    applyPixelFontToScene(this);

    if (!this.isTutorialCaptured() && this.registry.get(TUTORIAL_ONBOARDING_SEEN_KEY) !== true) {
      this.startOnboarding(selectedJob, width, height);
    } else if (this.activeMonster) {
      this.time.delayedCall(250, () => this.showHint());
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.resetSceneReferences());
  }

  private resetSceneReferences() {
    this.quest = undefined;
    this.questDialog = undefined;
    this.guideHint = undefined;
    this.activeChapter = undefined;
    this.activeMonster = undefined;
    this.selectedCareerId = undefined;
    this.toast = undefined;
    this.tutorialTravel = undefined;
    this.player = undefined;
  }

  private startOnboarding(
    selectedJob: JobOption,
    width: number,
    height: number
  ) {
    this.hud.setAlpha(0);
    this.quest?.group.setAlpha(0);
    this.quest?.setEnabled(false);
    this.setPlayerEnabled(false);
    const inputBlocker = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setInteractive()
      .setDepth(20);
    this.time.delayedCall(550, () => {
      inputBlocker.destroy();
      new OnboardingDialog(this, {
        speaker: lt(this, guideDisplayName(selectedJob)),
        lines: TUTORIAL_ONBOARDING_LINES.map((line) => lt(this, line)),
        portraitTextureKey: selectedJob.guideTextureKey,
        onFinish: () => this.finishOnboarding(),
      });
    });
  }

  private createCareerAtlas(careerId: JobId) {
    const job = findJob(careerId);
    drawCareerAtlas(this, {
      job,
      path: careerPathFor(careerId),
      onRegion: (region) => {
        this.scene.start("career-region", { careerId, regionId: region.id });
      },
      onLocked: (_region, requiredRegion) => {
        this.toast = showToast(
          this,
          t(this, "world.lockedCareerRegion", { region: lt(this, requiredRegion.label) }),
          this.toast
        );
      },
      onMystery: () => {
        this.toast = showToast(this, t(this, "world.mysteryCareer"), this.toast);
      },
    });
  }

  private openChapterMap() {
    this.scene.start("path-map", { focusChapterId: this.activeChapter?.id });
  }

  private isTutorialCaptured(): boolean {
    return readDexState(this.registry).cards.some((card) => card.id === TUTORIAL_MONSTER.id);
  }

  private questLabel(): string {
    if (!this.activeChapter || !this.activeMonster) return "";
    const index = this.activeChapter.stages.indexOf(this.activeMonster);
    return this.activeChapter.id === "tutorial"
      ? t(this, "world.firstQuest", { name: lt(this, this.activeMonster.name) })
      : `${this.activeChapter.label} · ${index + 1}/${this.activeChapter.stages.length} · ${lt(this, this.activeMonster.name)}`;
  }

  private createQuestActors(selectedJob: JobOption) {
    const { activeChapter: chapter, activeMonster: monster } = this;
    if (!chapter || !monster) return;
    const actors = createQuestStage(this, {
      chapter,
      monster,
      captured: this.captured,
      selectedJob,
      questLabel: this.questLabel(),
      onboardingPending: this.registry.get(TUTORIAL_ONBOARDING_SEEN_KEY) !== true,
      lastRouteIndex: this.lastRouteIndex,
      hud: this.hud,
      movementHint: t(this, "world.movementHint"),
      onQuest: () => this.onQuestClicked(),
      onPlayerInteract: (position) => this.onPlayerInteract(position),
    });
    this.player = actors.player;
    this.quest = actors.quest;
    if (actors.tutorialTravel) {
      this.tutorialTravel = () => {
        actors.tutorialTravel?.();
        this.tutorialTravel = undefined;
      };
    }
  }

  private finishOnboarding() {
    this.registry.set(TUTORIAL_ONBOARDING_SEEN_KEY, true);
    this.tweens.add({
      targets: [this.hud, this.quest?.group].filter(Boolean),
      alpha: 1,
      duration: 350,
      delay: 100,
      onComplete: () => {
        this.quest?.setEnabled(true);
        if (this.tutorialTravel) this.tutorialTravel();
        else this.setPlayerEnabled(true);
        this.showHint();
      },
    });
  }

  private showHint() {
    if (this.guideHint || !this.activeMonster) return;
    const activeIndex = this.activeChapter
      ? currentStageIndex(this.activeChapter, this.captured)
      : 0;
    const routePoint = this.activeChapter
      ? routePointsFor(this.activeChapter)?.[activeIndex]
      : undefined;
    this.guideHint = showGuideHint(
      this,
      this.activeChapter?.id === "tutorial"
        ? t(this, "world.hintFirstQuest")
        : t(this, "world.hintStartBattle", {
            guide: lt(
              this,
              this.activeChapter?.npcName ?? guideDisplayName(this.resolveProgress().selectedJob)
            ),
          }),
      routePoint ?? { x: 604, y: 270 }
    );
  }

  private onQuestClicked() {
    if (this.questDialog || !this.activeChapter || !this.activeMonster) return;
    this.guideHint?.destroy(true);
    this.guideHint = undefined;

    const monster = this.activeMonster;
    const guide = this.resolveProgress().selectedJob;
    this.setPlayerEnabled(false);
    this.questDialog = showQuestDialog(this, {
      speaker: `${lt(this, guideDisplayName(guide))}:`,
      message: lt(this, monster.briefing),
      portraitTextureKey: guide.guideTextureKey,
      onStart: () => {
        this.closeQuestDialog();
        this.scene.start("code-battle", { monsterId: monster.id });
      },
      onClose: () => this.closeQuestDialog(),
    });
  }

  private closeQuestDialog() {
    this.questDialog?.destroy(true);
    this.questDialog = undefined;
    this.setPlayerEnabled(true);
  }

  private setPlayerEnabled(enabled: boolean) {
    this.player?.setEnabled(enabled);
  }

  private onPlayerInteract(monsterPosition: { x: number; y: number }) {
    if (!this.player || this.questDialog) return;
    if (this.player.distanceTo(monsterPosition) <= 145) {
      this.onQuestClicked();
      return;
    }
    this.toast = showToast(this, t(this, "world.moveCloser"), this.toast);
  }

  private openCodigdex() {
    this.scene.launch("codigdex", { returnTo: this.scene.key });
    this.scene.pause();
  }
}
