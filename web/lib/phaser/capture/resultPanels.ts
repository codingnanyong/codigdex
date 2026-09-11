import type Phaser from "phaser";
import type { MonsterDefinition } from "@/lib/domain/chapters/types";
import { PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { addSnippetBlock, createButton, drawOrnateFrame, popIn } from "../ui";

type Positioned = Phaser.GameObjects.GameObject & { y: number };

const CAPTURED_PANEL = { width: 640, minHeight: 360, topPad: 30, bottomPad: 70 };
const MISSED_PANEL = { width: 560, height: 240 };

export interface CapturedPanelOptions {
  monster: MonsterDefinition;
  npcLine: string;
  /** False on a replay: the title says so and nothing new is announced. */
  isNewEntry: boolean;
  unlockNotice?: string;
  onConfirm: () => void;
}

/** The card-registered panel: what the monster teaches, a code sample, and what opened up. */
export function showCapturedPanel(scene: Phaser.Scene, options: CapturedPanelOptions) {
  const { width, height } = scene.scale;
  const { monster } = options;
  const textWidth = CAPTURED_PANEL.width - 120;

  // Lay content out from an arbitrary top (cursor = 0) first, so the panel
  // can be sized to whatever this monster's copy needs, then shift it into place.
  let cursor = 0;
  const title = scene.add
    .text(0, cursor, `"${monster.name}" ${options.isNewEntry ? "도감 등록 완료!" : "복습 완료!"}`, {
      ...pixelText("subtitle"),
      color: PALETTE_HEX.ink,
      align: "center",
    })
    .setOrigin(0.5, 0);
  cursor += title.height + 14;

  const description = scene.add
    .text(0, cursor, monster.description, {
      ...pixelText("body"),
      color: PALETTE_HEX.ink,
      align: "center",
      wordWrap: { width: textWidth },
    })
    .setOrigin(0.5, 0);
  cursor += description.height + 14;

  const snippet = addSnippetBlock(scene, cursor, CAPTURED_PANEL.width - 140, monster.snippet);
  cursor += snippet.height + 16;

  const npcLine = scene.add
    .text(0, cursor, options.npcLine, {
      ...pixelText("body"),
      color: PALETTE_HEX.maroon,
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: textWidth },
    })
    .setOrigin(0.5, 0);
  cursor += npcLine.height;

  const content: Positioned[] = [title, description, snippet.plate, snippet.text, npcLine];

  if (options.unlockNotice) {
    cursor += 12;
    const notice = scene.add
      .text(0, cursor, options.unlockNotice, {
        ...pixelText("body"),
        color: PALETTE_HEX.wood,
        align: "center",
      })
      .setOrigin(0.5, 0);
    cursor += notice.height;
    content.push(notice);
  }

  const panelHeight = Math.max(
    CAPTURED_PANEL.minHeight,
    cursor + CAPTURED_PANEL.topPad + CAPTURED_PANEL.bottomPad
  );
  const shiftY = -panelHeight / 2 + CAPTURED_PANEL.topPad;
  content.forEach((element) => {
    element.y += shiftY;
  });

  const frame = drawOrnateFrame(scene, 0, 0, CAPTURED_PANEL.width, panelHeight);
  const confirm = createButton(scene, 0, panelHeight / 2 - 32, 120, 34, "확인", options.onConfirm);

  const panel = scene.add
    .container(width / 2, height / 2, [frame, ...content, confirm])
    .setDepth(1);
  popIn(scene, panel, 0.85);
  return panel;
}

export interface MissedPanelOptions {
  monster: MonsterDefinition;
  npcLine: string;
  onRetry: () => void;
}

/** The capture-failed panel: nothing is registered, just a nudge and a retry. */
export function showMissedPanel(scene: Phaser.Scene, options: MissedPanelOptions) {
  const { width, height } = scene.scale;

  const frame = drawOrnateFrame(scene, 0, 0, MISSED_PANEL.width, MISSED_PANEL.height);

  const title = scene.add
    .text(0, -MISSED_PANEL.height / 2 + 40, `"${options.monster.name}" 캡처 실패`, {
      ...pixelText("subtitle"),
      color: PALETTE_HEX.ink,
      align: "center",
    })
    .setOrigin(0.5);

  const npcLine = scene.add
    .text(0, -20, options.npcLine, {
      ...pixelText("body"),
      color: PALETTE_HEX.maroon,
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: MISSED_PANEL.width - 120 },
    })
    .setOrigin(0.5, 0);

  const retry = createButton(scene, 0, MISSED_PANEL.height / 2 - 32, 140, 34, "재도전", options.onRetry);

  const panel = scene.add
    .container(width / 2, height / 2, [frame, title, npcLine, retry])
    .setDepth(1);
  popIn(scene, panel, 0.85);
  return panel;
}
