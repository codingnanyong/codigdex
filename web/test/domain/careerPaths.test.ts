import { describe, expect, it } from "vitest";
import {
  CAREER_PATHS,
  canLeaveCareerPath,
  careerPathFor,
  completedCareerPathIds,
  isCareerPathComplete,
  type CareerPathDefinition,
} from "@/lib/phaser/worldMap/careerPaths";
import {
  canSelectPrimaryJob,
  completedSecondaryJobIds,
  isTertiaryJobUnlocked,
  isSecondaryJobUnlocked,
  JOB_OPTIONS,
  SECONDARY_JOB_OPTIONS,
  secondaryJobsFor,
  TERTIARY_JOB_OPTIONS,
  tertiaryJobsFor,
  type JobId,
} from "@codigdex/game-content/domain/player/jobs";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";

describe("career paths", () => {
  it("gives every primary job a detailed map with several dex destinations", () => {
    const primaryIds = JOB_OPTIONS.map((job) => job.id) as JobId[];
    expect(Object.keys(CAREER_PATHS).sort()).toEqual([...primaryIds].sort());

    primaryIds.forEach((jobId) => {
      const path = careerPathFor(jobId);
      expect(path.regions.length).toBeGreaterThanOrEqual(5);
      expect(path.regions.every(({ x, y }) => x > 0 && x < 960 && y > 50 && y < 540)).toBe(true);
      expect(path.regions.every(({ landmark }) => landmark !== undefined)).toBe(true);
      expect(path.regions.every(({ focusPoints }) => focusPoints.length >= 6)).toBe(true);
      expect(path.regions.every(({ lift }) => lift.points.length >= 8)).toBe(true);
      expect(
        path.regions.every(({ landmark, focusPoints }) => {
          const left = landmark.x - landmark.width / 2;
          const top = landmark.y - landmark.height / 2;
          const absolutePoints = focusPoints.map(([x, y]) => [x + left, y + top]);
          const xs = absolutePoints.map(([x]) => x);
          const ys = absolutePoints.map(([, y]) => y);
          return (
            Math.min(...xs) === landmark.x - landmark.width / 2 &&
            Math.max(...xs) === landmark.x + landmark.width / 2 &&
            Math.min(...ys) === landmark.y - landmark.height / 2 &&
            Math.max(...ys) === landmark.y + landmark.height / 2
          );
        })
      ).toBe(true);
      expect(
        path.regions.every(({ lift }) => {
          const xs = lift.points.map(([x]) => x);
          const ys = lift.points.map(([, y]) => y);
          return (
            Math.min(...xs) === 0 &&
            Math.max(...xs) === lift.width &&
            Math.min(...ys) === 0 &&
            Math.max(...ys) === lift.height &&
            lift.x - lift.width / 2 >= 0 &&
            lift.x + lift.width / 2 <= 960 &&
            lift.y - lift.height / 2 >= 0 &&
            lift.y + lift.height / 2 <= 540
          );
        })
      ).toBe(true);
      expect(
        path.regions.every(({ landmark }) =>
          landmark
            ? landmark.x - landmark.width / 2 >= 0 &&
              landmark.x + landmark.width / 2 <= 960 &&
              landmark.y - landmark.height / 2 >= 0 &&
              landmark.y + landmark.height / 2 <= 540
            : true
        )
      ).toBe(true);
    });
  });

  it("keeps future tier-two identities modeled while the UI can render them as mysteries", () => {
    expect(SECONDARY_JOB_OPTIONS.map((job) => job.id)).toContain("fullstack-engineer");
    expect(SECONDARY_JOB_OPTIONS.map((job) => job.id)).toContain("ml-developer");
    expect(secondaryJobsFor("backend").length).toBeGreaterThan(1);
  });

  it("places the data analyst Python destination on the lower-right locked island", () => {
    const python = CAREER_PATHS["data-analyst"].regions.find(({ id }) => id === "python");

    expect(python).toBeDefined();
    expect(python!.x).toBeGreaterThan(700);
    expect(python!.y).toBeGreaterThan(350);
    expect(python!.lift.x).toBeGreaterThan(700);
    expect(python!.lift.y).toBeGreaterThan(350);
  });
});

