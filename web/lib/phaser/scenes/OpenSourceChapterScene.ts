import Phaser from "phaser";
import { openSourceExpeditionFor } from "@codigdex/game-content/domain/openSourceChapters";
import { captureIds, openSourceCheckpoints, rememberCheckpoint } from "@codigdex/game-content/domain/gameProgress";
import { applySaveToRegistry, CHECKPOINT_REGISTRY_KEY, snapshotRegistry } from "../registryAdapter";
import { assetUrl } from "../../assets";
import { queueImages, showLoadingScreen } from "../assetLoader";
import { lt, sceneLocale } from "../i18n";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene, createButton, drawOrnateFrame, fitTextInside } from "../ui";
import { createHomeButton } from "../navigation";
import { showOpenSourceNotes } from "../openSourceNotes";

/** A nine-chapter side expedition, independent of career selection and MASTER gates. */
export class OpenSourceChapterScene extends Phaser.Scene {
  private family = "hadoop";
  private selectedId?: string;
  constructor() { super("open-source-chapter"); }
  init(data?: { family?: string; monsterId?: string }) {
    this.family = data?.family ?? "hadoop";
    this.selectedId = data?.monsterId;
  }
  preload() {
    const mission = openSourceExpeditionFor(this.family);
    if (!mission) return;
    showLoadingScreen(this, queueImages(this, mission.chapter.stages.map(({ textureKey, assetKey }) => ({ key: textureKey, url: assetUrl(assetKey) }))), mission.chapter.label);
  }
  create() {
    const mission = openSourceExpeditionFor(this.family);
    const save = snapshotRegistry(this.registry);
    const path = openSourceCheckpoints(save).filter(({ chapter }) => chapter.id === mission?.chapter.id);
    const selected = path.find(({ monster, status }) => monster.id === this.selectedId && status !== "locked")
      ?? path.find(({ status }) => status === "available") ?? path.findLast(({ status }) => status === "cleared");
    if (!mission || !selected) { this.scene.start("world-map"); return; }
    applySaveToRegistry(this.registry, rememberCheckpoint(save, selected.monster.id));
    const { chapter } = mission;
    const captured = captureIds(save);
    const complete = chapter.stages.every(({ id }) => captured.has(id));
    const ko = sceneLocale(this) === "ko";
    this.cameras.main.setBackgroundColor(PALETTE_HEX.nightBrown);
    drawOrnateFrame(this, 480, 47, 790, 72, { fillAlpha: 1, radius: 10 });
    this.add.text(480, 29, `${chapter.label} · ${lt(this, chapter.name)}`, { ...pixelText("subtitle"), color: PALETTE_HEX.maroon }).setOrigin(0.5);
    this.add.text(480, 60, `${chapter.stages.filter(({ id }) => captured.has(id)).length}/${chapter.stages.length} · ${ko ? "선택 탐험 · 전직 조건에 영향 없음" : "OPTIONAL EXPEDITION · NO CAREER REQUIREMENT"}`, { ...pixelText("caption"), color: PALETTE_HEX.ink }).setOrigin(0.5);
    // Up to nine creatures fit a 3x3 stage grid; the selected mission owns the story panel.
    path.forEach(({ monster, status }, index) => {
      const x = 104 + (index % 3) * 155, y = 147 + Math.floor(index / 3) * 115;
      const focused = selected.monster.id === monster.id;
      this.add.rectangle(x, y, 140, 104, focused ? PALETTE.maroon : PALETTE.nightBrown).setStrokeStyle(focused ? 3 : 1, PALETTE.sand);
      this.add.image(x, y - 9, monster.textureKey).setDisplaySize(72, 72).setAlpha(status === "locked" ? 0.25 : 1);
      if (status !== "locked") this.add.rectangle(x, y, 140, 104, 0, 0).setInteractive({ useHandCursor: true }).on("pointerup", () => this.scene.restart({ family: this.family, monsterId: monster.id }));
      const label = this.add.text(x, y + 37, `${index + 1}. ${status === "cleared" ? "✓ " : status === "locked" ? "🔒 " : ""}${lt(this, monster.classification)}`, { ...pixelText("caption"), color: PALETTE_HEX.cream }).setOrigin(0.5);
      fitTextInside(label, 130, 20);
    });
    drawOrnateFrame(this, 718, 288, 414, 390, { fillAlpha: 1, radius: 10 });
    const story = this.add.text(533, 109, lt(this, complete ? mission.ending : mission.intro), { ...pixelText("body"), color: PALETTE_HEX.ink, wordWrap: { width: 370 }, lineSpacing: 4 });
    fitTextInside(story, 370, 118);
    this.add.image(718, 286, selected.monster.textureKey).setDisplaySize(128, 128);
    const name = this.add.text(718, 362, lt(this, selected.monster.name), { ...pixelText("body"), color: PALETTE_HEX.maroon }).setOrigin(0.5);
    fitTextInside(name, 360, 27);
    const lesson = this.add.text(533, 386, lt(this, selected.monster.description), { ...pixelText("body"), color: PALETTE_HEX.ink, wordWrap: { width: 370 }, lineSpacing: 3 });
    fitTextInside(lesson, 370, 80);
    createButton(this, 718, 509, 414, 36, selected.status === "cleared" ? (ko ? "이 의뢰 다시 도전" : "REPLAY MISSION") : (ko ? "의뢰 배틀 시작" : "START MISSION BATTLE"), () => this.scene.start("code-battle", {
      monsterId: selected.monster.id, returnTo: { scene: "open-source-chapter", data: { family: this.family } },
    }));
    createButton(this, 240, 463, 420, 36, ko ? "직업 경로로 돌아가기" : "RETURN TO CAREER PATH", () => {
      this.registry.set(CHECKPOINT_REGISTRY_KEY, undefined);
      this.scene.start("world-map");
    });
    createButton(this, 240, 509, 420, 36, ko ? "탐험 노트 · 다른 생태계" : "FIELD NOTES · OTHER ECOSYSTEMS", () => showOpenSourceNotes());
    createHomeButton(this).setDepth(30);
    applyPixelFontToScene(this);
  }
}
