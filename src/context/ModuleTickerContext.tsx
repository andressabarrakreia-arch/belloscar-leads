import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Ctx = {
  /** Quando definido, o KeyTicker usa estes itens em vez do dataset completo. */
  overrideItems: string[] | null;
  setOverrideItems: (items: string[] | null) => void;
};

const ModuleTickerContext = createContext<Ctx | null>(null);

export function ModuleTickerProvider({ children }: { children: ReactNode }) {
  const [overrideItems, setOverrideItemsState] = useState<string[] | null>(null);
  const setOverrideItems = useCallback((items: string[] | null) => {
    setOverrideItemsState(items);
  }, []);

  const value = useMemo(
    () => ({ overrideItems, setOverrideItems }),
    [overrideItems, setOverrideItems]
  );

  return (
    <ModuleTickerContext.Provider value={value}>{children}</ModuleTickerContext.Provider>
  );
}

export function useModuleTicker(): Ctx {
  const ctx = useContext(ModuleTickerContext);
  if (!ctx) {
    throw new Error("useModuleTicker fora do ModuleTickerProvider");
  }
  return ctx;
}
