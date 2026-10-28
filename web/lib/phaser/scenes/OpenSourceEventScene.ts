import Phaser from "phaser";
import { findOpenSource } from "@codigdex/game-content/domain/openSourceCatalog";
import { openSourceStageFor } from "@codigdex/game-content/domain/openSourceChapters";
import { sourceCareer, sourceCareerName } from "@codigdex/game-content/domain/openSourceEncounters";
import { snapshotRegistry } from "../registryAdapter";
import { sourceEvents } from "../openSourceEvents";
import { assetUrl } from "../../assets";
import { queueImages, showLoadingScreen } from "../assetLoader";
import { lt, sceneLocale } from "../i18n";
import { PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene, createButton, drawOrnateFrame, fitTextInside } from "../ui";

/** A single role-related interruption inside the current adventure, never a separate world. */
export class OpenSourceEventScene extends Phaser.Scene {
  constructor() { super("open-source-event"); }

  preload() {
    const pending = sourceEvents(this.registry).resolvePending(snapshotRegistry(this.registry));
    const stage = pending && openSourceStageFor(pending.toolId);
    if (stage) showLoadingScreen(this, queueImages(this, [{ key: stage.textureKey, url: assetUrl(stage.assetKey) }]), lt(this, stage.name));
  }

  create() {
    const save = snapshotRegistry(this.registry);
    const session = sourceEvents(this.registry);
    const pending = session.resolvePending(save);
    const entry = pending && findOpenSource(pending.toolId);
    const stage = pending && openSourceStageFor(pending.toolId);
    if (!pending || !entry || !stage) { this.scene.start("world-map"); return; }
    const ko = sceneLocale(this) === "ko";
    const captured = save.progress.captures.some(({ id }) => id === stage.id);
    this.cameras.main.setBackgroundColor(PALETTE_HEX.nightBrown);
    drawOrnateFrame(this, 480, 55, 860, 76, { radius: 10 });
    const title = this.add.text(480, 38, ko ? "돌발 의뢰 · 오픈소스와의 만남" : "SURPRISE REQUEST · AN OPEN-SOURCE ENCOUNTER", { ...pixelText("subtitle"), color: PALETTE_HEX.maroon }).setOrigin(0.5);
    fitTextInside(title, 816, 28);
    this.add.text(480, 73, lt(this, sourceCareerName(pending.careerId)), { ...pixelText("body"), color: PALETTE_HEX.ink }).setOrigin(0.5);
    drawOrnateFrame(this, 480, 286, 860, 340, { radius: 10 });
    this.add.image(228, 262, stage.textureKey).setDisplaySize(192, 192);
    const name = this.add.text(228, 384, entry.name, { ...pixelText("subtitle"), color: PALETTE_HEX.maroon }).setOrigin(0.5);
    fitTextInside(name, 280, 30);
    const workplace = this.add.text(398, 142, lt(this, sourceCareer(pending.careerId)!.workplace), { ...pixelText("body"), color: PALETTE_HEX.ink, wordWrap: { width: 475 }, lineSpacing: 7 });
    fitTextInside(workplace, 475, 112);
    const task = this.add.text(398, 274, `${ko ? "도구의 역할" : "TOOL'S ROLE"}\n${lt(this, entry.role)}\n\n${ko ? "해결의 단서" : "CLUES"}\n${lt(this, entry.learning)}`, { ...pixelText("body"), color: PALETTE_HEX.ink, wordWrap: { width: 475 }, lineSpacing: 5 });
    fitTextInside(task, 475, 146);
    const leave = () => { const target = session.finish(snapshotRegistry(this.registry), pending.id); this.scene.start(target?.scene ?? "world-map", target?.data); };
    createButton(this, 242, 501, 360, 38, captured ? (ko ? "발견 노트에 기록했어요" : "RECORDED IN YOUR NOTES") : (ko ? "나중에 · 원래 경로로" : "LATER · RETURN TO MY PATH"), leave);
    createButton(this, 718, 501, 360, 38, captured ? (ko ? "직무 모험 계속" : "CONTINUE MY CAREER") : pending.state === "active" ? (ko ? "의뢰 다시 도전" : "RETRY THIS REQUEST") : (ko ? "참여 · 도구와 문제 해결" : "HELP · SOLVE THE REQUEST"), () => {
      if (captured) { leave(); return; }
      if (!session.accept(snapshotRegistry(this.registry), pending.id)) { this.scene.start("world-map"); return; }
      this.scene.start("code-battle", { monsterId: stage.id, sourceEventId: pending.id, returnTo: pending.returnTo });
    });
    applyPixelFontToScene(this);
  }
}
