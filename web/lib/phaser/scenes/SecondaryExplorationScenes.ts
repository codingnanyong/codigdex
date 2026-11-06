import Phaser from "phaser";
import { secondaryRegionsFor, secondaryRegionForStage, EVOLUTION_LESSON_PHASES } from "@codigdex/game-content/domain/secondaryExploration";
import { secondaryRegionProgression, secondaryExplorationCheckpoints, hasEarnedSecondaryCareer, isSecondaryStudyComplete, canStartMasterProject } from "@codigdex/game-content/domain/gameProgress";
import { findSecondaryJob, tertiaryJobsFor } from "@codigdex/game-content/domain/player/jobs";
import { assetUrl } from "../../assets";
import { snapshotRegistry } from "../registryAdapter";
import { lt, sceneLocale } from "../i18n";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene, createButton, drawOrnateFrame, fitTextInside } from "../ui";
import { queueImages, showLoadingScreen } from "../assetLoader";
import { createHomeButton } from "../navigation";
import { openSourcesForMonster } from "@codigdex/game-content/domain/openSourceLinks";
import { discoveredSourceIds } from "../openSourceEvents";
import { showOpenSourceNotes } from "../openSourceNotes";
import { drawFiveStageRoute } from "../fiveStageRoute";
import { drawPixelChainLock } from "../worldMap/pixelChainLock";

const atlasKey = (id: string) => `secondary-atlas-${id}`;
const terrainKey = (id: string) => `secondary-terrain-${id}`;

