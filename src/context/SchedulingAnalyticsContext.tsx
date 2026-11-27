import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  useSchedulingAnalytics,
  useSchedulingStore,
} from "../hooks/useSchedulingStore";
import { currentMonthKey, currentMonthRange, monthRange, workingMonthRange } from "../lib/dates";
import type { SchedulingDataset, SchedulingFilters } from "../lib/scheduling/types";

type Analytics = NonNullable<ReturnType<typeof useSchedulingAnalytics>>;

type SchedulingAnalyticsContextValue = {
  dataset: SchedulingDataset | null;
  loading: boolean;
  error: string | null;
  filters: SchedulingFilters;
  setFilters: Dispatch<SetStateAction<SchedulingFilters>>;
  analytics: Analytics | null;
};

const SchedulingAnalyticsContext = createContext<SchedulingAnalyticsContextValue | null>(
  null
);

function monthsWithData(dataset: SchedulingDataset): string[] {
  const set = new Set<string>();
  for (const i of dataset.items) {
    if (i.dataAgendamento?.length >= 7) set.add(i.dataAgendamento.slice(0, 7));
  }
  for (const r of dataset.realizados || []) {
    if (r.dataAtendido?.length >= 7) set.add(r.dataAtendido.slice(0, 7));
    if (r.dataVisita && r.dataVisita.length >= 7) set.add(r.dataVisita.slice(0, 7));
  }
  for (const s of dataset.sucessosEventos || []) {
    if (s.dataFinalizado?.length >= 7) set.add(s.dataFinalizado.slice(0, 7));
  }
  return [...set].sort((a, b) => b.localeCompare(a));
}

export function SchedulingAnalyticsProvider({ children }: { children: ReactNode }) {
  const { dataset, loading, error } = useSchedulingStore();
  const [filters, setFilters] = useState<SchedulingFilters>(() => currentMonthRange());
  const alignedRef = useRef(false);
  const analytics = useSchedulingAnalytics(dataset, filters);

  // Se o calendário atual não tem dados na base, abre no último mês disponível.
  useEffect(() => {
    if (!dataset || alignedRef.current) return;
    alignedRef.current = true;
    const available = monthsWithData(dataset);
    const current = currentMonthKey();
    if (available.includes(current)) return;
    const next = workingMonthRange(available);
    setFilters((prev) => {
      const stillDefault =
        prev.from === `${current}-01` &&
        prev.to === monthRange(current).to &&
        !prev.origem &&
        !prev.sdr &&
        !prev.tipoProposta &&
        !prev.vendedor &&
        !prev.q;
      return stillDefault ? { ...prev, ...next } : prev;
    });
  }, [dataset]);

  const value = useMemo(
    () => ({ dataset, loading, error, filters, setFilters, analytics }),
    [dataset, loading, error, filters, analytics]
  );

  return (
    <SchedulingAnalyticsContext.Provider value={value}>
      {children}
    </SchedulingAnalyticsContext.Provider>
  );
}

export function useSchedulingAnalyticsContext(): SchedulingAnalyticsContextValue {
  const ctx = useContext(SchedulingAnalyticsContext);
  if (!ctx) {
    throw new Error(
      "useSchedulingAnalyticsContext deve ser usado dentro de SchedulingAnalyticsProvider"
    );
  }
  return ctx;
}
