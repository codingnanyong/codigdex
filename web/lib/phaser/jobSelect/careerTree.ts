import Phaser from "phaser";
import {
  canSelectPrimaryJob,
  findJob,
  isSecondaryJobUnlocked,
  isTertiaryJobUnlocked,
  JOB_OPTIONS,
  SECONDARY_JOB_OPTIONS,
  TERTIARY_JOB_OPTIONS,
  type JobId,
  type PrimaryJobOption,
  type SecondaryJobId,
  type SecondaryJobOption,
  type TertiaryJobOption,
} from "@codigdex/game-content/domain/player/jobs";
import { lt, t } from "../i18n";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { drawOrnateFrame, fitTextInside } from "../ui";
import { JOB_SELECT_LAYOUT as LAYOUT } from "./layout";
import { drawPromotionPaths } from "./promotionPaths";

export type CareerTreeState = {
  selectedJobId: JobId | "junior";
  selectedPathComplete: boolean;
  completedJobIds: ReadonlySet<JobId>;
  completedSecondaryJobIds: ReadonlySet<SecondaryJobId>;
  selectedSecondaryJobId?: SecondaryJobId;
  selectedTertiaryJobId?: string;
  commonPathComplete: boolean;
};

export type CareerTreeActions = {
  onPrimaryJob: (job: PrimaryJobOption) => void;
  onSecondaryJob: (job: SecondaryJobOption) => void;
  onTertiaryJob: (job: TertiaryJobOption) => void;
};

export function drawCareerTree(
  scene: Phaser.Scene,
  state: CareerTreeState,
  actions: CareerTreeActions
) {
  drawColumnHeadings(scene);
  drawPromotionPaths(scene, state);
  drawJuniorJob(scene, state);
  JOB_OPTIONS.forEach((job, index) => {
    const selected = state.selectedJobId === job.id;
    const locked = !canSelectPrimaryJob(
      state.selectedJobId,
      job.id,
      state.selectedPathComplete
    );
    drawPrimaryJob(scene, job, LAYOUT.rowY[index], selected, locked, () =>
      actions.onPrimaryJob(job)
    );
  });
  SECONDARY_JOB_OPTIONS.forEach((job, index) => {
    const unlocked = isSecondaryJobUnlocked(job, state.completedJobIds);
    drawAdvancedJob(scene, {
      x: LAYOUT.secondaryX,
      width: LAYOUT.secondaryWidth,
      y: LAYOUT.rowY[index],
      tier: "Ⅱ",
      index,
      name: unlocked ? lt(scene, job.name) : "◆  ???",
      selected: state.selectedSecondaryJobId === job.id,
      unlocked,
      onSelect: () => actions.onSecondaryJob(job),
    });
  });
  TERTIARY_JOB_OPTIONS.forEach((job, index) => {
    const unlocked = isTertiaryJobUnlocked(job, state.completedSecondaryJobIds);
    drawAdvancedJob(scene, {
      x: LAYOUT.tertiaryX,
      width: LAYOUT.tertiaryWidth,
      y: LAYOUT.rowY[index],
      tier: "Ⅲ",
      index,
      name: unlocked ? lt(scene, job.name) : "◆  ???",
      selected: state.selectedTertiaryJobId === job.id,
      unlocked,
      onSelect: () => actions.onTertiaryJob(job),
    });
  });
}

function drawColumnHeadings(scene: Phaser.Scene) {
  const headings = [
    [LAYOUT.juniorX, "jobs.columnJunior", PALETTE_HEX.mutedBrown],
    [LAYOUT.primaryX, "jobs.columnPrimary", PALETTE_HEX.amber],
    [LAYOUT.secondaryX, "jobs.columnSecondary", PALETTE_HEX.mutedBrown],
    [LAYOUT.tertiaryX, "jobs.columnTertiary", PALETTE_HEX.mutedBrown],
  ] as const;
  headings.forEach(([x, key, color]) => {
    scene.add
      .text(x, 63, t(scene, key), { ...pixelText("body"), color })
      .setOrigin(0.5);
  });
}

function drawJuniorJob(scene: Phaser.Scene, state: CareerTreeState) {
  const frame = drawOrnateFrame(
    scene,
    LAYOUT.juniorX,
    LAYOUT.careerCenterY,
    LAYOUT.juniorWidth,
    82,
    { fill: state.selectedJobId === "junior" ? PALETTE.sand : PALETTE.cream, radius: 10 }
  );
  const juniorName = scene.add
    .text(
      LAYOUT.juniorX,
      LAYOUT.careerCenterY - 15,
      lt(scene, findJob(undefined).name),
      { ...pixelText("body"), color: PALETTE_HEX.ink }
    )
    .setOrigin(0.5);
  fitTextInside(juniorName, LAYOUT.juniorWidth - 12, 18);
  scene.add
    .text(LAYOUT.juniorX, LAYOUT.careerCenterY + 8, t(scene, "jobs.commonCourse"), {
      ...pixelText("caption"),
      color: PALETTE_HEX.mutedBrown,
    })
    .setOrigin(0.5);
  scene.add
    .text(
      LAYOUT.juniorX,
      LAYOUT.careerCenterY + 28,
      state.commonPathComplete
        ? "CLEAR"
        : state.selectedJobId === "junior"
          ? t(scene, "common.current")
          : t(scene, "jobs.inProgress"),
      {
        ...pixelText("caption"),
        color: state.commonPathComplete ? PALETTE_HEX.maroon : PALETTE_HEX.mutedBrown,
      }
    )
    .setOrigin(0.5);
  if (state.commonPathComplete) frame.setAlpha(0.92);
}

