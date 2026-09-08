import Phaser from "phaser";
import { IntroScene } from "./scenes/IntroScene";
import { WorldMapScene } from "./scenes/WorldMapScene";
import { CodeBattleScene } from "./scenes/CodeBattleScene";
import { CaptureQuizScene } from "./scenes/CaptureQuizScene";
import { CodigdexScene } from "./scenes/CodigdexScene";

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
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [IntroScene, WorldMapScene, CodeBattleScene, CaptureQuizScene, CodigdexScene],
  };
}
