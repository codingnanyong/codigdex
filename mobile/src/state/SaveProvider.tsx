import type { Locale } from "@codigdex/game-core/i18n/locale";
import { createEmptySave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { applyBattleCapture } from "@codigdex/game-core/save/battleCapture";
import type { BattleState } from "@codigdex/game-core/domain/dex/battle";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { mobileSaveStorage } from "@/storage/asyncStorage";
import { createSaveWriter } from "@/storage/saveWriter";

interface SaveContextValue {
  capture(monsterId: string, battle: BattleState): void;
  clearProgress(): void;
  hydrated: boolean;
  locale: Locale;
  save: StoredGameStateV3;
  saveError: boolean;
  retrySave(): void;
  setLocale(locale: Locale): void;
}

const SaveContext = createContext<SaveContextValue | undefined>(undefined);

export function SaveProvider({ children }: PropsWithChildren) {
  const [save, setSave] = useState<StoredGameStateV3>(() => createEmptySave("ko"));
  const [hydrated, setHydrated] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const currentSave = useRef(save);
  const writer = useMemo(() => createSaveWriter(mobileSaveStorage), []);

  useEffect(() => {
    let active = true;
    void mobileSaveStorage.load().then((stored) => {
      if (!active) return;
      currentSave.current = stored;
      setSave(stored);
      setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  const update = (produce: (current: StoredGameStateV3) => StoredGameStateV3) => {
    const next = produce(currentSave.current);
    if (next === currentSave.current) return;
    currentSave.current = next;
    setSave(next);
    persist(next);
  };

  const persist = (next: StoredGameStateV3) => {
    void writer.save(next).then(
      () => { if (currentSave.current === next) setSaveError(false); },
      () => setSaveError(true)
    );
  };

  const value = useMemo<SaveContextValue>(() => ({
    capture(monsterId, battle) {
      update((current) => applyBattleCapture(current, monsterId, battle));
    },
    clearProgress() {
      update((current) => createEmptySave(current.ui.locale ?? "ko"));
    },
    hydrated,
    locale: save.ui.locale ?? "ko",
    save,
    saveError,
    retrySave() { persist(currentSave.current); },
    setLocale(locale) {
      update((current) => ({ ...current, ui: { ...current.ui, locale } }));
    },

  }), [hydrated, save, saveError]);

  return <SaveContext.Provider value={value}>{children}</SaveContext.Provider>;
}

export function useSave(): SaveContextValue {
  const value = useContext(SaveContext);
  if (!value) throw new Error("useSave must be rendered inside SaveProvider");
  return value;
}
