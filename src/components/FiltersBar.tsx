import { FiltersPanel } from "./FiltersPanel";
import type { AnalyticsFilters } from "../lib/types";

type FilterOptions = {
  origens: string[];
  responsaveis: string[];
  periods: { key: string; label: string }[];
  months: string[];
};

type Props = {
  options: FilterOptions;
  filters: AnalyticsFilters;
  onChange: (next: AnalyticsFilters) => void;
};

export function FiltersBar({ options, filters, onChange }: Props) {
  const active = Boolean(
    filters.periodKeys?.length ||
      filters.monthKeys?.length ||
      filters.origem ||
      filters.responsavel ||
      filters.from ||
      filters.to
  );

  return (
    <FiltersPanel active={active} label="filtros">
    <div className="filters">
      <label>
        Período (quinzena)
        <select
          value={filters.periodKeys?.[0] || ""}
          onChange={(e) =>
            onChange({
              ...filters,
              periodKeys: e.target.value ? [e.target.value] : undefined,
              monthKeys: undefined,
            })
          }
        >
          <option value="">Todos os períodos</option>
          {options.periods.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Mês
        <select
          value={filters.monthKeys?.[0] || ""}
          onChange={(e) =>
            onChange({
              ...filters,
              monthKeys: e.target.value ? [e.target.value] : undefined,
              periodKeys: undefined,
            })
          }
        >
          <option value="">Todos os meses</option>
          {options.months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <label>
        Origem
        <select
          value={filters.origem || ""}
          onChange={(e) => onChange({ ...filters, origem: e.target.value || undefined })}
        >
          <option value="">Todas as origens</option>
          {options.origens.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      <label>
        Atendente
        <select
          value={filters.responsavel || ""}
          onChange={(e) => onChange({ ...filters, responsavel: e.target.value || undefined })}
        >
          <option value="">Todos os atendentes</option>
          {options.responsaveis.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <label>
        De
        <input
          type="date"
          value={filters.from || ""}
          onChange={(e) => onChange({ ...filters, from: e.target.value || undefined })}
        />
      </label>
      <label>
        Até
        <input
          type="date"
          value={filters.to || ""}
          onChange={(e) => onChange({ ...filters, to: e.target.value || undefined })}
        />
      </label>
    </div>
    </FiltersPanel>
  );
}