describe("primary job changes", () => {
  const path = {
    ...CAREER_PATHS.frontend,
    completionCaptureIds: ["html-css-final", "javascript-final"],
  } satisfies CareerPathDefinition;

  it("derives path completion only when every required chapter capture exists", () => {
    expect(isCareerPathComplete(path, new Set())).toBe(false);
    expect(isCareerPathComplete(path, new Set(["html-css-final"]))).toBe(false);
    expect(isCareerPathComplete(path, new Set(["html-css-final", "javascript-final"]))).toBe(true);
  });

  it("derives released path requirements from each region's final checkpoint", () => {
    Object.values(CAREER_PATHS).forEach((careerPath) => {
      expect(careerPath.completionCaptureIds).toEqual(
        careerPath.regions.map((careerRegion) =>
          monstersForCareerRegion(careerRegion.id).at(-1)?.id
        )
      );
      expect(isCareerPathComplete(careerPath, new Set(careerPath.completionCaptureIds))).toBe(true);
      expect(canLeaveCareerPath(careerPath, new Set(careerPath.completionCaptureIds))).toBe(true);
    });
  });

  it("requires every capture before leaving a released career path", () => {
    expect(canLeaveCareerPath(path, new Set(["html-css-final"]))).toBe(false);
    expect(canLeaveCareerPath(path, new Set(["html-css-final", "javascript-final"]))).toBe(true);
  });

  it("locks another primary job until the current path is complete", () => {
    expect(canSelectPrimaryJob("frontend", "backend", false)).toBe(false);
    expect(canSelectPrimaryJob("frontend", "frontend", false)).toBe(true);
    expect(canSelectPrimaryJob("frontend", "backend", true)).toBe(true);
    expect(canSelectPrimaryJob("junior", "backend", false)).toBe(true);
  });

  it("unlocks only the tier-two jobs whose two primary paths are complete", () => {
    const completed = new Set<JobId>(["frontend", "backend"]);
    expect(isSecondaryJobUnlocked(SECONDARY_JOB_OPTIONS[0], completed)).toBe(true);
    expect(isSecondaryJobUnlocked(SECONDARY_JOB_OPTIONS[1], completed)).toBe(false);
  });

  it("maps each tier-two job to one tier-three mastery path", () => {
    SECONDARY_JOB_OPTIONS.forEach((secondary) => {
      const [tertiary] = tertiaryJobsFor(secondary.id);
      expect(tertiary?.requires).toBe(secondary.id);
    });
    expect(TERTIARY_JOB_OPTIONS).toHaveLength(SECONDARY_JOB_OPTIONS.length);
  });

  it("unlocks tier three only after its tier-two mastery captures are complete", () => {
    const fullstack = {
      ...SECONDARY_JOB_OPTIONS[0],
      masteryCaptureIds: ["fullstack-capstone"],
    };
    const completed = completedSecondaryJobIds(new Set(["fullstack-capstone"]), [fullstack]);

    expect(isTertiaryJobUnlocked(TERTIARY_JOB_OPTIONS[0], completed)).toBe(true);
    expect(isTertiaryJobUnlocked(TERTIARY_JOB_OPTIONS[1], completed)).toBe(false);
  });

  it("lists every primary path completed by the captured requirements", () => {
    const paths = {
      ...CAREER_PATHS,
      frontend: { ...CAREER_PATHS.frontend, completionCaptureIds: ["frontend-final"] },
      backend: { ...CAREER_PATHS.backend, completionCaptureIds: ["backend-final"] },
    };

    expect(completedCareerPathIds(new Set(["frontend-final", "backend-final"]), paths)).toEqual(
      new Set(["frontend", "backend"])
    );
  });
});
