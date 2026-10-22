import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  useSchedulingAnalytics,
  useSchedulingStore,
} from "../hooks/useSchedulingStore";
import { currentMonthRange } from "../lib/dates";
import type { SchedulingDataset, SchedulingFilters } from "../lib/scheduling/types";

type Analytics = NonNullable<ReturnType<typeof useSchedulingAnalytics>>;

type SchedulingAnalyticsContextValue = {
  dataset: SchedulingDataset | null;
  loading: boolean;
  error: string | null;
  filters: SchedulingFilters;
  setFilters: (next: SchedulingFilters) => void;
  analytics: Analytics | null;
};

const SchedulingAnalyticsContext = createContext<SchedulingAnalyticsContextValue | null>(
  null
);

export function SchedulingAnalyticsProvider({ children }: { children: ReactNode }) {
  const { dataset, loading, error } = useSchedulingStore();
  const [filters, setFilters] = useState<SchedulingFilters>(() => currentMonthRange());
  const analytics = useSchedulingAnalytics(dataset, filters);

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
