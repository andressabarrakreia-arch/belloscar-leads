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
  /** Meses YYYY-MM disponíveis na base (mais recentes primeiro). */
  monthOptions?: string[];
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

/** Primeiro e último dia do mês YYYY-MM. */
export function closedMonthBounds(ym: string): { from: string; to: string } {
  const [y, m] = ym.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return {
    from: `${ym}-01`,
    to: `${ym}-${String(lastDay).padStart(2, "0")}`,
  };
}

/** Se from/to cobrem exatamente um mês fechado, devolve YYYY-MM; senão "". */
export function closedMonthFromFilters(filters: SchedulingFilters): string {
  const from = filters.from;
  const to = filters.to;
  if (!from || !to || from.length < 10 || to.length < 10) return "";
  const ym = from.slice(0, 7);
  if (to.slice(0, 7) !== ym) return "";
  if (from.slice(8, 10) !== "01") return "";
  const { to: monthEnd } = closedMonthBounds(ym);
  return to === monthEnd ? ym : "";
}

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  const label = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function SchedulingFiltersBar({
  options,
  filters,
  onChange,
  monthOptions = [],
}: Props) {
  const selectedMonth = closedMonthFromFilters(filters);

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
        Mês
        <select
          value={selectedMonth}
          onChange={(e) => {
            const ym = e.target.value;
            if (!ym) {
              onChange({ ...filters, from: undefined, to: undefined });
              return;
            }
            const { from, to } = closedMonthBounds(ym);
            onChange({ ...filters, from, to });
          }}
          aria-label="Mês fechado"
        >
          <option value="">Personalizado / todos</option>
          {monthOptions.map((ym) => (
            <option key={ym} value={ym}>
              {formatMonthLabel(ym)}
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
