import { useEffect, useMemo, useState } from "react";
import { loadDataset } from "../lib/dataset";
import {
  buildAttendantStats,
  buildDashboardInsights,
  buildSummary,
  filterLeads,
  getFilterOptions,
} from "../lib/metrics";
import type { AnalyticsFilters, Dataset } from "../lib/types";

export function useDataset() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDataset()
      .then(setDataset)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, []);

  return { dataset, setDataset, error, loading };
}

export function useFilteredAnalytics(dataset: Dataset | null, filters: AnalyticsFilters) {
  return useMemo(() => {
    if (!dataset) return null;
    const filtered = filterLeads(dataset.leads, filters);
    return {
      filtered,
      options: getFilterOptions(dataset.leads),
      summary: buildSummary(filtered),
      attendants: buildAttendantStats(filtered),
      insights: buildDashboardInsights(filtered),
    };
  }, [dataset, filters]);
}
