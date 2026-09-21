import { createEmptySave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { mobileSaveStorage } from "@/storage/asyncStorage";

interface SaveContextValue {
  hydrated: boolean;
  locale: Locale;
  save: StoredGameStateV3;
  setLocale(locale: Locale): void;
}

const SaveContext = createContext<SaveContextValue | undefined>(undefined);

export function SaveProvider({ children }: PropsWithChildren) {
  const [save, setSave] = useState<StoredGameStateV3>(() => createEmptySave());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void mobileSaveStorage.load().then((stored) => {
      if (!active) return;
      setSave(stored);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<SaveContextValue>(() => ({
    hydrated,
    locale: save.ui.locale ?? "ko",
    save,
    setLocale(locale) {
      setSave((current) => {
        const next = { ...current, ui: { ...current.ui, locale } };
        void mobileSaveStorage.save(next).catch(() => undefined);
        return next;
      });
    },
  }), [hydrated, save]);

  return <SaveContext.Provider value={value}>{children}</SaveContext.Provider>;
}

export function useSave(): SaveContextValue {
  const value = useContext(SaveContext);
  if (!value) throw new Error("useSave must be rendered inside SaveProvider");
  return value;
}
