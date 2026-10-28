import Phaser from "phaser";
import { promotionChapterFor, promotionMissionFor } from "@codigdex/game-content/domain/promotionChapters";
import { canSelectSecondaryJob, findSecondaryJob, findJob } from "@codigdex/game-content/domain/player/jobs";
import { completedCareerPathIds } from "@codigdex/game-content/domain/careerPaths";
import { isCommonPathComplete } from "@codigdex/game-content/domain/chapters";
import { captureIds, promotionCheckpoints, selectSecondaryCareer } from "@codigdex/game-content/domain/gameProgress";
import { assetUrl } from "../../assets";
import { applySaveToRegistry, snapshotRegistry } from "../registryAdapter";
import { lt, sceneLocale } from "../i18n";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene, createButton, drawOrnateFrame, fitTextInside } from "../ui";
import { queueImages, showLoadingScreen } from "../assetLoader";
import { createHomeButton } from "../navigation";
import { openSourcesForMonster } from "@codigdex/game-content/domain/openSourceLinks";
import { showOpenSourceNotes } from "../openSourceNotes";
import { discoveredSourceIds } from "../openSourceEvents";

/** The chapter itself is the promotion confirmation and persistent mission log. */
export class PromotionChapterScene extends Phaser.Scene {
  private jobId = "platform-engineer";
  private selectedId?: string;
  constructor() { super("promotion-chapter"); }
  init(data?: { jobId?: string; monsterId?: string }) {
    this.jobId = data?.jobId ?? "platform-engineer";
    this.selectedId = data?.monsterId;
  }
  preload() {
    const mission = promotionMissionFor(this.jobId);
    if (!mission) return;
    const { chapter } = mission;
    const queued = queueImages(this, [
      { key: chapter.arena!.textureKey, url: assetUrl(chapter.arena!.assetKey) },
      { key: `guide-${this.jobId}`, url: assetUrl(mission.guideAssetKey) },
      ...chapter.stages.map(({ textureKey, assetKey }) => ({ key: textureKey, url: assetUrl(assetKey) })),
    ]);
    showLoadingScreen(this, queued, chapter.label);
  }
  create() {
    const mission = promotionMissionFor(this.jobId);
    const chapter = promotionChapterFor(this.jobId);
    const job = findSecondaryJob(this.jobId);
    const save = snapshotRegistry(this.registry);
    const captured = captureIds(save);
    if (!mission || !chapter || !job || !isCommonPathComplete(captured) || !canSelectSecondaryJob(job, completedCareerPathIds(captured))) {
      this.scene.start("job-select"); return;
    }
    const ko = sceneLocale(this) === "ko";
    const equipped = save.player.secondaryJobId === job.id;
    const checkpoints = equipped ? promotionCheckpoints(save) : [];
    const complete = chapter.stages.every(({ id }) => captured.has(id));
    const selected = checkpoints.find(({ monster, status }) => monster.id === this.selectedId && status !== "locked")
      ?? checkpoints.find(({ status }) => status === "available") ?? checkpoints.at(-1);
    this.add.image(480, 270, chapter.arena!.textureKey).setDisplaySize(960, 540);
    this.add.rectangle(480, 270, 960, 540, PALETTE.nightBrown, 0.25);
    drawOrnateFrame(this, 480, 51, 760, 68, { fillAlpha: 0.97, radius: 10 });
    this.add.text(480, 31, `${chapter.label} · ${lt(this, chapter.name)}`, { ...pixelText("subtitle"), color: PALETTE_HEX.maroon }).setOrigin(0.5);
    this.add.text(480, 61, `${lt(this, job.name)} · ${equipped ? `${captured.size ? chapter.stages.filter(({ id }) => captured.has(id)).length : 0}/5` : (ko ? "전직 확인" : "PROMOTION CONFIRMATION")}`, { ...pixelText("caption"), color: PALETTE_HEX.ink }).setOrigin(0.5);
    chapter.stages.forEach((monster, index) => {
      const checkpoint = checkpoints[index];
      const visible = !equipped || checkpoint?.status !== "locked";
      const x = 130 + index * 175, y = index % 2 ? 240 : 197;
      this.add.circle(x, y + 6, 54, PALETTE.nightBrown, 0.72).setStrokeStyle(selected?.monster.id === monster.id ? 4 : 2, selected?.monster.id === monster.id ? PALETTE.amber : PALETTE.sand);
      if (visible) {
        const image = this.add.image(x, y - 6, monster.textureKey).setDisplaySize(102, 102);
        if (equipped) image.setInteractive({ useHandCursor: true }).on("pointerup", () => this.scene.restart({ jobId: job.id, monsterId: monster.id }));
      } else this.add.text(x, y, "?", { ...pixelText("title"), color: PALETTE_HEX.sand }).setOrigin(0.5);
      const label = this.add.text(x, y + 69, `Lv.${monster.level} · ${captured.has(monster.id) ? "✓ " : ""}${visible ? lt(this, monster.name) : "???"}`, { ...pixelText("caption"), color: PALETTE_HEX.cream, backgroundColor: PALETTE_HEX.nightBrown, padding: { x: 4, y: 4 } }).setOrigin(0.5);
      fitTextInside(label, 165, 24);
    });
    drawOrnateFrame(this, 480, 416, 860, 156, { fillAlpha: 0.98, radius: 12 });
    this.add.image(108, 411, `guide-${this.jobId}`).setDisplaySize(112, 112);
    this.add.text(166, 353, lt(this, chapter.npcName), { ...pixelText("body"), color: PALETTE_HEX.maroon });
    const body = !equipped ? lt(this, mission.story.intro) : complete && selected?.status === "cleared" ? lt(this, mission.story.ending) : selected ? lt(this, selected.monster.briefing) : lt(this, mission.story.intro);
    this.add.text(166, 379, body, { ...pixelText("body"), color: PALETTE_HEX.ink, wordWrap: { width: 720 }, lineSpacing: 4 });
    const discovered = discoveredSourceIds(this.registry, save);
    const tools = selected ? openSourcesForMonster(selected.monster.id).filter(({ id }) => discovered.has(id)) : [];
    if (tools.length) {
      const related = this.add.text(166, 449, `${ko ? "연관 도구" : "RELATED TOOLS"}: ${tools.map(({ name }) => name).join(" · ")} ↗`, { ...pixelText("caption"), color: PALETTE_HEX.maroon }).setInteractive({ useHandCursor: true }).on("pointerup", () => showOpenSourceNotes(tools.map(({ id }) => id)));
      fitTextInside(related, 710, 18);
    }
    if (!equipped) {
      this.add.text(166, 470, job.requires.map((id) => lt(this, findJob(id).name)).join(" + ") + " · MASTER", { ...pixelText("caption"), color: PALETTE_HEX.mutedBrown });
      createButton(this, 742, 509, 320, 34, ko ? "전직하고 의뢰 시작" : "CONFIRM · START MISSION", () => {
        applySaveToRegistry(this.registry, selectSecondaryCareer(snapshotRegistry(this.registry), job.id));
        this.scene.restart({ jobId: job.id });
      });
    } else if (selected) {
      if (complete) this.add.text(166, 470, ko ? "★ 경로 MASTER · 3차 챕터는 준비 중입니다." : "★ PATH MASTER · Tier-three chapter coming later.", { ...pixelText("caption"), color: PALETTE_HEX.maroon });
      createButton(this, 742, 509, 320, 34, selected.status === "cleared" ? (ko ? "이 단계 다시 도전" : "REPLAY THIS STAGE") : (ko ? "이 단계 배틀 시작" : "START THIS BATTLE"), () => this.scene.start("code-battle", {
        monsterId: selected.monster.id, returnTo: { scene: "promotion-chapter", data: { jobId: job.id } },
      }));
    }
    createButton(this, 190, 509, 260, 34, ko ? "전직 계보로" : "CAREER LINEAGE", () => this.scene.start("job-select"));
    createHomeButton(this).setDepth(30);
    applyPixelFontToScene(this);
  }
}