function drawPrimaryJob(
  scene: Phaser.Scene,
  job: PrimaryJobOption,
  y: number,
  selected: boolean,
  locked: boolean,
  onSelect: () => void
) {
  const frame = drawOrnateFrame(scene, LAYOUT.primaryX, y, LAYOUT.primaryWidth, 62, {
    fill: selected ? PALETTE.sand : PALETTE.cream,
    radius: 10,
  }).setAlpha(locked ? 0.5 : 1);
  scene.add
    .image(LAYOUT.primaryX - 82, y, job.textureKey!)
    .setDisplaySize(50, 50)
    .setAlpha(locked ? 0.35 : 1);
  const name = scene.add
    .text(LAYOUT.primaryX - 52, y - 11, lt(scene, job.name), {
      ...pixelText("body"),
      color: PALETTE_HEX.ink,
    })
    .setOrigin(0, 0.5)
    .setAlpha(locked ? 0.45 : 1);
  fitTextInside(name, 110, 18);
  const tagline = scene.add
    .text(LAYOUT.primaryX - 52, y + 12, lt(scene, job.tagline), {
      ...pixelText("caption"),
      color: PALETTE_HEX.mutedBrown,
    })
    .setOrigin(0, 0.5)
    .setAlpha(locked ? 0.45 : 1);
  fitTextInside(tagline, 142, 14);
  if (selected || locked) {
    scene.add
      .text(
        LAYOUT.primaryX + 91,
        y - 20,
        t(scene, selected ? "common.current" : "common.locked"),
        {
          ...pixelText("caption"),
          color: selected ? PALETTE_HEX.maroon : PALETTE_HEX.mutedBrown,
        }
      )
      .setOrigin(0.5);
  }
  addHitArea(scene, LAYOUT.primaryX, y, LAYOUT.primaryWidth, 62, frame, onSelect, locked ? 1 : 0.82);
}

type AdvancedJobCardOptions = {
  x: number;
  width: number;
  y: number;
  tier: "Ⅱ" | "Ⅲ";
  index: number;
  name: string;
  selected: boolean;
  unlocked: boolean;
  onSelect: () => void;
};

function drawAdvancedJob(scene: Phaser.Scene, options: AdvancedJobCardOptions) {
  const { x, width, y, tier, index, name, selected, unlocked, onSelect } = options;
  const frame = drawOrnateFrame(scene, x, y, width, 52, {
    fill: selected ? PALETTE.sand : unlocked ? PALETTE.cream : PALETTE.wood,
    fillAlpha: 0.94,
    radius: 9,
  });
  scene.add
    .text(x - (width / 2 - 16), y, `${tier}-${index + 1}`, {
      ...pixelText("micro"),
      color: unlocked ? PALETTE_HEX.maroon : PALETTE_HEX.sand,
    })
    .setOrigin(0, 0.5);
  const label = scene.add
    .text(x + (tier === "Ⅱ" ? 12 : 14), y, name, {
      ...pixelText(unlocked ? "body" : "subtitle"),
      color: unlocked ? PALETTE_HEX.ink : PALETTE_HEX.cream,
      align: "center",
      wordWrap: { width: width - (tier === "Ⅱ" ? 58 : 56) },
    })
    .setOrigin(0.5);
  fitTextInside(label, width - (tier === "Ⅱ" ? 58 : 56), 32);
  if (selected) {
    scene.add
      .text(x + (tier === "Ⅱ" ? 69 : 64), y - 17, t(scene, "common.current"), {
        ...pixelText("caption"),
        color: PALETTE_HEX.maroon,
      })
      .setOrigin(0.5);
  }
  addHitArea(scene, x, y, width, 52, frame, onSelect, 0.78);
}

function addHitArea(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  frame: Phaser.GameObjects.Graphics,
  onSelect: () => void,
  hoverAlpha: number
) {
  const restingAlpha = frame.alpha;
  const hitArea = scene.add
    .rectangle(x, y, width, height, 0xffffff, 0)
    .setInteractive({ useHandCursor: true });
  hitArea.on("pointerover", () => frame.setAlpha(hoverAlpha));
  hitArea.on("pointerout", () => frame.setAlpha(restingAlpha));
  hitArea.on("pointerup", onSelect);
}
