import Phaser from "phaser";
import { isCommonPathComplete } from "@/lib/domain/chapters";
import {
  masteredPrimaryJobIds,
  masteredSecondaryJobIds,
} from "@/lib/domain/careerDex";
import { capturedIds } from "@/lib/domain/dex/capture";
import {
  canSelectPrimaryJob,
  findJob,
  findSecondaryJob,
  findTertiaryJob,
  guideDisplayName,
  isSecondaryJobUnlocked,
  isTertiaryJobUnlocked,
  JOB_OPTIONS,
  JOB_REGISTRY_KEY,
  SECONDARY_JOB_REGISTRY_KEY,
  SECONDARY_JOB_OPTIONS,
  TERTIARY_JOB_OPTIONS,
  TERTIARY_JOB_REGISTRY_KEY,
  type JobId,
  type JobOption,
  type SecondaryJobId,
  type SecondaryJobOption,
  type TertiaryJobOption,
} from "@/lib/domain/player/jobs";
import { lt, t } from "../i18n";
import { PALETTE, PALETTE_HEX } from "../palette";
import { createSettingsButton } from "../settings/settingsButton";
import { createHomeButton } from "../navigation";
import { pixelText } from "../pixelFont";
import {
  activateCareerInRegistry,
  readDexState,
  reconcileCareerDexRegistry,
} from "../registryAdapter";
import {
  addShade,
  applyPixelFontToScene,
  createButton,
  drawOrnateFrame,
  fitTextInside,
  showToast,
} from "../ui";
import { createDialogPortrait } from "../worldMap/dialogPortrait";
const JUNIOR_X = 68;
const PRIMARY_X = 245;
const SECONDARY_X = 565;
const TERTIARY_X = 850;
const JUNIOR_WIDTH = 112;
const PRIMARY_WIDTH = 222;
const SECONDARY_WIDTH = 180;
const TERTIARY_WIDTH = 170;
const CAREER_CENTER_Y = 262;
const ROW_Y = [106, 184, 262, 340, 418] as const;

/** Shows the full junior → primary → secondary → tertiary career lineage. */
export class JobSelectScene extends Phaser.Scene {
  private toast?: Phaser.GameObjects.Text;
  private promotionDialog?: Phaser.GameObjects.Container;
  private captured: ReadonlySet<string> = new Set();
  private selectedJobId: JobId | "junior" = "junior";
  private selectedPathComplete = false;
  private completedJobIds: ReadonlySet<JobId> = new Set();
  private completedSecondaryJobIds: ReadonlySet<SecondaryJobId> = new Set();
  private selectedSecondaryJobId?: SecondaryJobId;
  private selectedTertiaryJobId?: string;
  private commonPathComplete = false;

  constructor() {
    super("job-select");
  }

  preload() {
    JOB_OPTIONS.forEach((job) => {
      this.load.image(job.textureKey!, job.assetPath!);
      if (job.guideTextureKey && job.guideAssetPath) {
        this.load.image(job.guideTextureKey, job.guideAssetPath);
      }
    });
  }

  create() {
    const { width, height } = this.scale;
    this.toast = undefined;
    this.promotionDialog = undefined;
    this.captured = capturedIds(readDexState(this.registry));
    this.commonPathComplete = isCommonPathComplete(this.captured);
    this.selectedJobId = findJob(this.registry.get(JOB_REGISTRY_KEY) as string | undefined).id;
    const careerDex = reconcileCareerDexRegistry(this.registry);
    this.completedJobIds = masteredPrimaryJobIds(careerDex);
    this.completedSecondaryJobIds = masteredSecondaryJobIds(careerDex);
    this.selectedPathComplete =
      this.selectedJobId !== "junior" && this.completedJobIds.has(this.selectedJobId);
    const storedSecondaryJob = findSecondaryJob(
      this.registry.get(SECONDARY_JOB_REGISTRY_KEY) as string | null | undefined
    );
    this.selectedSecondaryJobId =
      storedSecondaryJob && isSecondaryJobUnlocked(storedSecondaryJob, this.completedJobIds)
        ? storedSecondaryJob.id
        : undefined;
    const storedTertiaryJob = findTertiaryJob(
      this.registry.get(TERTIARY_JOB_REGISTRY_KEY) as string | null | undefined
    );
    this.selectedTertiaryJobId =
      storedTertiaryJob && isTertiaryJobUnlocked(storedTertiaryJob, this.completedSecondaryJobIds)
        ? storedTertiaryJob.id
        : undefined;
    this.add.rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 1);

