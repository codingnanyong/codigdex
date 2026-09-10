import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { createButton, drawOrnateFrame, applyPixelFontToScene } from "../ui";
import { getPixelFontFamily } from "../pixelFont";
import { ensureDexDefaults, readDexState } from "../registryAdapter";
import { NPC_PRE_BATTLE_LINE, TUTORIAL_CHAPTER_TITLE, TUTORIAL_MONSTER } from "@/lib/domain/tutorial/content";
import { findJob, JOB_REGISTRY_KEY } from "@/lib/domain/player/jobs";

const INK = PALETTE_HEX.ink;

export class WorldMapScene extends Phaser.Scene {
  private questMarker!: Phaser.GameObjects.Arc;
  private questLabel!: Phaser.GameObjects.Text;
  private dialogGroup?: Phaser.GameObjects.Container;

  constructor() {
    super("world-map");
  }

  preload() {
    this.load.image(
      "field-guide",
      "/assets/wallpapers/codigdex-field-guide-wallpaper-v3.png"
    );
  }

  create() {
    const { width, height } = this.scale;
    ensureDexDefaults(this.registry);

    const bg = this.add.image(width / 2, height / 2, "field-guide");
    bg.setDisplaySize(width, height);

    drawOrnateFrame(this, width / 2, 24, 340, 34, { radius: 10 });
    this.add
      .text(width / 2, 24, `📘 ${TUTORIAL_CHAPTER_TITLE}`, {
        fontFamily: getPixelFontFamily(),
        fontSize: "11px",
        color: INK,
      })
      .setOrigin(0.5);

    const job = findJob(this.registry.get(JOB_REGISTRY_KEY) as string | undefined);
    drawOrnateFrame(this, 101, 34, 170, 36, { radius: 8 });
    this.add
      .text(101, 34, job.name, {
        fontFamily: getPixelFontFamily(),
        fontSize: "11px",
        color: INK,
      })
      .setOrigin(0.5);

    createButton(this, width - 70, 26, 120, 32, "Codigdex 도감", () =>
      this.openCodigdex()
    );

    this.createQuestMarker();
    applyPixelFontToScene(this);

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
    const y = height / 2 + 40;

    this.questMarker = this.add
      .circle(x, y, 14, PALETTE.maroon, 0.85)
      .setStrokeStyle(2, PALETTE.ink)
      .setInteractive({ useHandCursor: true })
      .setDepth(4);

    drawOrnateFrame(this, x, y - 26, 260, 30, { radius: 8 }).setDepth(4);
    this.questLabel = this.add
      .text(x, y - 26, TUTORIAL_MONSTER.name, {
        fontFamily: getPixelFontFamily(),
        fontSize: "11px",
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

    this.questMarker.on("pointerup", () => this.onQuestMarkerClicked());
    this.refreshQuestMarker();
  }

  private refreshQuestMarker() {
    const card = this.getCapturedCard();
    if (card?.grade === "gold") {
      this.questMarker.setFillStyle(PALETTE.sand, 0.6);
      this.questLabel.setText(`${TUTORIAL_MONSTER.name} (골드 완료)`);
    } else if (card) {
      this.questLabel.setText(`${TUTORIAL_MONSTER.name} (${card.grade} · 재도전 가능)`);
    } else {
      this.questLabel.setText(TUTORIAL_MONSTER.name);
    }
  }

  private onQuestMarkerClicked() {
    if (this.dialogGroup) return;
    this.showQuestDialog();
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
        fontFamily: getPixelFontFamily(),
        fontSize: "12px",
        color: PALETTE_HEX.maroon,
      })
      .setDepth(11);

    const message = card
      ? "이 버그, 아직 반복을 멈추지 않았나 봐요. 다시 한 번 도전해볼까요?"
      : TUTORIAL_MONSTER.questText;

    const body = this.add
      .text(width / 2 - boxWidth / 2 + 20, boxCenterY - boxHeight / 2 + 40, message, {
        fontFamily: getPixelFontFamily(),
        fontSize: "12px",
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