/** Painted islands remain the hit targets; the matching terrain lifts above a shadow. */
export class SecondaryAtlasScene extends Phaser.Scene {
  private jobId = "";
  private regionId?: string;
  constructor() { super("secondary-atlas"); }
  init(data?: { jobId?: string; regionId?: string }) { this.jobId = data?.jobId ?? snapshotRegistry(this.registry).player.secondaryJobId ?? ""; this.regionId = data?.regionId; }
  preload() {
    const regions = secondaryRegionsFor(this.jobId);
    if (!regions.length) return;
    showLoadingScreen(this, queueImages(this, [
      { key: atlasKey(this.jobId), url: assetUrl(regions[0].atlasAssetKey) },
      ...regions.map((region) => ({ key: terrainKey(region.id), url: assetUrl(region.terrainAssetKey) })),
    ]), "ATLAS");
  }
  create() {
    const save = snapshotRegistry(this.registry), job = findSecondaryJob(this.jobId);
    if (!job || save.player.secondaryJobId !== job.id || !hasEarnedSecondaryCareer(save)) { this.scene.start("job-select"); return; }
    const progression = secondaryRegionProgression(save), ko = sceneLocale(this) === "ko";
    this.add.image(480, 270, atlasKey(job.id)).setDisplaySize(960, 540);
    drawOrnateFrame(this, 480, 37, 670, 58, { fillAlpha: 0.96, radius: 10 }).setDepth(10);
    this.add.text(480, 26, lt(this, job.name), { ...pixelText("subtitle"), color: PALETTE_HEX.maroon }).setOrigin(0.5).setDepth(11);
    this.add.text(480, 48, `${progression.reduce((n, item) => n + item.captured, 0)}/25 · ${ko ? "다섯 지역 · 다섯 단계의 진화" : "FIVE REGIONS · FIVE EVOLUTIONS"}`, { ...pixelText("caption"), color: PALETTE_HEX.ink }).setOrigin(0.5).setDepth(11);
    const layers = progression.map(({ region, status, captured }, index) => {
      const shadow = this.add.image(480, 278, terrainKey(region.id)).setTint(PALETTE.nightBrown).setAlpha(0).setDepth(2);
      const terrain = this.add.image(480, 270, terrainKey(region.id)).setAlpha(0).setDepth(3);
      if (status === "locked") drawPixelChainLock(this, ...region.center).setScale(0.72);
      const label = this.add.text(region.center[0], region.center[1] + 42, `${status === "completed" ? "✓" : index + 1} ${lt(this, region.label)}\n${captured}/5`, { ...pixelText("caption"), color: PALETTE_HEX.cream, backgroundColor: PALETTE_HEX.nightBrown, align: "center", padding: { x: 7, y: 5 } }).setOrigin(0.5).setDepth(7);
      fitTextInside(label, 212, 43);
      return { shadow, terrain, label, polygon: new Phaser.Geom.Polygon(region.outline.map(([x, y]) => ({ x, y }))) };
    });
    let focused = -1;
    const hint = this.add.text(480, 474, ko ? "지역을 가리키거나 1–5 키로 선택 · Enter로 입장" : "POINT AT A REGION OR PRESS 1–5 · ENTER TO EXPLORE", { ...pixelText("caption"), color: PALETTE_HEX.cream, backgroundColor: PALETTE_HEX.nightBrown, padding: { x: 10, y: 6 } }).setOrigin(0.5).setDepth(10);
    const focus = (index: number) => {
      if (index === focused) return;
      focused = index;
      this.game.canvas.style.cursor = index >= 0 && progression[index].status !== "locked" ? "pointer" : "default";
      layers.forEach(({ shadow, terrain, label }, i) => {
        this.tweens.killTweensOf([shadow, terrain, label]);
        const active = i === index && progression[i].status !== "locked";
        this.tweens.add({ targets: shadow, alpha: active ? 0.35 : 0, duration: 150 });
        this.tweens.add({ targets: terrain, alpha: active ? 1 : 0, y: active ? 259 : 270, duration: 150, ease: "Cubic.Out" });
        this.tweens.add({ targets: label, y: progression[i].region.center[1] + (active ? 31 : 42), duration: 150 });
      });
      const item = progression[index];
      if (item) hint.setText(item.status === "locked" ? (ko ? "앞 지역의 Lv.5 수호자를 포획하면 열립니다." : "CAPTURE THE PREVIOUS REGION'S LV.5 GUARDIAN TO UNLOCK.") : `${lt(this, item.region.label)} · ${item.captured}/5 · ${ko ? "클릭 또는 Enter로 탐험" : "CLICK OR ENTER TO EXPLORE"}`);
    };
    const enter = () => { const item = progression[focused]; if (item && item.status !== "locked") this.scene.start("secondary-region", { jobId: job.id, regionId: item.region.id }); };
    const regionAt = (pointer: Phaser.Input.Pointer) => {
      const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      return layers.map(({ polygon }, index) => ({ index, inside: Phaser.Geom.Polygon.Contains(polygon, point.x, point.y), distance: Phaser.Math.Distance.Between(point.x, point.y, ...progression[index].region.center) }))
        .filter(({ inside }) => inside).sort((a, b) => a.distance - b.distance)[0]?.index ?? -1;
    };
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => focus(regionAt(pointer)));
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => { const i = regionAt(pointer); if (i >= 0) { focus(i); enter(); } });
    const keyboard = this.input.keyboard;
    const onKey = (event: KeyboardEvent) => { const i = Number(event.key) - 1; if (i >= 0 && i < 5) focus(i); else if (event.key === "Enter") { event.stopPropagation(); enter(); } };
    keyboard?.on("keydown", onKey);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { keyboard?.off("keydown", onKey); this.game.canvas.style.cursor = "default"; });
    const initial = progression.findIndex(({ region, status }) => region.id === this.regionId && status !== "locked");
    focus(initial >= 0 ? initial : progression.findIndex(({ status }) => status === "available"));
    createButton(this, 182, 513, 274, 34, ko ? "전직 계보" : "CAREER LINEAGE", () => this.scene.start("job-select")).setDepth(12);
    const next = tertiaryJobsFor(job.id)[0];
    if (isSecondaryStudyComplete(save, job.id) && next && canStartMasterProject(save, next.id)) createButton(this, 770, 513, 310, 34, ko ? "3차 최종 프로젝트" : "TIER THREE · FINAL PROJECT", () => this.scene.start("promotion-chapter", { jobId: next.id })).setDepth(12);
    createHomeButton(this).setDepth(20); applyPixelFontToScene(this);
  }
}
export class SecondaryRegionScene extends Phaser.Scene {
  private jobId = "";
  private regionId = "";
  private monsterId?: string;
  constructor() { super("secondary-region"); }
  init(data: { jobId?: string; regionId?: string; monsterId?: string }) {
    this.jobId = data.jobId ?? snapshotRegistry(this.registry).player.secondaryJobId ?? "";
    this.regionId = data.regionId ?? secondaryRegionForStage(data.monsterId ?? "")?.id ?? ""; this.monsterId = data.monsterId;
  }
  preload() {
    const region = secondaryRegionsFor(this.jobId).find(({ id }) => id === this.regionId);
    if (!region) return;
    showLoadingScreen(this, queueImages(this, [{ key: region.chapter.arena!.textureKey, url: assetUrl(region.chapter.arena!.assetKey) }, ...region.chapter.stages.map(({ textureKey, assetKey }) => ({ key: textureKey, url: assetUrl(assetKey) }))]), "REGION");
  }
  create() {
    const save = snapshotRegistry(this.registry), item = secondaryRegionProgression(save).find(({ region }) => region.id === this.regionId && region.jobId === this.jobId);
    if (!item || item.status === "locked") { this.scene.start("secondary-atlas"); return; }
    const { region } = item, ko = sceneLocale(this) === "ko";
    const path = secondaryExplorationCheckpoints(save).filter(({ chapter }) => chapter.id === region.chapter.id);
    const selected = path.find(({ monster, status }) => monster.id === this.monsterId && status !== "locked") ?? path.find(({ status }) => status === "available") ?? path.at(-1)!;
    this.add.image(480, 270, region.chapter.arena!.textureKey).setDisplaySize(960, 540);
    this.add.rectangle(480, 270, 960, 540, PALETTE.nightBrown, 0.2);
    drawOrnateFrame(this, 480, 45, 730, 64, { fillAlpha: 0.97, radius: 10 });
    this.add.text(480, 29, `${lt(this, region.label)} · ${item.captured}/5`, { ...pixelText("subtitle"), color: PALETTE_HEX.maroon }).setOrigin(0.5);
    this.add.text(480, 56, ko ? "한 종의 성장과 함께 원리 → 구현 → 진단 → 검증 → 통합" : "ONE SPECIES · DISCOVER → BUILD → DIAGNOSE → VERIFY → INTEGRATE", { ...pixelText("caption"), color: PALETTE_HEX.ink }).setOrigin(0.5);
    const learn = () => this.scene.start("career-workshop", { jobId: this.jobId, monsterId: selected.monster.id, evolutionId: selected.monster.id });
    drawFiveStageRoute(this, path, selected.monster.id, (monsterId) => this.scene.restart({ jobId: this.jobId, regionId: this.regionId, monsterId }), {
      arena: region.chapter.arena!.assetKey, onEnter: learn, captions: EVOLUTION_LESSON_PHASES.map((phase) => lt(this, phase)),
    });
    drawOrnateFrame(this, 480, 409, 858, 150, { fillAlpha: 0.98, radius: 12 });
    this.add.text(84, 350, `No.${selected.monster.dexNumber} · ${lt(this, selected.monster.name)}`, { ...pixelText("body"), color: PALETTE_HEX.maroon });
    const brief = this.add.text(84, 379, lt(this, selected.monster.briefing), { ...pixelText("body"), color: PALETTE_HEX.ink, wordWrap: { width: 788 }, lineSpacing: 4 });
    fitTextInside(brief, 788, 65);
    const discovered = discoveredSourceIds(this.registry, save), tools = openSourcesForMonster(region.core.id).filter(({ id }) => discovered.has(id));
    if (tools.length) this.add.text(84, 452, `${ko ? "연관 도구" : "RELATED TOOLS"} · ${tools.map(({ name }) => name).join(" · ")} ↗`, { ...pixelText("caption"), color: PALETTE_HEX.maroon }).setInteractive({ useHandCursor: true }).on("pointerup", () => showOpenSourceNotes(tools.map(({ id }) => id)));
    createButton(this, 216, 511, 320, 36, ko ? "← 2차 지역 지도" : "← SECONDARY ATLAS", () => this.scene.start("secondary-atlas", { jobId: this.jobId, regionId: this.regionId }));
    createButton(this, 736, 511, 350, 36, ko ? "학습 자료 · 진화 배틀" : "LEARNING BRIEF · EVOLUTION BATTLE", learn);
    createHomeButton(this).setDepth(20); applyPixelFontToScene(this);
  }
}
