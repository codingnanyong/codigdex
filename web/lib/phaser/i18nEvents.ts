/**
 * Fired on `window` whenever the game's language is set, so page chrome outside
 * the canvas can follow. Kept free of Phaser imports so React can listen for it
 * without pulling the game engine into the page bundle.
 */
export const LOCALE_CHANGE_EVENT = "codigdex:locale-change";
