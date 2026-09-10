import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { createButton, drawOrnateFrame, applyPixelFontToScene } from "../ui";
import { pixelText } from "../pixelFont";
import { ensureDexDefaults, readDexState } from "../registryAdapter";
import {
  NPC_PRE_BATTLE_LINE,
  TUTORIAL_CHAPTER_TITLE,
  TUTORIAL_MONSTER,
  TUTORIAL_ONBOARDING_LINES,
} from "@/lib/domain/tutorial/content";
import { findJob, JOB_REGISTRY_KEY } from "@/lib/domain/player/jobs";

const INK = PALETTE_HEX.ink;
const ONBOARDING_SEEN_KEY = "tutorialOnboardingSeen";

export class WorldMapScene extends Phaser.Scene {
  private questMarker!: Phaser.GameObjects.Arc;
  private questHitArea!: Phaser.GameObjects.Rectangle;
  private questLabel!: Phaser.GameObjects.Text;
  private questGroup!: Phaser.GameObjects.Container;
  private mapHud!: Phaser.GameObjects.Container;
  private dialogGroup?: Phaser.GameObjects.Container;
  private onboardingGroup?: Phaser.GameObjects.Container;
  private onboardingBody?: Phaser.GameObjects.Text;
  private onboardingNextButton?: Phaser.GameObjects.Container;
  private guideHint?: Phaser.GameObjects.Container;
  private onboardingPage = 0;

  constructor() {
    super("world-map");
  }

  preload() {
    this.load.image(
      "tutorial-loop-forest",
      "/assets/wallpapers/tutorial-loop-forest-v1.png"
    );
  }

  create() {
    const { width, height } = this.scale;
    ensureDexDefaults(this.registry);

    const bg = this.add.image(width / 2, height / 2, "tutorial-loop-forest");
    bg.setDisplaySize(width, height);

    const chapterFrame = drawOrnateFrame(this, width / 2, 24, 340, 34, { radius: 10 });
    const chapterTitle = this.add
      .text(width / 2, 24, `📘 ${TUTORIAL_CHAPTER_TITLE}`, {
        ...pixelText("body"),
        color: INK,
      })
      .setOrigin(0.5);

    const job = findJob(this.registry.get(JOB_REGISTRY_KEY) as string | undefined);
    const jobPathButton = createButton(this, 101, 34, 170, 36, `${job.name}  ▶`, () =>
      this.scene.start("path-map")
    );

    const hudItems: Phaser.GameObjects.GameObject[] = [
      chapterFrame,
      chapterTitle,
      jobPathButton,
    ];
    if (this.getCapturedCard()) {
      hudItems.push(
        createButton(this, width - 70, 26, 120, 32, "Codigdex 도감", () =>
          this.openCodigdex()
        )
      );
    }
    this.mapHud = this.add.container(0, 0, hudItems);

    this.createQuestMarker();
    applyPixelFontToScene(this);

    if (this.registry.get(ONBOARDING_SEEN_KEY) !== true) {
      this.mapHud.setAlpha(0);
      this.questGroup.setAlpha(0);
      this.questHitArea.disableInteractive();
      this.time.delayedCall(550, () => this.showOnboarding());
    } else {
      this.time.delayedCall(250, () => this.showGuideHint());
    }

    this.events.on(Phaser.Scenes.Events.RESUME, () => {
      this.refreshQuestMarker();
    });
  }

  private getCapturedCard() {
    const { cards } = readDexState(this.registry);
    return cards.find((card) => card.id === TUTORIAL_MONSTER.id);
  }

