import type { NegociacoesFilters } from "../../lib/negociacoes/types";

type Options = {
  months: string[];
  periods: string[];
  vendedores: string[];
  tipos: string[];
  statuses: string[];
  tiposVenda: string[];
};

type Props = {
  options: Options;
  filters: NegociacoesFilters;
  onChange: (next: NegociacoesFilters) => void;
};

export function NegociacoesFiltersBar({ options, filters, onChange }: Props) {
  function set<K extends keyof NegociacoesFilters>(key: K, value: NegociacoesFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="filters filters--sticky" role="search" aria-label="Filtros de negociações">
        <label>
          Mês
          <select value={filters.month} onChange={(e) => set("month", e.target.value)}>
            <option value="all">Todos</option>
            {options.months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quinzena
          <select value={filters.period} onChange={(e) => set("period", e.target.value)}>
            <option value="all">Todas</option>
            {options.periods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label>
          Vendedor
          <select value={filters.vendedor} onChange={(e) => set("vendedor", e.target.value)}>
            <option value="all">Todos</option>
            {options.vendedores.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo
          <select value={filters.tipo} onChange={(e) => set("tipo", e.target.value)}>
            <option value="all">Todos</option>
            {options.tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={filters.status} onChange={(e) => set("status", e.target.value)}>
            <option value="all">Todos</option>
            {options.statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo venda
          <select value={filters.tipoVenda} onChange={(e) => set("tipoVenda", e.target.value)}>
            <option value="all">Todos</option>
            {options.tiposVenda.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
    </div>
  );
}
