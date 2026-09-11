import Phaser from "phaser";
import { IntroScene } from "./scenes/IntroScene";
import { JobSelectScene } from "./scenes/JobSelectScene";
import { PathMapScene } from "./scenes/PathMapScene";
import { WorldMapScene } from "./scenes/WorldMapScene";
import { CodeBattleScene } from "./scenes/CodeBattleScene";
import { CaptureQuizScene } from "./scenes/CaptureQuizScene";
import { CodigdexScene } from "./scenes/CodigdexScene";
import { initializeRegistryPersistence } from "./registryAdapter";

export function createGameConfig(
  parent: HTMLElement
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    pixelArt: true,
    backgroundColor: "#f1e4cb",
    callbacks: {
      preBoot: (game) => initializeRegistryPersistence(game.registry),
    },
    scale: {
      // The page sizes the container to the viewport at 16:9 (globals.css);
      // FIT fills it, and rounding keeps the canvas box on whole CSS pixels.
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      expandParent: false,
      autoRound: true,
    },
    scene: [
      IntroScene,
      // JobSelectScene has no entry point yet — nothing calls
      // scene.start("job-select") until PathMapScene's common-dex nodes
      // have real content to finish. Registered here so it's ready to
      // wire in once that content exists.
      JobSelectScene,
      PathMapScene,
      WorldMapScene,
      CodeBattleScene,
      CaptureQuizScene,
      CodigdexScene,
    ],
  };
}
