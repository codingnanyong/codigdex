import Phaser from "phaser";
import type { ChapterDefinition, MonsterDefinition } from "@/lib/domain/chapters/types";
import type { JobOption } from "@/lib/domain/player/jobs";
import { currentStageIndex } from "@/lib/domain/chapters";
import { fitTexture } from "../monsterArt";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { drawOrnateFrame } from "../ui";
import {
  drawChapterRoute,
  routeEntryPointsFor,
  routePointsFor,
  routeTravelPointsFor,
} from "./chapterRoute";
import { QuestMarker } from "./questMarker";
import { WorldMapPlayer } from "./playerMovement";

type QuestStageOptions = {
  chapter: ChapterDefinition;
  monster: MonsterDefinition;
  captured: ReadonlySet<string>;
  selectedJob: JobOption;
  questLabel: string;
  onboardingPending: boolean;
  lastRouteIndex: Map<string, number>;
  hud: Phaser.GameObjects.Container;
  movementHint: string;
  onQuest: () => void;
  onPlayerInteract: (monsterPosition: { x: number; y: number }) => void;
};

export type QuestStageActors = {
  player: WorldMapPlayer;
  quest?: QuestMarker;
  tutorialTravel?: () => void;
};

export function createQuestStage(
  scene: Phaser.Scene,
  options: QuestStageOptions
): QuestStageActors {
  const { chapter, monster, captured } = options;
  const activeIndex = currentStageIndex(chapter, captured);
  const route = routePointsFor(chapter);
  const point = route?.[activeIndex];
  const monsterX = point?.x ?? 604;
  const monsterY = point ? point.y - 98 : 270;
  const npcTargetX = point
    ? point.x
    : Phaser.Math.Clamp(
        monsterX + (monsterX < scene.scale.width / 2 ? 126 : -126),
        92,
        scene.scale.width - 92
      );
  const npcTargetY = point?.y ?? monsterY + 18;
  const lastIndex = options.lastRouteIndex.get(chapter.id);
  const shouldTravel = lastIndex !== undefined && activeIndex === lastIndex + 1;
  const tutorialEntry =
    chapter.id === "tutorial" && options.onboardingPending
      ? routeEntryPointsFor(chapter)
      : undefined;
  options.lastRouteIndex.set(chapter.id, activeIndex);
  const previousPoint = shouldTravel ? route?.[activeIndex - 1] : undefined;
  const npcStartX = tutorialEntry?.[0].x ?? previousPoint?.x ?? npcTargetX;
  const npcStartY = tutorialEntry?.[0].y ?? previousPoint?.y ?? npcTargetY;

  drawChapterRoute(scene, chapter, captured, activeIndex, options.onQuest);
  drawCheckpointMonsters(scene, chapter, route, activeIndex, captured);
  const player = new WorldMapPlayer(scene, {
    textureKey: options.selectedJob.overworldTextureKey,
    start: { x: npcStartX, y: npcStartY },
    onInteract: () => options.onPlayerInteract({ x: monsterX, y: monsterY }),
  });

  scene.add.ellipse(monsterX, monsterY + 62, 100, 20, PALETTE.nightBrown, 0.28).setDepth(2);
  const monsterFit = fitTexture(scene, monster.textureKey, 128, 128);
  const monsterImage = scene.add
    .image(monsterX, monsterY, monster.textureKey)
    .setScale(monsterFit.scale)
    .setDepth(3)
    .setInteractive({ useHandCursor: true });
  monsterImage.on("pointerup", options.onQuest);

  let tutorialTravel: (() => void) | undefined;
  if (shouldTravel && previousPoint) {
    const travelPoints = routeTravelPointsFor(chapter, activeIndex);
    if (travelPoints) player.followPath(travelPoints);
  } else if (tutorialEntry) {
    tutorialTravel = () => player.followPath(tutorialEntry);
  }

  const movementFrame = drawOrnateFrame(
    scene,
    scene.scale.width / 2,
    scene.scale.height - 18,
    520,
    28,
    { fillAlpha: 0.9, radius: 8 }
  );
  const movementHint = scene.add
    .text(scene.scale.width / 2, scene.scale.height - 18, options.movementHint, {
      ...pixelText("caption"),
      color: PALETTE_HEX.ink,
    })
    .setOrigin(0.5);
  options.hud.add([movementFrame, movementHint]);
  scene.tweens.add({
    targets: monsterImage,
    y: "-=5",
    duration: 1100,
    delay: 240,
    ease: "Sine.InOut",
    yoyo: true,
    repeat: -1,
  });

  const labelY = Math.max(92, monsterY - 92);
  let quest: QuestMarker | undefined;
  if (route) {
    drawOrnateFrame(scene, monsterX, labelY, 260, 30, { radius: 8 }).setDepth(4);
    scene.add
      .text(monsterX, labelY, options.questLabel, {
        ...pixelText("body"),
        color: PALETTE_HEX.ink,
      })
      .setOrigin(0.5)
      .setDepth(4);
  } else {
    quest = new QuestMarker(scene, options.onQuest, { x: monsterX, y: labelY });
    quest.update(options.questLabel, false);
  }
  return { player, quest, tutorialTravel };
}

function drawCheckpointMonsters(
  scene: Phaser.Scene,
  chapter: ChapterDefinition,
  route: readonly { x: number; y: number }[] | undefined,
  activeIndex: number,
  capturedIds: ReadonlySet<string>
) {
  if (!route) return;
  chapter.stages.forEach((monster, index) => {
    if (index === activeIndex) return;
    const point = route[index];
    if (!point) return;

    const captured = capturedIds.has(monster.id);
    const size = captured ? 72 : 66;
    const fit = fitTexture(scene, monster.textureKey, size, size);
    scene.add
      .ellipse(
        point.x,
        point.y - 14,
        captured ? 50 : 44,
        12,
        PALETTE.nightBrown,
        captured ? 0.25 : 0.18
      )
      .setDepth(2);
    const image = scene.add
      .image(point.x, point.y - 50, monster.textureKey)
      .setScale(fit.scale)
      .setAlpha(captured ? 0.8 : 0.48)
      .setDepth(2.5);
    if (!captured) image.setTint(PALETTE.nightBrown);
    scene.add
      .text(point.x, point.y - 88, `LV.${monster.level}${captured ? " ✓" : ""}`, {
        ...pixelText("micro"),
        color: captured ? PALETTE_HEX.cream : PALETTE_HEX.sand,
        backgroundColor: captured ? "#2a1d14cc" : "#2a1d1488",
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(3);
  });
}