    this.add
      .text(width / 2, 28, t(this, "jobs.title"), {
        ...pixelText("subtitle"),
        color: PALETTE_HEX.cream,
      })
      .setOrigin(0.5);
    this.add
      .text(JUNIOR_X, 63, t(this, "jobs.columnJunior"), {
        ...pixelText("body"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5);
    this.add
      .text(PRIMARY_X, 63, t(this, "jobs.columnPrimary"), {
        ...pixelText("body"),
        color: PALETTE_HEX.amber,
      })
      .setOrigin(0.5);
    this.add
      .text(SECONDARY_X, 63, t(this, "jobs.columnSecondary"), {
        ...pixelText("body"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5);
    this.add
      .text(TERTIARY_X, 63, t(this, "jobs.columnTertiary"), {
        ...pixelText("body"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5);

    this.drawPromotionPaths();
    this.drawJuniorJob();
    JOB_OPTIONS.forEach((job, index) => {
      const selected = this.selectedJobId === job.id;
      const locked = !canSelectPrimaryJob(this.selectedJobId, job.id, this.selectedPathComplete);
      this.drawPrimaryJob(job, ROW_Y[index], selected, locked);
    });
    SECONDARY_JOB_OPTIONS.forEach((job, index) => this.drawSecondaryJob(job, index, ROW_Y[index]));
    TERTIARY_JOB_OPTIONS.forEach((job, index) => this.drawTertiaryJob(job, index, ROW_Y[index]));

    createButton(this, width / 2, height - 28, 140, 32, t(this, "common.back"), () => this.scene.start("world-map"));
    createHomeButton(this).setDepth(30);
    createSettingsButton(this).setDepth(30);
    applyPixelFontToScene(this);
  }

  private drawPromotionPaths() {
    const indexByPrimary = new Map(JOB_OPTIONS.map((job, index) => [job.id, index]));
    const lines = this.add.graphics();

    const stroke = (points: Array<[number, number]>, active = false) => {
      const draw = () => {
        lines.beginPath();
        lines.moveTo(points[0][0], points[0][1]);
        points.slice(1).forEach(([x, y]) => lines.lineTo(x, y));
        lines.strokePath();
      };
      lines.lineStyle(5, PALETTE.ink, 1);
      draw();
      lines.lineStyle(2, active ? PALETTE.amber : PALETTE.mutedBrown, active ? 0.9 : 0.68);
      draw();
    };

    const strokeCurve = (
      start: [number, number],
      end: [number, number],
      active: boolean
    ) => {
      const curve = new Phaser.Curves.CubicBezier(
        new Phaser.Math.Vector2(...start),
        new Phaser.Math.Vector2(start[0] + (end[0] - start[0]) * 0.42, start[1]),
        new Phaser.Math.Vector2(start[0] + (end[0] - start[0]) * 0.58, end[1]),
        new Phaser.Math.Vector2(...end)
      );
      const points = curve.getPoints(24);
      lines.lineStyle(5, PALETTE.ink, 1);
      lines.strokePoints(points, false);
      lines.lineStyle(2, active ? PALETTE.amber : PALETTE.mutedBrown, active ? 0.92 : 0.68);
      lines.strokePoints(points, false);
    };

    const primaryBranchX = 129;
    stroke(
      [
        [JUNIOR_X + JUNIOR_WIDTH / 2, CAREER_CENTER_Y],
        [primaryBranchX, CAREER_CENTER_Y],
      ],
      this.commonPathComplete
    );
    stroke(
      [
        [primaryBranchX, ROW_Y[0]],
        [primaryBranchX, ROW_Y[ROW_Y.length - 1]],
      ],
      this.commonPathComplete
    );
    ROW_Y.forEach((y) =>
      stroke(
        [
          [primaryBranchX, y],
          [PRIMARY_X - PRIMARY_WIDTH / 2, y],
        ],
        this.commonPathComplete
      )
    );

    const connectionCount = new Map<JobId, number>();
    SECONDARY_JOB_OPTIONS.forEach((secondary) =>
      secondary.requires.forEach((jobId) =>
        connectionCount.set(jobId, (connectionCount.get(jobId) ?? 0) + 1)
      )
    );
    const connectionIndex = new Map<JobId, number>();

    SECONDARY_JOB_OPTIONS.forEach((secondary, secondaryIndex) => {
      secondary.requires.forEach((primaryId, branchIndex) => {
        const primaryIndex = indexByPrimary.get(primaryId)!;
        const portIndex = connectionIndex.get(primaryId) ?? 0;
        const portCount = connectionCount.get(primaryId) ?? 1;
        connectionIndex.set(primaryId, portIndex + 1);

        const startY = ROW_Y[primaryIndex] + (portIndex - (portCount - 1) / 2) * 12;
        const endY = ROW_Y[secondaryIndex] + (branchIndex === 0 ? -9 : 9);
        const active = this.completedJobIds.has(primaryId);
        strokeCurve(
          [PRIMARY_X + PRIMARY_WIDTH / 2, startY],
          [SECONDARY_X - SECONDARY_WIDTH / 2, endY],
          active
        );

        this.add
          .circle(SECONDARY_X - SECONDARY_WIDTH / 2, endY, 3, active ? PALETTE.amber : PALETTE.mutedBrown)
          .setStrokeStyle(1, PALETTE.ink);
      });
    });

    TERTIARY_JOB_OPTIONS.forEach((tertiary, index) => {
      const active = this.completedSecondaryJobIds.has(tertiary.requires);
      strokeCurve(
        [SECONDARY_X + SECONDARY_WIDTH / 2, ROW_Y[index]],
        [TERTIARY_X - TERTIARY_WIDTH / 2, ROW_Y[index]],
        active
      );
    });
  }

  private drawJuniorJob() {
    const frame = drawOrnateFrame(this, JUNIOR_X, CAREER_CENTER_Y, JUNIOR_WIDTH, 82, {
      fill: this.selectedJobId === "junior" ? PALETTE.sand : PALETTE.cream,
      radius: 10,
    });
    const juniorName = this.add
      .text(JUNIOR_X, CAREER_CENTER_Y - 15, lt(this, findJob(undefined).name), {
        ...pixelText("body"),
        color: PALETTE_HEX.ink,
      })
      .setOrigin(0.5);
    fitTextInside(juniorName, JUNIOR_WIDTH - 12, 18);
    this.add
      .text(JUNIOR_X, CAREER_CENTER_Y + 8, t(this, "jobs.commonCourse"), {
        ...pixelText("caption"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5);
    this.add
      .text(
        JUNIOR_X,
        CAREER_CENTER_Y + 28,
        this.commonPathComplete ? "CLEAR" : this.selectedJobId === "junior" ? t(this, "common.current") : t(this, "jobs.inProgress"),
        {
          ...pixelText("caption"),
          color: this.commonPathComplete ? PALETTE_HEX.maroon : PALETTE_HEX.mutedBrown,
        }
      )
      .setOrigin(0.5);

    if (this.commonPathComplete) frame.setAlpha(0.92);
  }

  private drawPrimaryJob(job: JobOption, y: number, selected: boolean, locked: boolean) {
    const frame = drawOrnateFrame(this, PRIMARY_X, y, PRIMARY_WIDTH, 62, {
      fill: selected ? PALETTE.sand : PALETTE.cream,
      radius: 10,
    }).setAlpha(locked ? 0.5 : 1);
    this.add.image(PRIMARY_X - 82, y, job.textureKey!).setDisplaySize(50, 50).setAlpha(locked ? 0.35 : 1);
    const name = this.add
      .text(PRIMARY_X - 52, y - 11, lt(this, job.name), {
        ...pixelText("body"),
        color: PALETTE_HEX.ink,
      })
      .setOrigin(0, 0.5)
      .setAlpha(locked ? 0.45 : 1);
    fitTextInside(name, 110, 18);
    const tagline = this.add
      .text(PRIMARY_X - 52, y + 12, lt(this, job.tagline), {
        ...pixelText("caption"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0, 0.5)
      .setAlpha(locked ? 0.45 : 1);
    fitTextInside(tagline, 142, 14);
    if (selected) {
      this.add
        .text(PRIMARY_X + 91, y - 20, t(this, "common.current"), {
          ...pixelText("caption"),
          color: PALETTE_HEX.maroon,
        })
        .setOrigin(0.5);
    } else if (locked) {
      this.add
        .text(PRIMARY_X + 91, y - 20, t(this, "common.locked"), {
          ...pixelText("caption"),
          color: PALETTE_HEX.mutedBrown,
        })
        .setOrigin(0.5);
    }

    const hitArea = this.add
      .rectangle(PRIMARY_X, y, PRIMARY_WIDTH, 62, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    hitArea.on("pointerover", () => frame.setAlpha(0.82));
    hitArea.on("pointerout", () => frame.setAlpha(1));
    hitArea.on("pointerup", () => this.selectJob(job.id));
  }

  private drawSecondaryJob(job: SecondaryJobOption, index: number, y: number) {
    const unlocked = isSecondaryJobUnlocked(job, this.completedJobIds);
    const selected = this.selectedSecondaryJobId === job.id;
    const frame = drawOrnateFrame(this, SECONDARY_X, y, SECONDARY_WIDTH, 52, {
      fill: selected ? PALETTE.sand : unlocked ? PALETTE.cream : PALETTE.wood,
      fillAlpha: 0.94,
      radius: 9,
    });
    this.add
      .text(SECONDARY_X - 74, y, `Ⅱ-${index + 1}`, {
        ...pixelText("micro"),
        color: unlocked ? PALETTE_HEX.maroon : PALETTE_HEX.sand,
      })
      .setOrigin(0, 0.5);
    const name = this.add
      .text(SECONDARY_X + 12, y, unlocked ? lt(this, job.name) : "◆  ???", {
        ...pixelText(unlocked ? "body" : "subtitle"),
        color: unlocked ? PALETTE_HEX.ink : PALETTE_HEX.cream,
        align: "center",
        wordWrap: { width: SECONDARY_WIDTH - 58 },
      })
      .setOrigin(0.5);
    fitTextInside(name, SECONDARY_WIDTH - 58, 32);

    if (selected) {
      this.add
        .text(SECONDARY_X + 69, y - 17, t(this, "common.current"), {
          ...pixelText("caption"),
          color: PALETTE_HEX.maroon,
        })
        .setOrigin(0.5);
    }

    const hitArea = this.add
      .rectangle(SECONDARY_X, y, SECONDARY_WIDTH, 52, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    hitArea.on("pointerover", () => frame.setAlpha(0.78));
    hitArea.on("pointerout", () => frame.setAlpha(1));
    hitArea.on("pointerup", () => this.selectSecondaryJob(job));
  }

  private drawTertiaryJob(job: TertiaryJobOption, index: number, y: number) {
    const unlocked = isTertiaryJobUnlocked(job, this.completedSecondaryJobIds);
    const selected = this.selectedTertiaryJobId === job.id;
    const frame = drawOrnateFrame(this, TERTIARY_X, y, TERTIARY_WIDTH, 52, {
      fill: selected ? PALETTE.sand : unlocked ? PALETTE.cream : PALETTE.wood,
      fillAlpha: 0.94,
      radius: 9,
    });
    this.add
      .text(TERTIARY_X - 69, y, `Ⅲ-${index + 1}`, {
        ...pixelText("micro"),
        color: unlocked ? PALETTE_HEX.maroon : PALETTE_HEX.sand,
      })
      .setOrigin(0, 0.5);
    const name = this.add
      .text(TERTIARY_X + 14, y, unlocked ? lt(this, job.name) : "◆  ???", {
        ...pixelText(unlocked ? "body" : "subtitle"),
        color: unlocked ? PALETTE_HEX.ink : PALETTE_HEX.cream,
        align: "center",
        wordWrap: { width: TERTIARY_WIDTH - 56 },
      })
      .setOrigin(0.5);
    fitTextInside(name, TERTIARY_WIDTH - 56, 32);

    if (selected) {
      this.add
        .text(TERTIARY_X + 64, y - 17, t(this, "common.current"), {
          ...pixelText("caption"),
          color: PALETTE_HEX.maroon,
        })
        .setOrigin(0.5);
    }

    const hitArea = this.add
      .rectangle(TERTIARY_X, y, TERTIARY_WIDTH, 52, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    hitArea.on("pointerover", () => frame.setAlpha(0.78));
    hitArea.on("pointerout", () => frame.setAlpha(1));
    hitArea.on("pointerup", () => this.selectTertiaryJob(job));
  }

  private selectSecondaryJob(job: SecondaryJobOption) {
    if (!isSecondaryJobUnlocked(job, this.completedJobIds)) {
      const requirements = job.requires.map((jobId) => lt(this, findJob(jobId).name)).join(" + ");
      this.toast = showToast(this, t(this, "path.requiresPaths", { names: requirements }), this.toast);
      return;
    }

    if (this.selectedSecondaryJobId !== job.id) {
      this.registry.set(TERTIARY_JOB_REGISTRY_KEY, null);
    }
    activateCareerInRegistry(this.registry, job.id);
    this.registry.set(SECONDARY_JOB_REGISTRY_KEY, job.id);
    const selectedPrimary =
      this.selectedJobId !== "junior" && job.requires.includes(this.selectedJobId)
        ? this.selectedJobId
        : job.requires[0];
    this.scene.start("path-map", {
      careerId: selectedPrimary,
    });
  }

  private selectTertiaryJob(job: TertiaryJobOption) {
    if (!isTertiaryJobUnlocked(job, this.completedSecondaryJobIds)) {
      const required = findSecondaryJob(job.requires);
      this.toast = showToast(
        this,
        t(this, "path.requiresMastery", { name: required ? lt(this, required.name) : t(this, "career.tier2") }),
        this.toast
      );
      return;
    }

    activateCareerInRegistry(this.registry, job.id);
    this.registry.set(TERTIARY_JOB_REGISTRY_KEY, job.id);
    const requiredSecondary = findSecondaryJob(job.requires);
    const selectedPrimary =
      this.selectedJobId !== "junior" && requiredSecondary?.requires.includes(this.selectedJobId)
        ? this.selectedJobId
        : requiredSecondary?.requires[0];
    this.scene.start("path-map", { careerId: selectedPrimary });
  }

  private selectJob(jobId: string) {
    const requestedJobId = jobId as JobId;
    // Before Git and Linux are cleared, choosing a card only previews its path.
    if (!this.commonPathComplete) {
      this.scene.start("path-map", { careerId: requestedJobId });
      return;
    }

    if (!canSelectPrimaryJob(this.selectedJobId, requestedJobId, this.selectedPathComplete)) {
      const currentJob = findJob(this.selectedJobId);
      this.toast = showToast(
        this,
        t(this, "jobs.lockedPrimary", { career: lt(this, currentJob.name) }),
        this.toast
      );
      return;
    }

    if (this.selectedJobId === "junior") {
      this.showPrimaryJobConfirmation(findJob(requestedJobId));
      return;
    }

    activateCareerInRegistry(this.registry, requestedJobId);
    this.registry.set(JOB_REGISTRY_KEY, requestedJobId);
    this.scene.start("world-map");
  }

  private showPrimaryJobConfirmation(job: JobOption) {
    if (this.promotionDialog) return;

    const { width, height } = this.scale;
    const shade = addShade(this, 0.62, 20);
    const frame = drawOrnateFrame(this, width / 2, height / 2, 690, 310, { radius: 14 });
    const title = this.add
      .text(width / 2, height / 2 - 126, t(this, "jobs.confirmTitle", { career: lt(this, job.name) }), {
        ...pixelText("subtitle"),
        color: PALETTE_HEX.ink,
      })
      .setOrigin(0.5);
    fitTextInside(title, 620, 24);
    const playerX = width / 2 - 248;
    const guideX = width / 2 + 248;
    const roleY = height / 2 - 16;
    const playerFrame = drawOrnateFrame(this, playerX, roleY, 150, 190, {
      fill: PALETTE.cream,
      radius: 10,
    });
    const guideFrame = drawOrnateFrame(this, guideX, roleY, 150, 190, {
      fill: PALETTE.wood,
      radius: 10,
    });
    const player = this.add.image(playerX, roleY - 9, job.textureKey!).setDisplaySize(132, 150);
    const guidePortrait = createDialogPortrait(
      this,
      job.guideTextureKey ?? job.textureKey!,
      guideX,
      roleY - 10,
      130,
      148
    );
    const playerLabel = this.add
      .text(playerX, roleY + 76, t(this, "jobs.myCharacter"), {
        ...pixelText("caption"),
        color: PALETTE_HEX.cream,
        backgroundColor: PALETTE_HEX.maroon,
        padding: { x: 7, y: 4 },
      })
      .setOrigin(0.5);
    const guideLabel = this.add
      .text(guideX, roleY + 76, `GUIDE NPC · ${lt(this, guideDisplayName(job))}`, {
        ...pixelText("caption"),
        color: PALETTE_HEX.cream,
        backgroundColor: PALETTE_HEX.ink,
        padding: { x: 7, y: 4 },
      })
      .setOrigin(0.5);
    fitTextInside(guideLabel, 140, 15);
    const body = this.add
      .text(
        width / 2,
        height / 2 - 35,
        t(this, "jobs.confirmBody"),
        {
          ...pixelText("body"),
          color: PALETTE_HEX.mutedBrown,
          align: "center",
          lineSpacing: 8,
        }
      )
      .setOrigin(0.5);
    const cancel = createButton(this, width / 2 - 88, height / 2 + 123, 128, 34, t(this, "common.cancel"), () => {
      this.promotionDialog?.destroy(true);
      this.promotionDialog = undefined;
    });
    const confirm = createButton(
      this,
      width / 2 + 88,
      height / 2 + 123,
      128,
      34,
      t(this, "jobs.promote"),
      () => {
        activateCareerInRegistry(this.registry, job.id);
        this.registry.set(JOB_REGISTRY_KEY, job.id);
        this.scene.start("world-map");
      }
    );

    this.promotionDialog = this.add
      .container(0, 0, [
        shade,
        frame,
        title,
        playerFrame,
        guideFrame,
        player,
        ...guidePortrait,
        playerLabel,
        guideLabel,
        body,
        cancel,
        confirm,
      ])
      .setDepth(20)
      .setAlpha(0);
    this.tweens.add({
      targets: this.promotionDialog,
      alpha: 1,
      duration: 180,
      ease: "Quad.Out",
    });
    applyPixelFontToScene(this);
  }
}
