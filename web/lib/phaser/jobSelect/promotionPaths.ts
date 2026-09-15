import Phaser from "phaser";
import {
  JOB_OPTIONS,
  SECONDARY_JOB_OPTIONS,
  TERTIARY_JOB_OPTIONS,
  type JobId,
  type SecondaryJobId,
} from "@/lib/domain/player/jobs";
import { PALETTE } from "../palette";
import { JOB_SELECT_LAYOUT as LAYOUT } from "./layout";

export type PromotionPathState = {
  commonPathComplete: boolean;
  completedJobIds: ReadonlySet<JobId>;
  completedSecondaryJobIds: ReadonlySet<SecondaryJobId>;
};

export function drawPromotionPaths(scene: Phaser.Scene, state: PromotionPathState) {
  const indexByPrimary = new Map(JOB_OPTIONS.map((job, index) => [job.id, index]));
  const lines = scene.add.graphics();
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
  const strokeCurve = (start: [number, number], end: [number, number], active: boolean) => {
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
      [LAYOUT.juniorX + LAYOUT.juniorWidth / 2, LAYOUT.careerCenterY],
      [primaryBranchX, LAYOUT.careerCenterY],
    ],
    state.commonPathComplete
  );
  stroke(
    [
      [primaryBranchX, LAYOUT.rowY[0]],
      [primaryBranchX, LAYOUT.rowY[LAYOUT.rowY.length - 1]],
    ],
    state.commonPathComplete
  );
  LAYOUT.rowY.forEach((y) =>
    stroke(
      [
        [primaryBranchX, y],
        [LAYOUT.primaryX - LAYOUT.primaryWidth / 2, y],
      ],
      state.commonPathComplete
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

      const startY = LAYOUT.rowY[primaryIndex] + (portIndex - (portCount - 1) / 2) * 12;
      const endY = LAYOUT.rowY[secondaryIndex] + (branchIndex === 0 ? -9 : 9);
      const active = state.completedJobIds.has(primaryId);
      strokeCurve(
        [LAYOUT.primaryX + LAYOUT.primaryWidth / 2, startY],
        [LAYOUT.secondaryX - LAYOUT.secondaryWidth / 2, endY],
        active
      );
      scene.add
        .circle(
          LAYOUT.secondaryX - LAYOUT.secondaryWidth / 2,
          endY,
          3,
          active ? PALETTE.amber : PALETTE.mutedBrown
        )
        .setStrokeStyle(1, PALETTE.ink);
    });
  });
  TERTIARY_JOB_OPTIONS.forEach((tertiary, index) => {
    const active = state.completedSecondaryJobIds.has(tertiary.requires);
    strokeCurve(
      [LAYOUT.secondaryX + LAYOUT.secondaryWidth / 2, LAYOUT.rowY[index]],
      [LAYOUT.tertiaryX - LAYOUT.tertiaryWidth / 2, LAYOUT.rowY[index]],
      active
    );
  });
}
