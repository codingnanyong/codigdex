import Phaser from "phaser";
import {
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
import { lt, t, sceneLocale } from "../i18n";
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
  selectablePrimaryJobIds: ReadonlySet<JobId>;
  selectableAdvancedJobIds: ReadonlySet<string>;
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
    const selected = !state.selectedSecondaryJobId && state.selectedJobId === job.id;
    const locked = !state.selectablePrimaryJobIds.has(job.id);
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
      name: unlocked ? lt(scene, job.name) : "???",
      selected: state.selectedSecondaryJobId === job.id,
      unlocked,
      selectable: state.selectableAdvancedJobIds.has(job.id),
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
      name: unlocked ? lt(scene, job.name) : "???",
      selected: state.selectedTertiaryJobId === job.id,
      unlocked,
      selectable: state.selectableAdvancedJobIds.has(job.id),
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
    .setAlpha(locked ? 0.75 : 1);
  fitTextInside(name, 110, 18);
  const tagline = scene.add
    .text(LAYOUT.primaryX - 52, y + 12, locked ? (sceneLocale(scene) === "ko" ? "선행 경로 완료 필요" : "COMPLETE REQUIRED PATHS") : lt(scene, job.tagline), {
      ...pixelText("caption"),
      color: PALETTE_HEX.mutedBrown,
    })
    .setOrigin(0, 0.5)
    .setAlpha(locked ? 0.75 : 1);
  fitTextInside(tagline, 142, 14);
  if (selected || locked) {
    const badge = scene.add
      .text(
        LAYOUT.primaryX + LAYOUT.primaryWidth / 2 - 8,
        y - 20,
        t(scene, selected ? "common.current" : "common.locked"),
        {
          ...pixelText("caption"),
          color: selected ? PALETTE_HEX.maroon : PALETTE_HEX.mutedBrown,
        }
      )
      .setOrigin(1, 0.5);
    fitTextInside(badge, 56, 12);
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
  selectable?: boolean;
  onSelect: () => void;
};

function drawAdvancedJob(scene: Phaser.Scene, options: AdvancedJobCardOptions) {
  const { x, width, y, tier, index, name, selected, unlocked, onSelect } = options;
  const locked = !unlocked || options.selectable === false;
  const frame = drawOrnateFrame(scene, x, y, width, 62, {
    fill: selected ? PALETTE.sand : PALETTE.cream,
    radius: 10,
  }).setAlpha(locked ? 0.5 : 1);
  scene.add.text(x - width / 2 + 12, y - 4, `${tier}·${index + 1}`, {
    ...pixelText("caption"), color: PALETTE_HEX.mutedBrown,
  }).setOrigin(0, 0.5).setAlpha(locked ? 0.75 : 1);
  const label = scene.add.text(x + 12, y, name, {
    ...pixelText("body"), color: PALETTE_HEX.ink, align: "center",
    wordWrap: { width: width - 54 },
  }).setOrigin(0.5).setAlpha(locked ? 0.75 : 1);
  fitTextInside(label, width - 54, 26);
  const subtitle = scene.add.text(x, y + 20, locked
    ? (sceneLocale(scene) === "ko" ? "선행 경로 완료 필요" : "COMPLETE REQUIRED PATHS")
    : t(scene, tier === "Ⅱ" ? "path.tier2" : "path.tier3"), {
    ...pixelText("caption"), color: PALETTE_HEX.mutedBrown,
  }).setOrigin(0.5).setAlpha(locked ? 0.75 : 1);
  fitTextInside(subtitle, width - 16, 14);
  if (selected || locked) {
    const badge = scene.add.text(x + width / 2 - 8, y - 22,
    t(scene, selected ? "common.current" : "common.locked"), {
      ...pixelText("caption"), color: selected ? PALETTE_HEX.maroon : PALETTE_HEX.mutedBrown,
    }).setOrigin(1, 0.5);
    fitTextInside(badge, 56, 12);
  }
  // Like primary cards, locked cards explain their gate without selecting it.
  addHitArea(scene, x, y, width, 62, frame, onSelect, locked ? 0.5 : 0.82);
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
