import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { createButton } from "../ui";
import { getPixelFontFamily, whenPixelFontReady } from "../pixelFont";
import { ensureDexDefaults, readDexState } from "../registryAdapter";
import { NPC_PRE_BATTLE_LINE, TUTORIAL_CHAPTER_TITLE, TUTORIAL_MONSTER } from "@/lib/domain/tutorial/content";

const INK = PALETTE_HEX.ink;

export class WorldMapScene extends Phaser.Scene {
  private hudText!: Phaser.GameObjects.Text;
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

    const header = this.add
      .text(width / 2, 24, `📘 ${TUTORIAL_CHAPTER_TITLE}`, {
        fontFamily: "monospace",
        fontSize: "14px",
        color: INK,
        backgroundColor: "#f1e4cbcc",
        padding: { x: 10, y: 4 },
      })
      .setOrigin(0.5);
    whenPixelFontReady(() => header.setFontFamily(getPixelFontFamily()).setFontSize(11));

    this.hudText = this.add
      .text(16, 16, "", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: PALETTE_HEX.cream,
        backgroundColor: "#2a1d14cc",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0, 0);

    createButton(this, width - 70, 26, 120, 32, "Codigdex 도감", () =>
      this.openCodigdex()
    );

    this.createQuestMarker();
    this.refreshHud();

    this.events.on(Phaser.Scenes.Events.RESUME, () => {
      this.refreshHud();
      this.refreshQuestMarker();
    });
  }

  private refreshHud() {
    const { exp, coins } = readDexState(this.registry);
    this.hudText.setText(`EXP ${exp}   코인 ${coins}`);
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

    this.questLabel = this.add
      .text(x, y - 26, TUTORIAL_MONSTER.name, {
        fontFamily: "monospace",
        fontSize: "12px",
        color: INK,
        backgroundColor: "#f1e4cbcc",
        padding: { x: 6, y: 2 },
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

    const panel = this.add
      .rectangle(width / 2, height - 110, boxWidth, boxHeight, PALETTE.cream, 0.97)
      .setStrokeStyle(3, PALETTE.ink)
      .setDepth(10);

    const speaker = this.add
      .text(width / 2 - boxWidth / 2 + 16, height - 110 - boxHeight / 2 + 14, `${TUTORIAL_MONSTER.npcName}:`, {
        fontFamily: "monospace",
        fontSize: "13px",
        color: PALETTE_HEX.maroon,
        fontStyle: "bold",
      })
      .setDepth(11);

    const message = card
      ? "이 슬라임, 아직 다 잡히지 않았나 봐요. 다시 한 번 도전해볼까요?"
      : TUTORIAL_MONSTER.questText;

    const body = this.add
      .text(width / 2 - boxWidth / 2 + 16, height - 110 - boxHeight / 2 + 36, message, {
        fontFamily: "monospace",
        fontSize: "13px",
        color: INK,
        wordWrap: { width: boxWidth - 32 },
      })
      .setDepth(11);

    const startButton = createButton(
      this,
      width / 2 + boxWidth / 2 - 90,
      height - 110 + boxHeight / 2 - 24,
      140,
      32,
      "코드 배틀 시작",
      () => this.startBattle()
    );
    startButton.setDepth(11);

    const closeButton = createButton(
      this,
      width / 2 - boxWidth / 2 + 60,
      height - 110 + boxHeight / 2 - 24,
      80,
      32,
      "닫기",
      () => this.closeDialog()
    );
    closeButton.setDepth(11);

    this.dialogGroup = this.add.container(0, 0, [panel, speaker, body, startButton, closeButton]);
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
