import Phaser from "phaser";
import { CHAPTERS, currentStageIndex, isCommonPathComplete } from "@/lib/domain/chapters";
import {
  TUTORIAL_MONSTER,
  TUTORIAL_ONBOARDING_LINES,
} from "@/lib/domain/chapters/tutorial";
import type { ChapterDefinition, MonsterDefinition } from "@/lib/domain/chapters/types";
import { findJob, JOB_REGISTRY_KEY, type JobId } from "@/lib/domain/player/jobs";
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
import { drawCareerAtlas } from "../worldMap/careerAtlas";
import { careerPathFor } from "../worldMap/careerPaths";
import { showGuideHint } from "../worldMap/guideHint";
import { OnboardingDialog } from "../worldMap/onboarding";
import { showQuestDialog } from "../worldMap/questDialog";
import { QuestMarker } from "../worldMap/questMarker";
import { drawChapterRoute, routePointsFor } from "../worldMap/chapterRoute";
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

  constructor() {
    super("world-map");
  }

  preload() {
    // The registry is hydrated at boot, so only this visit's backdrop needs downloading.
    const { backdrop, selectedJob } = this.resolveProgress();
    this.load.image(backdrop.textureKey, backdrop.assetPath);
    this.load.image("npc-lupi-guide", "/assets/npcs/lupi-guide-v1.png");
    if (selectedJob.textureKey && selectedJob.assetPath) {
      this.load.image(selectedJob.textureKey, selectedJob.assetPath);
    }
    if (selectedJob.guideTextureKey && selectedJob.guideAssetPath) {
      this.load.image(selectedJob.guideTextureKey, selectedJob.guideAssetPath);
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
          speaker: "버그 연구원 루피",
          lines: TUTORIAL_ONBOARDING_LINES,
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
    const { width } = this.scale;
    const storedJob = this.registry.get(JOB_REGISTRY_KEY) as string | undefined;
    const job = findJob(isCommonPathComplete(this.captured) ? storedJob : undefined);

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
      createButton(this, 101, 34, 170, 36, `${job.name}  ▶`, () => this.scene.start("job-select")),
    ];
    if (this.isTutorialCaptured()) {
      items.push(createButton(this, width - 70, 26, 120, 32, "Codigdex 도감", () => this.openCodigdex()));
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
    const monsterY = point ? point.y - 68 : 270;
    const npcSide = monsterX < this.scale.width / 2 ? 1 : -1;
    const npcTargetX = Phaser.Math.Clamp(monsterX + npcSide * 126, 92, this.scale.width - 92);
    const npcTargetY = monsterY + 18;
    const previousPoint = route?.[Math.max(0, activeIndex - 1)];
    const npcStartX = activeIndex > 0 && previousPoint ? previousPoint.x : npcTargetX;
    const npcStartY = activeIndex > 0 && previousPoint ? previousPoint.y - 50 : npcTargetY;

    drawChapterRoute(this, chapter, this.captured, activeIndex, () => this.onQuestClicked());

    const npcShadow = this.add.ellipse(npcStartX, npcStartY + 67, 82, 18, PALETTE.nightBrown, 0.28).setDepth(2);
    const npc = this.add
      .image(npcStartX, npcStartY, "npc-lupi-guide")
      .setDisplaySize(142, 142)
      .setDepth(3)
      .setInteractive({ useHandCursor: true });
    npc.on("pointerup", () => this.onQuestClicked());

    this.add.ellipse(monsterX, monsterY + 62, 100, 20, PALETTE.nightBrown, 0.28).setDepth(2);
    const monsterFit = fitTexture(this, monster.textureKey, 128, 128);
    const monsterImage = this.add
      .image(monsterX, monsterY, monster.textureKey)
      .setScale(monsterFit.scale)
      .setDepth(3)
      .setInteractive({ useHandCursor: true });
    monsterImage.on("pointerup", () => this.onQuestClicked());

    if (activeIndex > 0 && previousPoint) {
      this.tweens.add({
        targets: npc,
        x: npcTargetX,
        y: npcTargetY,
        duration: 900,
        ease: "Sine.InOut",
      });
      this.tweens.add({
        targets: npcShadow,
        x: npcTargetX,
        y: npcTargetY + 67,
        duration: 900,
        ease: "Sine.InOut",
      });
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

    const chapter = this.activeChapter;
    const monster = this.activeMonster;
    this.questDialog = showQuestDialog(this, {
      speaker: `${chapter.npcName}:`,
      message: monster.briefing,
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
