import type { SchedulingFilters, TipoProposta } from "../../lib/scheduling/types";

type Options = {
  sdrs: string[];
  vendedores: string[];
  tipos: TipoProposta[];
  origens: string[];
};

type Props = {
  options: Options;
  filters: SchedulingFilters;
  onChange: (next: SchedulingFilters) => void;
};

function isoToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoMonthStart(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export function SchedulingFiltersBar({ options, filters, onChange }: Props) {
  return (
    <div className="filters filters--sticky" role="search" aria-label="Filtros de agendamentos">
      <div className="filters__presets" role="group" aria-label="Atalhos de período">
        <button
          type="button"
          className="btn secondary"
          onClick={() => onChange({ ...filters, from: isoMonthStart(), to: isoToday() })}
        >
          Mês atual
        </button>
        <button
          type="button"
          className="btn secondary"
          onClick={() => onChange({ ...filters, from: isoDaysAgo(6), to: isoToday() })}
        >
          Últimos 7 dias
        </button>
        <button
          type="button"
          className="btn secondary"
          onClick={() => onChange({ ...filters, from: isoDaysAgo(14), to: isoToday() })}
        >
          Quinzena
        </button>
      </div>
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
      <label>
        Origem
        <select
          value={filters.origem || ""}
          onChange={(e) => onChange({ ...filters, origem: e.target.value || undefined })}
        >
          <option value="">Todas</option>
          {options.origens.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      <label>
        SDR / Atendido por
        <select
          value={filters.sdr || ""}
          onChange={(e) => onChange({ ...filters, sdr: e.target.value || undefined })}
        >
          <option value="">Todos</option>
          {options.sdrs.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tipo de proposta
        <select
          value={filters.tipoProposta || ""}
          onChange={(e) =>
            onChange({
              ...filters,
              tipoProposta: (e.target.value || undefined) as TipoProposta | undefined,
            })
          }
        >
          <option value="">Todos</option>
          {options.tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="filters__vendedor">
        Vendedor
        <select
          value={filters.vendedor || ""}
          onChange={(e) => onChange({ ...filters, vendedor: e.target.value || undefined })}
        >
          <option value="">Todos</option>
          {options.vendedores.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="filters__search">
        Busca rápida
        <input
          type="search"
          placeholder="ID, cliente ou telefone"
          value={filters.q || ""}
          onChange={(e) => onChange({ ...filters, q: e.target.value || undefined })}
        />
      </label>
      <button
        className="btn secondary"
        type="button"
        onClick={() => onChange({})}
        style={{ alignSelf: "end" }}
      >
        Limpar filtros
      </button>
    </div>
  );
}
