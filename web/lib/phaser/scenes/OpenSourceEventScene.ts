import Phaser from "phaser";
import { findOpenSource } from "@codigdex/game-content/domain/openSourceCatalog";
import { sourceEncounterStage, openSourceEvolutionFor, openSourceArenaForStage } from "@codigdex/game-content/domain/openSourceChapters";
import { sourceCareer, sourceCareerName } from "@codigdex/game-content/domain/openSourceEncounters";
import { snapshotRegistry } from "../registryAdapter";
import { sourceEvents } from "../openSourceEvents";
import { assetUrl } from "../../assets";
import { queueImages, showLoadingScreen } from "../assetLoader";
import { lt, sceneLocale } from "../i18n";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene, createButton, drawOrnateFrame, fitTextInside } from "../ui";
import { drawFiveStageRoute } from "../fiveStageRoute";

/** One accepted request follows a tool's five forms inside its ecosystem arena. */
export class OpenSourceEventScene extends Phaser.Scene {
  private selectedId?: string;
  constructor() { super("open-source-event"); }
  init(data?: { monsterId?: string }) { this.selectedId = data?.monsterId; }

  preload() {
    const pending = sourceEvents(this.registry).resolvePending(snapshotRegistry(this.registry));
    const stage = pending && sourceEncounterStage(snapshotRegistry(this.registry), pending);
    if (stage && pending) {
      const arena = openSourceArenaForStage(stage.id)!;
      showLoadingScreen(this, queueImages(this, [{ key: arena.textureKey, url: assetUrl(arena.assetKey) }, ...openSourceEvolutionFor(pending.toolId).map((form) => ({ key: form.textureKey, url: assetUrl(form.assetKey) }))]), lt(this, stage.name));
    }
  }

  create() {
    const save = snapshotRegistry(this.registry);
    const session = sourceEvents(this.registry);
    const pending = session.resolvePending(save);
    const entry = pending && findOpenSource(pending.toolId);
    const stage = pending && sourceEncounterStage(save, pending);
    if (!pending || !entry || !stage) { this.scene.start("world-map"); return; }
    const ko = sceneLocale(this) === "ko";
    const forms = openSourceEvolutionFor(entry.id);
    const captured = new Set(save.progress.captures.map(({ id }) => id));
    const preview = forms.find(({ id }) => id === this.selectedId && (id === stage.id || captured.has(id))) ?? stage;
    const arena = openSourceArenaForStage(stage.id)!;
    this.add.image(480, 270, arena.textureKey).setDisplaySize(960, 540);
    this.add.rectangle(480, 270, 960, 540, PALETTE.nightBrown, 0.2);
    this.cameras.main.setBackgroundColor(PALETTE_HEX.nightBrown);
    drawOrnateFrame(this, 480, 55, 860, 76, { radius: 10 });
    const title = this.add.text(480, 38, ko ? "돌발 의뢰 · 오픈소스와의 만남" : "SURPRISE REQUEST · AN OPEN-SOURCE ENCOUNTER", { ...pixelText("subtitle"), color: PALETTE_HEX.maroon }).setOrigin(0.5);
    fitTextInside(title, 816, 28);
    const subtitle = this.add.text(480, 73, `${lt(this, sourceCareerName(pending.careerId))} · ${entry.name} · ${forms.filter(({ id }) => captured.has(id)).length}/5`, { ...pixelText("caption"), color: PALETTE_HEX.ink }).setOrigin(0.5);
    fitTextInside(subtitle, 816, 21);
    const accept = () => {
      if (!session.accept(snapshotRegistry(this.registry), pending.id)) { this.scene.start("world-map"); return; }
      const active = session.pending(snapshotRegistry(this.registry));
      const next = active && sourceEncounterStage(snapshotRegistry(this.registry), active);
      if (next) this.scene.start("code-battle", { monsterId: next.id, sourceEventId: pending.id, returnTo: pending.returnTo });
    };
    drawFiveStageRoute(this, forms.map((monster) => ({ monster, status: captured.has(monster.id) ? "cleared" as const : monster.id === stage.id ? "available" as const : "locked" as const })),
      preview.id, (monsterId) => this.scene.restart({ monsterId }), { arena: arena.assetKey, onEnter: accept,
        enterLabel: `${ko ? "현재 의뢰 이어하기" : "CONTINUE CURRENT REQUEST"} · Lv.${stage.level}/5` });
    drawOrnateFrame(this, 480, 410, 860, 150, { radius: 10, fillAlpha: 0.97 });
    this.add.image(111, 410, preview.textureKey).setDisplaySize(112, 112);
    const name = this.add.text(184, 350, `Lv.${preview.level} · No.${preview.dexNumber} · ${lt(this, preview.name)}`, { ...pixelText("body"), color: PALETTE_HEX.maroon });
    fitTextInside(name, 680, 25);
    const task = this.add.text(184, 382, `${lt(this, entry.role)}\n${lt(this, entry.learning)}`, { ...pixelText("body"), color: PALETTE_HEX.ink, wordWrap: { width: 680 }, lineSpacing: 4 });
    fitTextInside(task, 680, 65);
    const workplace = this.add.text(184, 460, lt(this, sourceCareer(pending.careerId)!.workplace), { ...pixelText("caption"), color: PALETTE_HEX.mutedBrown });
    fitTextInside(workplace, 680, 19);
    const leave = () => { const target = session.leave(snapshotRegistry(this.registry), pending.id); this.scene.start(target?.scene ?? "world-map", target?.data); };
    createButton(this, 242, 501, 360, 38, pending.state === "offered" ? (ko ? "나중에 · 원래 경로로" : "LATER · RETURN TO MY PATH") : (ko ? "잠시 멈춤 · 직무로" : "PAUSE · RETURN TO MY CAREER"), leave);
    createButton(this, 718, 501, 360, 38, pending.state === "offered" ? (ko ? "참여 · 5단계 탐험" : "START FIVE-STAGE REQUEST") : `${ko ? "이어하기" : "CONTINUE"} · Lv.${stage.level}/5`, accept);
    applyPixelFontToScene(this);
  }
}
