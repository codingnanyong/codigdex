export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Monster name, level and HP, top-left. */
export const STATUS_BOX: Box = { x: 200, y: 118, width: 280, height: 76 };

/** Question prompt and hit/miss feedback. */
export const MESSAGE_BOX: Box = { x: 480, y: 288, width: 860, height: 146 };

/** The four answer cells. */
export const COMMAND_BOX: Box = { x: 480, y: 440, width: 860, height: 150 };

/** The opponent's art is fitted into this box, clear of the message box below. */
export const MONSTER_SPOT = { x: 700, y: 140, maxWidth: 190, maxHeight: 140 };
