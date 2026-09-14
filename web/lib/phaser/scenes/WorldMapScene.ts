import Phaser from "phaser";
import { CHAPTERS, currentStageIndex, isCommonPathComplete } from "@/lib/domain/chapters";
import {
  TUTORIAL_MONSTER,
  TUTORIAL_ONBOARDING_LINES,
} from "@/lib/domain/chapters/tutorial";
import type { ChapterDefinition, MonsterDefinition } from "@/lib/domain/chapters/types";
import {
  findJob,
  guideDisplayName,
  JOB_REGISTRY_KEY,
  OVERWORLD_PLAYER_ASSET_PATH,
  OVERWORLD_PLAYER_TEXTURE_KEY,
  type JobId,
} from "@/lib/domain/player/jobs";
import { capturedIds } from "@/lib/domain/dex/capture";
import { playAmbience } from "../ambience";
import { fitTexture, preloadMonsterArt } from "../monsterArt";
import { PALETTE } from "../palette";
import { PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import {
  ensureDexDefaults,
  readDexState,
  TUTORIAL_ONBOARDING_SEEN_KEY,
} from "../registryAdapter";
import { applyPixelFontToScene, createButton, drawOrnateFrame, showToast } from "../ui";
import { createHomeButton } from "../navigation";
import { drawCareerAtlas } from "../worldMap/careerAtlas";
import {
  careerPathFor,
  careerTerrainAssetPath,
  careerTerrainTextureKey,
} from "../worldMap/careerPaths";
import { showGuideHint } from "../worldMap/guideHint";
import { OnboardingDialog } from "../worldMap/onboarding";
import { showQuestDialog } from "../worldMap/questDialog";
import { QuestMarker } from "../worldMap/questMarker";
import {
  drawChapterRoute,
  routeEntryPointsFor,
  routePointsFor,
  routeTravelPointsFor,
} from "../worldMap/chapterRoute";
import { selectActiveChapter, selectWorldBackdrop, type WorldBackdrop } from "../worldMap/progression";

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
  /** Retained across scene restarts so travel only plays after real progress. */
  private readonly lastRouteIndex = new Map<string, number>();

  constructor() {
    super("world-map");
  }

  preload() {
    // The registry is hydrated at boot, so only this visit's backdrop needs downloading.
    const { backdrop, selectedJob } = this.resolveProgress();
    this.load.image(backdrop.textureKey, backdrop.assetPath);
    this.load.image(OVERWORLD_PLAYER_TEXTURE_KEY, OVERWORLD_PLAYER_ASSET_PATH);
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
    // Scene instances outlive restarts, so drop references to the last run's objects.
    this.quest = undefined;
    this.questDialog = undefined;
    this.guideHint = undefined;
    this.activeChapter = undefined;
    this.activeMonster = undefined;
    this.selectedCareerId = undefined;
    this.toast = undefined;
    this.tutorialTravel = undefined;

    const { captured, storedJob, selectedJob, backdrop } = this.resolveProgress();
    this.captured = captured;
    this.activeChapter = selectActiveChapter(this.captured);
    this.activeMonster = this.activeChapter?.stages[currentStageIndex(this.activeChapter, this.captured)];
    this.selectedCareerId = selectedJob.id === "junior" ? undefined : (selectedJob.id as JobId);

    if (storedJob.id !== selectedJob.id) this.registry.set(JOB_REGISTRY_KEY, selectedJob.id);
    this.add.image(width / 2, height / 2, backdrop.textureKey).setDisplaySize(width, height);
    if (backdrop.ambience) playAmbience(this, backdrop.ambience);

    this.hud = this.createHud(backdrop);
    if (this.activeChapter && this.activeMonster) {
      this.createQuestActors();
    } else if (this.selectedCareerId) {
      this.createCareerAtlas(this.selectedCareerId);
    }
    // Atlas labels and hit areas are created after the HUD. Keep navigation
    // controls in a dedicated top layer so destinations can never cover them.
    this.hud.setDepth(30);
    applyPixelFontToScene(this);

    if (!this.isTutorialCaptured() && this.registry.get(TUTORIAL_ONBOARDING_SEEN_KEY) !== true) {
      this.hud.setAlpha(0);
      const quest = this.quest as QuestMarker | undefined;
      quest?.group.setAlpha(0);
      quest?.setEnabled(false);
      // The quest actors and hidden HUD are already interactive; swallow taps
      // until the dialog's own shade takes over, so onboarding can't be skipped.
      const inputBlocker = this.add
        .rectangle(width / 2, height / 2, width, height, 0x000000, 0)
        .setInteractive()
        .setDepth(20);
      this.time.delayedCall(550, () => {
        inputBlocker.destroy();
        new OnboardingDialog(this, {
          speaker: guideDisplayName(selectedJob),
          lines: TUTORIAL_ONBOARDING_LINES,
          portraitTextureKey: selectedJob.guideTextureKey,
          onFinish: () => this.finishOnboarding(),
        });
      });
    } else if (this.activeMonster) {
      this.time.delayedCall(250, () => this.showHint());
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.quest = undefined;
      this.questDialog = undefined;
      this.guideHint = undefined;
      this.activeChapter = undefined;
      this.activeMonster = undefined;
      this.selectedCareerId = undefined;
      this.toast = undefined;
      this.tutorialTravel = undefined;
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
      onMystery: () => {
        this.toast = showToast(
          this,
          "??? · 다른 1차 직업 경로까지 완성하면 정체가 드러나요.",
          this.toast
        );
      },
    });
  }

  private createHud(backdrop: WorldBackdrop): Phaser.GameObjects.Container {
    const { width, height } = this.scale;

    const chapterFrame = drawOrnateFrame(this, width / 2, 24, 340, 34, { radius: 10 });
    const chapterTitle = this.add
        .text(width / 2, 24, `📘 ${backdrop.title}  ▾`, {
          ...pixelText("body"),
          color: PALETTE_HEX.ink,
        })
        .setOrigin(0.5);
    const chapterHitArea = this.add
      .rectangle(width / 2, 24, 340, 34, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    chapterHitArea.on("pointerover", () => chapterFrame.setAlpha(0.86));
    chapterHitArea.on("pointerout", () => chapterFrame.setAlpha(1));
    chapterHitArea.on("pointerup", () => this.openChapterMap());

    const items: Phaser.GameObjects.GameObject[] = [
      chapterFrame,
      chapterTitle,
      chapterHitArea,
      createHomeButton(this),
    ];
    if (this.isTutorialCaptured()) {
      const onCareerAtlas = this.selectedCareerId !== undefined;
      items.push(
        createButton(
          this,
          onCareerAtlas ? width / 2 : width - 70,
          onCareerAtlas ? height - 24 : 26,
          120,
          32,
          "Codigdex 도감",
          () => this.openCodigdex()
        )
      );
    }
    return this.add.container(0, 0, items);
  }

  private openChapterMap() {
    this.scene.start("path-map", { focusChapterId: this.activeChapter?.id });
  }

  private isTutorialCaptured(): boolean {
    return readDexState(this.registry).cards.some((card) => card.id === TUTORIAL_MONSTER.id);
  }

  private refreshQuest() {
    if (!this.activeChapter || !this.activeMonster) return;
    this.quest?.update(this.questLabel(), false);
  }

  private questLabel(): string {
    if (!this.activeChapter || !this.activeMonster) return "";
    const index = this.activeChapter.stages.indexOf(this.activeMonster);
    return this.activeChapter.id === "tutorial"
      ? `첫 의뢰 · ${this.activeMonster.name}`
      : `${this.activeChapter.label} · ${index + 1}/${this.activeChapter.stages.length} · ${this.activeMonster.name}`;
  }

  private createQuestActors() {
    const { activeChapter: chapter, activeMonster: monster } = this;
    if (!chapter || !monster) return;

    const activeIndex = currentStageIndex(chapter, this.captured);
    const route = routePointsFor(chapter);
    const point = route?.[activeIndex];
    const monsterX = point?.x ?? 604;
    const monsterY = point ? point.y - 98 : 270;
    const npcSide = monsterX < this.scale.width / 2 ? 1 : -1;
    const npcTargetX = point
      ? point.x
      : Phaser.Math.Clamp(monsterX + npcSide * 126, 92, this.scale.width - 92);
    const npcTargetY = point?.y ?? monsterY + 18;
    const actorTextureKey = point ? OVERWORLD_PLAYER_TEXTURE_KEY : "npc-lupi-guide";
    const actorWidth = point ? 41 : 142;
    const actorHeight = point ? 54 : 142;
    const shadowOffsetY = point ? 26 : 67;
    const shadowWidth = point ? 36 : 82;
    const shadowHeight = point ? 10 : 18;
    const lastIndex = this.lastRouteIndex.get(chapter.id);
    const shouldTravel = lastIndex !== undefined && activeIndex === lastIndex + 1;
    const tutorialEntry =
      chapter.id === "tutorial" &&
      this.registry.get(TUTORIAL_ONBOARDING_SEEN_KEY) !== true
        ? routeEntryPointsFor(chapter)
        : undefined;
    this.lastRouteIndex.set(chapter.id, activeIndex);
    const previousPoint = shouldTravel ? route?.[activeIndex - 1] : undefined;
    const npcStartX = tutorialEntry?.[0].x ?? previousPoint?.x ?? npcTargetX;
    const npcStartY = tutorialEntry?.[0].y ?? previousPoint?.y ?? npcTargetY;

    drawChapterRoute(this, chapter, this.captured, activeIndex, () => this.onQuestClicked());

    const npcShadow = this.add
      .ellipse(npcStartX, npcStartY + shadowOffsetY, shadowWidth, shadowHeight, PALETTE.nightBrown, 0.28)
      .setDepth(2);
    const actor = this.add
      .image(npcStartX, npcStartY, actorTextureKey)
      .setDisplaySize(actorWidth, actorHeight)
      .setFlipX(!point && !shouldTravel && npcTargetX > monsterX)
      .setDepth(3);
    if (!point) {
      actor.setInteractive({ useHandCursor: true }).on("pointerup", () => this.onQuestClicked());
    }

    this.add.ellipse(monsterX, monsterY + 62, 100, 20, PALETTE.nightBrown, 0.28).setDepth(2);
    const monsterFit = fitTexture(this, monster.textureKey, 128, 128);
    const monsterImage = this.add
      .image(monsterX, monsterY, monster.textureKey)
      .setScale(monsterFit.scale)
      .setDepth(3)
      .setInteractive({ useHandCursor: true });
    monsterImage.on("pointerup", () => this.onQuestClicked());

    const animateTravel = (routeTravelPoints: readonly { x: number; y: number }[]) => {
      const travelPoints = routeTravelPoints.length > 1
        ? routeTravelPoints.map(
            (travelPoint) => new Phaser.Math.Vector2(travelPoint.x, travelPoint.y)
          )
        : undefined;
      const travelCurve = travelPoints ? new Phaser.Curves.Spline(travelPoints) : undefined;
      const progress = { value: 0 };
      const travelLength = travelCurve?.getLength() ?? 0;
      const duration = Phaser.Math.Clamp((travelLength / 240) * 1_000, 900, 3_200);
      const walkCycles = Math.max(4, Math.round(travelLength / 54));
      this.tweens.add({
        targets: progress,
        value: 1,
        duration,
        ease: "Linear",
        onUpdate: () => {
          const position = travelCurve?.getPointAt(progress.value);
          if (!position) return;
          const nextPosition = travelCurve?.getPointAt(Math.min(1, progress.value + 0.002));
          const step = Math.abs(Math.sin(progress.value * Math.PI * walkCycles));
          actor.setFlipX(Boolean(nextPosition && nextPosition.x < position.x));
          actor.setPosition(position.x, position.y - step * 3);
          npcShadow.setPosition(position.x, position.y + shadowOffsetY);
          npcShadow.setScale(1 - step * 0.08, 1 - step * 0.04);
        },
        onComplete: () => {
          actor.setPosition(npcTargetX, npcTargetY);
          actor.setFlipX(false);
          npcShadow.setPosition(npcTargetX, npcTargetY + shadowOffsetY);
          npcShadow.setScale(1);
        },
      });
    };

    if (shouldTravel && previousPoint) {
      const travelPoints = routeTravelPointsFor(chapter, activeIndex);
      if (travelPoints) animateTravel(travelPoints);
    } else if (tutorialEntry) {
      this.tutorialTravel = () => {
        animateTravel(tutorialEntry);
        this.tutorialTravel = undefined;
      };
    }
    this.tweens.add({
      targets: monsterImage,
      y: "-=5",
      duration: 1100,
      delay: 240,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });

    const labelY = Math.max(92, monsterY - 92);
    if (route) {
      drawOrnateFrame(this, monsterX, labelY, 260, 30, { radius: 8 }).setDepth(4);
      this.add
        .text(monsterX, labelY, this.questLabel(), {
          ...pixelText("body"),
          color: PALETTE_HEX.ink,
        })
        .setOrigin(0.5)
        .setDepth(4);
    } else {
      this.quest = new QuestMarker(this, () => this.onQuestClicked(), {
        x: monsterX,
        y: labelY,
      });
      this.refreshQuest();
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
        this.tutorialTravel?.();
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
        ? "빛나는 첫 의뢰 표식을 눌러 보세요"
        : "루피 또는 현재 몬스터를 눌러 배틀을 시작하세요",
      routePoint ?? { x: 604, y: 270 }
    );
  }

  private onQuestClicked() {
    if (this.questDialog || !this.activeChapter || !this.activeMonster) return;
    this.guideHint?.destroy(true);
    this.guideHint = undefined;

    const monster = this.activeMonster;
    const guide = this.resolveProgress().selectedJob;
    this.questDialog = showQuestDialog(this, {
      speaker: `${guideDisplayName(guide)}:`,
      message: monster.briefing,
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
  }

  private openCodigdex() {
    this.scene.launch("codigdex", { returnTo: this.scene.key });
    this.scene.pause();
  }
}
