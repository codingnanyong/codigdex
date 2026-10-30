import type Phaser from "phaser";
import {
  EMPTY_CAREER_DEX_STATE,
  isCareerId,
  normalizeCareerDexState,
  selectCareer,
  type CareerDexState,
  type CareerId,
} from "@codigdex/game-content/domain/careerDex";
import { DexState, EMPTY_DEX_STATE } from "@codigdex/game-core/domain/dex/capture";
import { CAPTURABLE_MONSTERS } from "@codigdex/game-content/domain/chapters";
import {
  findJob,
  findSecondaryJob,
  findTertiaryJob,
  JOB_REGISTRY_KEY,
  SECONDARY_JOB_REGISTRY_KEY,
  TERTIARY_JOB_REGISTRY_KEY,
} from "@codigdex/game-content/domain/player/jobs";
import { DEFAULT_LOCALE, detectLocale, isLocale, type Locale } from "@codigdex/game-core/i18n/locale";
import { createSave, parseSave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { SAVE_STORAGE_KEYS } from "@codigdex/game-core/save/storage";
import { normalizeGameSave, normalizePromotionSelection } from "@codigdex/game-content/domain/gameProgress";

const CARDS_KEY = "cards";
const CAREER_DEX_KEY = "careerDex";
export const TUTORIAL_ONBOARDING_SEEN_KEY = "tutorialOnboardingSeen";
export const LOCALE_REGISTRY_KEY = "locale";
export const CHECKPOINT_REGISTRY_KEY = "checkpointId";
export const SAVE_CHANGE_EVENT = "codigdex-save-changed";
const applying = new WeakSet<Phaser.Data.DataManager>();
// Unknown content stays in the save without fabricating renderable dex cards.
// Keep it per registry so applying another account's snapshot replaces it.
const unrecognizedProgress = new WeakMap<Phaser.Data.DataManager, StoredGameStateV3["progress"]>();
export const SAVE_STORAGE_KEY = SAVE_STORAGE_KEYS.current;
export const PREVIOUS_SAVE_STORAGE_KEY = SAVE_STORAGE_KEYS.previous;
export const LEGACY_SAVE_STORAGE_KEY = SAVE_STORAGE_KEYS.legacy;

function preferredLanguages(): readonly string[] | undefined {
  if (typeof navigator === "undefined") return undefined;
  return navigator.languages?.length ? navigator.languages : [navigator.language];
}

/** The interface language. Falls back to the default when the registry holds nothing valid. */
export function readLocale(registry: Phaser.Data.DataManager): Locale {
  const value = registry.get(LOCALE_REGISTRY_KEY);
  return isLocale(value) ? value : DEFAULT_LOCALE;
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
export function hydrateRegistry(
  registry: Phaser.Data.DataManager,
  storage = browserStorage(),
  browserLanguages = preferredLanguages()
) {
  // A first visit has no saved language, so start in the browser's language.
  registry.set(LOCALE_REGISTRY_KEY, detectLocale(browserLanguages));
  if (!storage) return;
  try {
    const currentRaw = storage.getItem(SAVE_STORAGE_KEY);
    const previousRaw = storage.getItem(PREVIOUS_SAVE_STORAGE_KEY);
    const legacyRaw = storage.getItem(LEGACY_SAVE_STORAGE_KEY);
    const currentSave = currentRaw ? parseSave(currentRaw) : undefined;
    const previousSave = previousRaw ? parseSave(previousRaw) : undefined;
    const restored = currentSave ?? previousSave ?? (legacyRaw ? parseSave(legacyRaw) : undefined);
    if (!restored) return;
    const save = normalizePromotionSelection(restored);

    const knownMonsters = new Set(CAPTURABLE_MONSTERS.map(({ id }) => id));
    unrecognizedProgress.set(registry, {
      captures: save.progress.captures.filter(({ id }) => !knownMonsters.has(id)),
      careers: save.progress.careers.filter(({ id }) => !isCareerId(id)),
    });

    const capturedAtById = new Map(
      save.progress.captures
        .map((entry) => [entry.id, entry.capturedAt])
    );
    const cards = CAPTURABLE_MONSTERS.filter((monster) => capturedAtById.has(monster.id)).map((monster) => ({
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
    registry.set(
      CAREER_DEX_KEY,
      normalizeCareerDexState({
        careers: save.progress.careers.flatMap((record) =>
          isCareerId(record.id) ? [{ ...record, id: record.id }] : []
        ),
      })
    );
    registry.set(JOB_REGISTRY_KEY, findJob(save.player.primaryJobId).id);
    registry.set(SECONDARY_JOB_REGISTRY_KEY, findSecondaryJob(save.player.secondaryJobId)?.id ?? null);
    registry.set(TERTIARY_JOB_REGISTRY_KEY, findTertiaryJob(save.player.tertiaryJobId)?.id ?? null);
    registry.set(TUTORIAL_ONBOARDING_SEEN_KEY, save.ui.tutorialOnboardingSeen);
    registry.set(CHECKPOINT_REGISTRY_KEY, save.ui.checkpointId);
    if (save.ui.locale) registry.set(LOCALE_REGISTRY_KEY, save.ui.locale);

    // Copy a valid legacy save into the current slot without deleting the fallback.
    if (!currentSave) persistRegistry(registry, storage);
  } catch {
    // A malformed or unavailable save must never prevent the game from booting.
  }
}

export function persistRegistry(registry: Phaser.Data.DataManager, storage = browserStorage()) {
  if (applying.has(registry)) return;
  if (!storage) return;
  const save = snapshotRegistry(registry);
  try {
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));
    if (typeof window !== "undefined") window.dispatchEvent(new Event(SAVE_CHANGE_EVENT));
  } catch {
    if (typeof window !== "undefined") window.dispatchEvent(new Event("codigdex-save-error"));
  }
}

export function snapshotRegistry(registry: Phaser.Data.DataManager): StoredGameStateV3 {
  const state = readDexState(registry);
  const unrecognized = unrecognizedProgress.get(registry);
  return normalizePromotionSelection(createSave({
    captures: [...state.cards.map(({ id, capturedAt }) => ({ id, capturedAt })), ...(unrecognized?.captures ?? [])],
    careers: [...readCareerDexState(registry).careers, ...(unrecognized?.careers ?? [])],
    primaryJobId: findJob(registry.get(JOB_REGISTRY_KEY) as string | undefined).id,
    secondaryJobId:
      findSecondaryJob(registry.get(SECONDARY_JOB_REGISTRY_KEY) as string | null | undefined)?.id ?? null,
    tertiaryJobId:
      findTertiaryJob(registry.get(TERTIARY_JOB_REGISTRY_KEY) as string | null | undefined)?.id ?? null,
    tutorialOnboardingSeen: registry.get(TUTORIAL_ONBOARDING_SEEN_KEY) === true,
    locale: readLocale(registry),
    checkpointId: registry.get(CHECKPOINT_REGISTRY_KEY) as string | undefined,
  }));
}

/** Apply an entire shared snapshot without persisting intermediate registry fields. */
export function applySaveToRegistry(registry: Phaser.Data.DataManager, save: StoredGameStateV3) {
  applying.add(registry);
  try {
    hydrateRegistry(registry, { getItem: (key: string) => key === SAVE_STORAGE_KEY ? JSON.stringify(save) : null } as Storage);
  } finally { applying.delete(registry); }
  persistRegistry(registry);
}

/** Hydrates once, then mirrors every registry mutation to browser storage. */
export function initializeRegistryPersistence(registry: Phaser.Data.DataManager) {
  hydrateRegistry(registry);
  const save = () => persistRegistry(registry);
  registry.events.on("setdata", save);
  registry.events.on("changedata", save);
}

export function hasSavedProgress(registry: Phaser.Data.DataManager): boolean {
  const careerProgress = readCareerDexState(registry).careers.some(
    (career) => career.id !== "junior" || Boolean(career.masteredAt)
  );
  return (
    readDexState(registry).cards.length > 0 ||
    Boolean(unrecognizedProgress.get(registry)?.captures.length || unrecognizedProgress.get(registry)?.careers.length) ||
    careerProgress ||
    registry.get(TUTORIAL_ONBOARDING_SEEN_KEY) === true
  );
}

/** Clears the current adventure while leaving the game's code and asset cache intact. */
export function resetGameProgress(registry: Phaser.Data.DataManager, storage = browserStorage()) {
  unrecognizedProgress.delete(registry);
  try {
    storage?.removeItem(SAVE_STORAGE_KEY);
    storage?.removeItem(PREVIOUS_SAVE_STORAGE_KEY);
    storage?.removeItem(LEGACY_SAVE_STORAGE_KEY);
  } catch {
    // Registry reset still works when browser storage is unavailable.
  }
  registry.set(CARDS_KEY, EMPTY_DEX_STATE.cards);
  registry.set(CAREER_DEX_KEY, EMPTY_CAREER_DEX_STATE);
  registry.set(JOB_REGISTRY_KEY, "junior");
  registry.set(SECONDARY_JOB_REGISTRY_KEY, null);
  registry.set(TERTIARY_JOB_REGISTRY_KEY, null);
  registry.set(TUTORIAL_ONBOARDING_SEEN_KEY, false);
  registry.set(CHECKPOINT_REGISTRY_KEY, undefined);
  persistRegistry(registry, storage);
}

export function ensureDexDefaults(registry: Phaser.Data.DataManager) {
  if (registry.get(CARDS_KEY) === undefined) {
    registry.set(CARDS_KEY, EMPTY_DEX_STATE.cards);
  }
  if (registry.get(CAREER_DEX_KEY) === undefined) {
    registry.set(CAREER_DEX_KEY, EMPTY_CAREER_DEX_STATE);
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

export function readCareerDexState(registry: Phaser.Data.DataManager): CareerDexState {
  return normalizeCareerDexState(
    (registry.get(CAREER_DEX_KEY) as CareerDexState | undefined) ?? EMPTY_CAREER_DEX_STATE
  );
}

export function activateCareerInRegistry(registry: Phaser.Data.DataManager, id: CareerId) {
  registry.set(CAREER_DEX_KEY, selectCareer(readCareerDexState(registry), id));
}

/** Reconciles capture-based completion once, then lets lineage screens read career milestones. */
export function reconcileCareerDexRegistry(registry: Phaser.Data.DataManager): CareerDexState {
  const current = readCareerDexState(registry);
  const save = normalizeGameSave(snapshotRegistry(registry));
  const next = normalizeCareerDexState({
    careers: save.progress.careers.flatMap((record) =>
      isCareerId(record.id) ? [{ ...record, id: record.id }] : []
    ),
  });
  if (JSON.stringify(next) !== JSON.stringify(current)) registry.set(CAREER_DEX_KEY, next);
  return next;
}
