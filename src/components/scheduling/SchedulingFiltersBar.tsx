import type { SchedulingFilters, TipoProposta } from "../../lib/scheduling/types";

type Options = {
  sdrs: string[];
  vendedores: string[];
  tipos: TipoProposta[];
};

type Props = {
  options: Options;
  filters: SchedulingFilters;
  onChange: (next: SchedulingFilters) => void;
};

export function SchedulingFiltersBar({ options, filters, onChange }: Props) {
  return (
    <div className="filters">
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
      <label>
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
