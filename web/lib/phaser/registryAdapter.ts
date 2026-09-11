import Phaser from "phaser";
import { DexState, EMPTY_DEX_STATE } from "@/lib/domain/dex/capture";
import { DEX_MONSTERS } from "@/lib/domain/chapters";
import { findJob, JOB_REGISTRY_KEY } from "@/lib/domain/player/jobs";

const CARDS_KEY = "cards";
export const TUTORIAL_ONBOARDING_SEEN_KEY = "tutorialOnboardingSeen";
export const SAVE_STORAGE_KEY = "codigdex:save:v1";

interface StoredCapture {
  id: string;
  capturedAt: string;
}

interface StoredGameState {
  version: 1;
  captures: StoredCapture[];
  selectedJob: string;
  tutorialOnboardingSeen: boolean;
}

function browserStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/** Restores saved ids against today's monster definitions, so content edits don't stale the dex. */
export function hydrateRegistry(registry: Phaser.Data.DataManager, storage = browserStorage()) {
  if (!storage) return;
  try {
    const raw = storage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return;
    const save = JSON.parse(raw) as Partial<StoredGameState>;
    if (save.version !== 1 || !Array.isArray(save.captures)) return;

    const capturedAtById = new Map(
      save.captures
        .filter((entry): entry is StoredCapture =>
          Boolean(entry && typeof entry.id === "string" && typeof entry.capturedAt === "string")
        )
        .map((entry) => [entry.id, entry.capturedAt])
    );
    const cards = DEX_MONSTERS.filter((monster) => capturedAtById.has(monster.id)).map((monster) => ({
      id: monster.id,
      dexNumber: monster.dexNumber,
      name: monster.name,
      classification: monster.classification,
      trait: monster.trait,
      description: monster.description,
      snippet: monster.snippet,
      capturedAt: capturedAtById.get(monster.id)!,
    }));

    registry.set(CARDS_KEY, cards);
    registry.set(JOB_REGISTRY_KEY, findJob(save.selectedJob).id);
    registry.set(TUTORIAL_ONBOARDING_SEEN_KEY, save.tutorialOnboardingSeen === true);
  } catch {
    // A malformed or unavailable save must never prevent the game from booting.
  }
}

export function persistRegistry(registry: Phaser.Data.DataManager, storage = browserStorage()) {
  if (!storage) return;
  const state = readDexState(registry);
  const save: StoredGameState = {
    version: 1,
    captures: state.cards.map(({ id, capturedAt }) => ({ id, capturedAt })),
    selectedJob: findJob(registry.get(JOB_REGISTRY_KEY) as string | undefined).id,
    tutorialOnboardingSeen: registry.get(TUTORIAL_ONBOARDING_SEEN_KEY) === true,
  };
  try {
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));
  } catch {
    // Private browsing and full storage can reject writes; play can continue in memory.
  }
}

/** Hydrates once, then mirrors every registry mutation to browser storage. */
export function initializeRegistryPersistence(registry: Phaser.Data.DataManager) {
  hydrateRegistry(registry);
  const save = () => persistRegistry(registry);
  registry.events.on(Phaser.Data.Events.SET_DATA, save);
  registry.events.on(Phaser.Data.Events.CHANGE_DATA, save);
}

export function hasSavedProgress(registry: Phaser.Data.DataManager): boolean {
  return readDexState(registry).cards.length > 0 || registry.get(TUTORIAL_ONBOARDING_SEEN_KEY) === true;
}

/** Clears the current adventure while leaving the game's code and asset cache intact. */
export function resetGameProgress(registry: Phaser.Data.DataManager, storage = browserStorage()) {
  try {
    storage?.removeItem(SAVE_STORAGE_KEY);
  } catch {
    // Registry reset still works when browser storage is unavailable.
  }
  registry.set(CARDS_KEY, EMPTY_DEX_STATE.cards);
  registry.set(JOB_REGISTRY_KEY, "junior");
  registry.set(TUTORIAL_ONBOARDING_SEEN_KEY, false);
  persistRegistry(registry, storage);
}

export function ensureDexDefaults(registry: Phaser.Data.DataManager) {
  if (registry.get(CARDS_KEY) === undefined) {
    registry.set(CARDS_KEY, EMPTY_DEX_STATE.cards);
  }
}

export function readDexState(registry: Phaser.Data.DataManager): DexState {
  return {
    cards: (registry.get(CARDS_KEY) as DexState["cards"]) ?? EMPTY_DEX_STATE.cards,
  };
}

export function writeDexState(registry: Phaser.Data.DataManager, state: DexState) {
  registry.set(CARDS_KEY, state.cards);
}
