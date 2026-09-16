import Phaser from "phaser";
import { isCommonPathComplete } from "@codigdex/game-content/domain/chapters";
import {
  masteredPrimaryJobIds,
  masteredSecondaryJobIds,
} from "@codigdex/game-content/domain/careerDex";
import { capturedIds } from "@codigdex/game-core/domain/dex/capture";
import {
  canSelectPrimaryJob,
  findJob,
  findSecondaryJob,
  findTertiaryJob,
  isSecondaryJobUnlocked,
  isTertiaryJobUnlocked,
  JOB_OPTIONS,
  JOB_REGISTRY_KEY,
  SECONDARY_JOB_REGISTRY_KEY,
  TERTIARY_JOB_REGISTRY_KEY,
  type JobId,
  type PrimaryJobOption,
  type SecondaryJobId,
  type SecondaryJobOption,
  type TertiaryJobOption,
} from "@codigdex/game-content/domain/player/jobs";
import { assetUrl } from "../../assets";
import { lt, t } from "../i18n";
import { drawCareerTree } from "../jobSelect/careerTree";
import { revealedTertiaryRequirement } from "../jobSelect/careerVisibility";
import { createPromotionDialog } from "../jobSelect/promotionDialog";
import { createHomeButton } from "../navigation";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import {
  activateCareerInRegistry,
  readDexState,
  reconcileCareerDexRegistry,
} from "../registryAdapter";
import { createSettingsButton } from "../settings/settingsButton";
import { applyPixelFontToScene, createButton, showToast } from "../ui";

/** Shows the full junior → primary → secondary → tertiary career lineage. */
export class JobSelectScene extends Phaser.Scene {
  private toast?: Phaser.GameObjects.Text;
  private promotionDialog?: Phaser.GameObjects.Container;
  private promotionDialogLoading = false;
  private selectedJobId: JobId | "junior" = "junior";
  private selectedPathComplete = false;
  private completedJobIds: ReadonlySet<JobId> = new Set();
  private completedSecondaryJobIds: ReadonlySet<SecondaryJobId> = new Set();
  private selectedSecondaryJobId?: SecondaryJobId;
  private selectedTertiaryJobId?: string;
  private commonPathComplete = false;
  private viewGeneration = 0;

  constructor() {
    super("job-select");
  }

  preload() {
    JOB_OPTIONS.forEach((job) => {
      this.load.image(job.textureKey!, assetUrl(job.assetKey!));
    });
  }

  create() {
    const { width, height } = this.scale;
    this.resetViewState();
    this.loadProgressState();

    this.add.rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 1);
    this.add
      .text(width / 2, 28, t(this, "jobs.title"), {
        ...pixelText("subtitle"),
        color: PALETTE_HEX.cream,
      })
      .setOrigin(0.5);
    drawCareerTree(
      this,
      {
        selectedJobId: this.selectedJobId,
        selectedPathComplete: this.selectedPathComplete,
        completedJobIds: this.completedJobIds,
        completedSecondaryJobIds: this.completedSecondaryJobIds,
        selectedSecondaryJobId: this.selectedSecondaryJobId,
        selectedTertiaryJobId: this.selectedTertiaryJobId,
        commonPathComplete: this.commonPathComplete,
      },
      {
        onPrimaryJob: (job) => this.selectPrimaryJob(job),
        onSecondaryJob: (job) => this.selectSecondaryJob(job),
        onTertiaryJob: (job) => this.selectTertiaryJob(job),
      }
    );
    createButton(this, width / 2, height - 28, 140, 32, t(this, "common.back"), () =>
      this.scene.start("world-map")
    );
    createHomeButton(this).setDepth(30);
    createSettingsButton(this).setDepth(30);
    applyPixelFontToScene(this);
  }

  private resetViewState() {
    this.viewGeneration += 1;
    this.toast = undefined;
    this.promotionDialog = undefined;
    this.promotionDialogLoading = false;
  }

  private loadProgressState() {
    const captured = capturedIds(readDexState(this.registry));
    this.commonPathComplete = isCommonPathComplete(captured);
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
  }

  private selectSecondaryJob(job: SecondaryJobOption) {
    if (!isSecondaryJobUnlocked(job, this.completedJobIds)) {
      const requirements = job.requires.map((jobId) => lt(this, findJob(jobId).name)).join(" + ");
      this.toast = showToast(
        this,
        t(this, "path.requiresPaths", { names: requirements }),
        this.toast
      );
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
    this.scene.start("path-map", { careerId: selectedPrimary });
  }

  private selectTertiaryJob(job: TertiaryJobOption) {
    if (!isTertiaryJobUnlocked(job, this.completedSecondaryJobIds)) {
      const required = revealedTertiaryRequirement(job, this.completedJobIds);
      this.toast = showToast(
        this,
        t(this, "path.requiresMastery", {
          name: required ? lt(this, required.name) : t(this, "career.tier2"),
        }),
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

  private selectPrimaryJob(job: PrimaryJobOption) {
    const jobId = job.id;
    if (!this.commonPathComplete) {
      this.scene.start("path-map", { careerId: jobId });
      return;
    }
    if (!canSelectPrimaryJob(this.selectedJobId, jobId, this.selectedPathComplete)) {
      const currentJob = findJob(this.selectedJobId);
      this.toast = showToast(
        this,
        t(this, "jobs.lockedPrimary", { career: lt(this, currentJob.name) }),
        this.toast
      );
      return;
    }
    if (this.selectedJobId === "junior") {
      this.showPrimaryJobConfirmation(job);
      return;
    }

    this.activatePrimaryJob(jobId);
  }

  private showPrimaryJobConfirmation(job: PrimaryJobOption) {
    if (this.promotionDialog || this.promotionDialogLoading) return;
    if (
      job.guideTextureKey &&
      job.guideAssetKey &&
      !this.textures.exists(job.guideTextureKey)
    ) {
      this.promotionDialogLoading = true;
      const generation = this.viewGeneration;
      this.load.once(`filecomplete-image-${job.guideTextureKey}`, () => {
        this.promotionDialogLoading = false;
        if (this.sys.isActive() && this.viewGeneration === generation) {
          this.showPrimaryJobConfirmation(job);
        }
      });
      this.load.image(job.guideTextureKey, assetUrl(job.guideAssetKey));
      if (!this.load.isLoading()) this.load.start();
      return;
    }
    this.promotionDialog = createPromotionDialog(this, job, {
      onCancel: () => {
        this.promotionDialog?.destroy(true);
        this.promotionDialog = undefined;
      },
      onConfirm: () => this.activatePrimaryJob(job.id),
    });
  }

  private activatePrimaryJob(jobId: JobId) {
    activateCareerInRegistry(this.registry, jobId);
    this.registry.set(JOB_REGISTRY_KEY, jobId);
    this.scene.start("world-map");
  }
}