  private createQuestMarker() {
    const { width, height } = this.scale;
    const x = width / 2;
    const y = height / 2 + 12;

    this.questHitArea = this.add
      .rectangle(x, y - 12, 280, 72, 0xffffff, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(4);

    this.questMarker = this.add
      .circle(x, y, 14, PALETTE.maroon, 0.85)
      .setStrokeStyle(2, PALETTE.ink)
      .setDepth(4);

    const labelFrame = drawOrnateFrame(this, x, y - 26, 260, 30, { radius: 8 }).setDepth(4);
    this.questLabel = this.add
      .text(x, y - 26, `첫 의뢰 · ${TUTORIAL_MONSTER.name}`, {
        ...pixelText("body"),
        color: INK,
      })
      .setOrigin(0.5)
      .setDepth(4);

    this.tweens.add({
      targets: this.questMarker,
      scale: { from: 1, to: 1.35 },
      alpha: { from: 0.7, to: 1 },
      duration: 650,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });

    this.questGroup = this.add.container(0, 0, [
      this.questHitArea,
      labelFrame,
      this.questMarker,
      this.questLabel,
    ]);

    this.questHitArea.on("pointerup", () => this.onQuestMarkerClicked());
    this.refreshQuestMarker();
  }

  private refreshQuestMarker() {
    const card = this.getCapturedCard();
    if (card) {
      this.questMarker.setFillStyle(PALETTE.sand, 0.6);
      this.questLabel.setText(`${TUTORIAL_MONSTER.name} (캡처 완료)`);
    } else {
      this.questLabel.setText(`첫 의뢰 · ${TUTORIAL_MONSTER.name}`);
    }
  }

  private onQuestMarkerClicked() {
    if (this.dialogGroup) return;
    this.dismissGuideHint();
    this.showQuestDialog();
  }

  private showOnboarding() {
    if (this.onboardingGroup) return;
    const { width, height } = this.scale;
    this.onboardingPage = 0;

    const shade = this.add
      .rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 0.42)
      .setInteractive();
    const frame = drawOrnateFrame(this, width / 2, height - 104, 720, 174, {
      radius: 14,
    });
    const speakerFrame = drawOrnateFrame(this, 190, height - 181, 150, 34, {
      radius: 8,
      fill: PALETTE.sand,
    });
    const speaker = this.add
      .text(190, height - 181, "버그 연구원 루피", {
        ...pixelText("body"),
        color: PALETTE_HEX.maroon,
      })
      .setOrigin(0.5);

    this.onboardingBody = this.add
      .text(140, height - 153, TUTORIAL_ONBOARDING_LINES[0], {
        ...pixelText("body"),
        color: INK,
        wordWrap: { width: 610 },
        lineSpacing: 5,
      })
      .setOrigin(0, 0);

    const pageText = this.add
      .text(width / 2, height - 30, `1 / ${TUTORIAL_ONBOARDING_LINES.length}`, {
        ...pixelText("caption"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5);

    this.onboardingNextButton = createButton(
      this,
      width - 186,
      height - 52,
      120,
      34,
      "다음  ▶",
      () => this.advanceOnboarding(pageText)
    );
    const skipButton = createButton(this, width - 72, 28, 112, 30, "건너뛰기", () =>
      this.finishOnboarding()
    );

    this.onboardingGroup = this.add
      .container(0, 12, [
        shade,
        frame,
        speakerFrame,
        speaker,
        this.onboardingBody,
        pageText,
        this.onboardingNextButton,
        skipButton,
      ])
      .setDepth(20)
      .setAlpha(0);

    this.tweens.add({
      targets: this.onboardingGroup,
      alpha: 1,
      y: 0,
      duration: 260,
      ease: "Quad.Out",
    });

    const advanceWithKeyboard = () => this.advanceOnboarding(pageText);
    this.input.keyboard?.on("keydown-ENTER", advanceWithKeyboard);
    this.input.keyboard?.on("keydown-SPACE", advanceWithKeyboard);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off("keydown-ENTER", advanceWithKeyboard);
      this.input.keyboard?.off("keydown-SPACE", advanceWithKeyboard);
    });
    this.onboardingGroup.setData("keyboardHandler", advanceWithKeyboard);
    applyPixelFontToScene(this);
  }

  private advanceOnboarding(pageText: Phaser.GameObjects.Text) {
    if (!this.onboardingGroup) return;
    if (this.onboardingPage >= TUTORIAL_ONBOARDING_LINES.length - 1) {
      this.finishOnboarding();
      return;
    }

    this.onboardingPage += 1;
    this.onboardingBody?.setText(TUTORIAL_ONBOARDING_LINES[this.onboardingPage]);
    pageText.setText(`${this.onboardingPage + 1} / ${TUTORIAL_ONBOARDING_LINES.length}`);

    if (this.onboardingPage === TUTORIAL_ONBOARDING_LINES.length - 1) {
      const buttonLabel = this.onboardingNextButton?.list[1] as Phaser.GameObjects.Text | undefined;
      buttonLabel?.setText("의뢰 확인");
    }
  }

