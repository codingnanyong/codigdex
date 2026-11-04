type GameIconName = "menu" | "home" | "settings" | "notes" | "account" | "fullscreen" | "exit-fullscreen" | "retry" | "music";

/** One grid and stroke weight for all game utility icons. */
export function GameIcon({ name }: { name: GameIconName }) {
  return <svg className="game-tool-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" focusable="false">
    {name === "music" ? <path d="M9 17V5l11-2v12M9 8l11-2M9 17c0 2-2 3-4 3s-3-1-3-2 2-3 4-3h3m11 0c0 2-2 3-4 3s-3-1-3-2 2-3 4-3h3" /> : null}
    {name === "menu" ? <path d="M4 6h16M4 12h16M4 18h16" /> : null}
    {name === "home" ? <path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10" /> : null}
    {name === "settings" ? <><path d="m9 3-1 3-3-1-2 4 2 3-2 3 2 4 3-1 1 3h6l1-3 3 1 2-4-2-3 2-3-2-4-3 1-1-3Z" /><circle cx="12" cy="12" r="3" /></> : null}
    {name === "notes" ? <path d="M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Zm0 0v16" /> : null}
    {name === "account" ? <><circle cx="12" cy="7" r="4" /><path d="M4 21v-3a8 8 0 0 1 16 0v3Z" /></> : null}
    {name === "fullscreen" ? <path d="M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6" /> : null}
    {name === "exit-fullscreen" ? <path d="M9 3v6H3m18 0h-6V3M3 15h6v6m6 0v-6h6" /> : null}
    {name === "retry" ? <path d="M20 3v6h-6M4 21v-6h6M5 8a7 7 0 0 1 12-3l3 4M4 15l3 4a7 7 0 0 0 12-3" /> : null}
  </svg>;
}
