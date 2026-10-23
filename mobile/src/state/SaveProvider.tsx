import type { Locale } from "@codigdex/game-core/i18n/locale";
import { createEmptySave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { captureCheckpoint, rememberCheckpoint, selectGameCareer } from "../game/progression";
import type { JobId } from "@codigdex/game-content/domain/player/jobs";
import type { BattleState } from "@codigdex/game-core/domain/dex/battle";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { mobileSaveStorage } from "@/storage/asyncStorage";
import { createSaveWriter } from "@/storage/saveWriter";
import { QA_ENABLED } from "../qa/runtime";
import { createQaProgress, type QaProgress } from "../qa/progress";

interface SaveContextValue {
  capture(monsterId: string, battle: BattleState): void;
  clearProgress(): void;
  hydrated: boolean;
  loadError: boolean;
  retryLoad(): void;
  locale: Locale;
  save: StoredGameStateV3;
  saveError: boolean;
  saving: boolean;
  retrySave(): void;
  setLocale(locale: Locale): void;
  selectCheckpoint(id: string): void;
  loadQAProgress(scenario: QaProgress): void;
  selectJob(id: JobId): void;
  replaceSave(save: StoredGameStateV3): Promise<void>;
}

const SaveContext = createContext<SaveContextValue | undefined>(undefined);

export function SaveProvider({ children }: PropsWithChildren) {
  const [save, setSave] = useState<StoredGameStateV3>(() => createEmptySave("ko"));
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const pendingWrites = useRef(0);
  const currentSave = useRef(save);
  const writer = useMemo(() => createSaveWriter(mobileSaveStorage), []);

  useEffect(() => {
    let active = true;
    void mobileSaveStorage.load().then((stored) => {
      if (!active) return;
      currentSave.current = stored;
      setSave(stored);
      setHydrated(true);
    }).catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [loadAttempt]);

  const update = (produce: (current: StoredGameStateV3) => StoredGameStateV3) => {
    const next = produce(currentSave.current);
    if (next === currentSave.current) return;
    currentSave.current = next;
    setSave(next);
    persist(next);
  };

  const write = (next: StoredGameStateV3) => {
    pendingWrites.current++;
    setSaving(true);
    return writer.save(next).finally(() => {
      pendingWrites.current--;
      setSaving(pendingWrites.current > 0);
    });
  };

  const persist = (next: StoredGameStateV3) => {
    void write(next).then(
      () => { if (currentSave.current === next) setSaveError(false); },
      () => setSaveError(true)
    );
  };

  const value = useMemo<SaveContextValue>(() => ({
    capture(monsterId, battle) {
      update((current) => captureCheckpoint(current, monsterId, battle));
    },
    clearProgress() {
      update((current) => createEmptySave(current.ui.locale ?? "ko"));
    },
    hydrated,
    loadError,
    retryLoad() { setLoadError(false); setLoadAttempt((attempt) => attempt + 1); },
    locale: save.ui.locale ?? "ko",
    save,
    saveError,
    saving,
    retrySave() { persist(currentSave.current); },
    setLocale(locale) {
      update((current) => ({ ...current, ui: { ...current.ui, locale } }));
    },
    selectCheckpoint(id) {
      update((current) => rememberCheckpoint(current, id));
    },
    selectJob(id) { update((current) => selectGameCareer(current, id)); },
    async replaceSave(next) {
      currentSave.current = next;
      setSave(next);
      try {
        await write(next);
        if (currentSave.current === next) setSaveError(false);
      } catch (error) { setSaveError(true); throw error; }
    },
    loadQAProgress(scenario) {
      if (!QA_ENABLED) return;
      update((current) => createQaProgress(QA_ENABLED, scenario, current.ui.locale ?? "ko") ?? current);
    },
  }), [hydrated, loadError, save, saveError, saving]);

  return <SaveContext.Provider value={value}>{children}</SaveContext.Provider>;
}

export function useSave(): SaveContextValue {
  const value = useContext(SaveContext);
  if (!value) throw new Error("useSave must be rendered inside SaveProvider");
  return value;
}