  private finishOnboarding() {
    if (!this.onboardingGroup) return;
    this.registry.set(ONBOARDING_SEEN_KEY, true);

    const keyboardHandler = this.onboardingGroup.getData("keyboardHandler") as (() => void) | undefined;
    if (keyboardHandler) {
      this.input.keyboard?.off("keydown-ENTER", keyboardHandler);
      this.input.keyboard?.off("keydown-SPACE", keyboardHandler);
    }

    const group = this.onboardingGroup;
    this.onboardingGroup = undefined;
    this.tweens.add({
      targets: group,
      alpha: 0,
      y: 8,
      duration: 180,
      onComplete: () => group.destroy(true),
    });

    this.tweens.add({
      targets: [this.mapHud, this.questGroup],
      alpha: 1,
      duration: 350,
      delay: 100,
      onComplete: () => {
        this.questHitArea.setInteractive({ useHandCursor: true });
        this.showGuideHint();
      },
    });
  }

  private showGuideHint() {
    if (this.guideHint || this.getCapturedCard()) return;
    const { width, height } = this.scale;
    const arrow = this.add
      .text(width / 2 + 154, height / 2 + 19, "◀", {
        ...pixelText("subtitle"),
        color: PALETTE_HEX.maroon,
        stroke: PALETTE_HEX.cream,
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    const instruction = this.add
      .text(width / 2, height - 28, "빛나는 첫 의뢰 표식을 눌러 보세요", {
        ...pixelText("body"),
        color: PALETTE_HEX.cream,
        backgroundColor: "#2a1d14e6",
        padding: { x: 12, y: 7 },
      })
      .setOrigin(0.5);

    this.guideHint = this.add.container(0, 0, [arrow, instruction]).setDepth(8);
    this.tweens.add({
      targets: arrow,
      x: arrow.x - 8,
      duration: 520,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });
    applyPixelFontToScene(this);
  }

  private dismissGuideHint() {
    this.guideHint?.destroy(true);
    this.guideHint = undefined;
  }

  private showQuestDialog() {
    const { width, height } = this.scale;
    const card = this.getCapturedCard();
    const boxWidth = 560;
    const boxHeight = 150;
    const boxCenterY = height - 110;

    const frame = drawOrnateFrame(this, width / 2, boxCenterY, boxWidth, boxHeight, {
      radius: 14,
    }).setDepth(10);

    const speaker = this.add
      .text(width / 2 - boxWidth / 2 + 20, boxCenterY - boxHeight / 2 + 16, `${TUTORIAL_MONSTER.npcName}:`, {
        ...pixelText("body"),
        color: PALETTE_HEX.maroon,
      })
      .setDepth(11);

    const message = card
      ? "이미 도감에 등록한 버그예요. 복습 겸 한 번 더 도전해볼까요?"
      : TUTORIAL_MONSTER.questText;

    const body = this.add
      .text(width / 2 - boxWidth / 2 + 20, boxCenterY - boxHeight / 2 + 40, message, {
        ...pixelText("body"),
        color: INK,
        wordWrap: { width: boxWidth - 40 },
      })
      .setDepth(11);

    const startButton = createButton(
      this,
      width / 2 + boxWidth / 2 - 90,
      boxCenterY + boxHeight / 2 - 24,
      140,
      32,
      "코드 배틀 시작",
      () => this.startBattle()
    );
    startButton.setDepth(11);

    const closeButton = createButton(
      this,
      width / 2 - boxWidth / 2 + 60,
      boxCenterY + boxHeight / 2 - 24,
      80,
      32,
      "닫기",
      () => this.closeDialog()
    );
    closeButton.setDepth(11);

    this.dialogGroup = this.add.container(0, 0, [frame, speaker, body, startButton, closeButton]);
    applyPixelFontToScene(this);
  }

  private closeDialog() {
    this.dialogGroup?.destroy(true);
    this.dialogGroup = undefined;
  }

  private startBattle() {
    this.closeDialog();
    this.scene.start("code-battle", {
      monsterId: TUTORIAL_MONSTER.id,
      npcLine: NPC_PRE_BATTLE_LINE,
    });
  }

  private openCodigdex() {
    this.scene.launch("codigdex", {});
    this.scene.pause();
  }
}
