import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  useNegociacoesAnalytics,
  useNegociacoesStore,
} from "../hooks/useNegociacoesStore";
import type { NegociacoesDataset, NegociacoesFilters } from "../lib/negociacoes/types";

const DEFAULT_FILTERS: NegociacoesFilters = {
  month: "all",
  period: "all",
  vendedor: "all",
  tipo: "all",
  status: "all",
  tipoVenda: "all",
};

type Analytics = NonNullable<ReturnType<typeof useNegociacoesAnalytics>>;

type Ctx = {
  dataset: NegociacoesDataset | null;
  loading: boolean;
  error: string | null;
  filters: NegociacoesFilters;
  setFilters: Dispatch<SetStateAction<NegociacoesFilters>>;
  analytics: Analytics | null;
};

const NegociacoesAnalyticsContext = createContext<Ctx | null>(null);

export function NegociacoesAnalyticsProvider({ children }: { children: ReactNode }) {
  const { dataset, loading, error } = useNegociacoesStore();
  const [filters, setFilters] = useState<NegociacoesFilters>(DEFAULT_FILTERS);
  const analytics = useNegociacoesAnalytics(dataset, filters);

  const value = useMemo(
    () => ({ dataset, loading, error, filters, setFilters, analytics }),
    [dataset, loading, error, filters, analytics]
  );

  return (
    <NegociacoesAnalyticsContext.Provider value={value}>
      {children}
    </NegociacoesAnalyticsContext.Provider>
  );
}

export function useNegociacoesAnalyticsContext(): Ctx {
  const ctx = useContext(NegociacoesAnalyticsContext);
  if (!ctx) {
    throw new Error("useNegociacoesAnalyticsContext fora do provider");
  }
  return ctx;
}
