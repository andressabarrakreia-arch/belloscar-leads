import { ClearFiltersButton, filterActiveClass } from "../ClearFiltersButton";
import { FiltersPanel } from "../FiltersPanel";
import { defaultNegociacoesFilters } from "../../context/NegociacoesAnalyticsContext";
import { currentMonthKey, formatDezenaLabel } from "../../lib/dates";
import type { NegociacoesFilters } from "../../lib/negociacoes/types";

type Options = {
  months: string[];
  periods: string[];
  dezenas: string[];
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

  const monthPadrao = currentMonthKey();
  const months = options.months.includes(monthPadrao)
    ? options.months
    : [monthPadrao, ...options.months];
  const dezena = filters.dezena || "all";
  const dezenas =
    filters.month === "all" ? options.dezenas : options.dezenas.filter((key) => key.startsWith(`${filters.month}-`));
  const active =
    filters.month !== monthPadrao ||
    filters.period !== "all" ||
    dezena !== "all" ||
    filters.vendedor !== "all" ||
    filters.tipo !== "all" ||
    filters.status !== "all" ||
    filters.tipoVenda !== "all";

  return (
    <FiltersPanel active={active} label="filtros">
    <div className="filters" role="search" aria-label="Filtros de negociações">
        <label>
          Mês
          <select
            className={filterActiveClass(filters.month !== monthPadrao)}
            value={filters.month}
            onChange={(e) => {
              const month = e.target.value;
              const nextDezena =
                dezena !== "all" && month !== "all" && !dezena.startsWith(`${month}-`) ? "all" : dezena;
              onChange({ ...filters, month, dezena: nextDezena });
            }}
          >
            <option value="all">Todos</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quinzena
          <select
            className={filterActiveClass(filters.period !== "all")}
            value={filters.period}
            onChange={(e) => set("period", e.target.value)}
          >
            <option value="all">Todas</option>
            {options.periods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label>
          Dezena
          <select
            className={filterActiveClass(dezena !== "all")}
            value={dezena}
            onChange={(e) => set("dezena", e.target.value)}
          >
            <option value="all">Todas</option>
            {dezenas.map((key) => (
              <option key={key} value={key}>
                {formatDezenaLabel(key)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Vendedor
          <select
            className={filterActiveClass(filters.vendedor !== "all")}
            value={filters.vendedor}
            onChange={(e) => set("vendedor", e.target.value)}
          >
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
          <select
            className={filterActiveClass(filters.tipo !== "all")}
            value={filters.tipo}
            onChange={(e) => set("tipo", e.target.value)}
          >
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
          <select
            className={filterActiveClass(filters.status !== "all")}
            value={filters.status}
            onChange={(e) => set("status", e.target.value)}
          >
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
          <select
            className={filterActiveClass(filters.tipoVenda !== "all")}
            value={filters.tipoVenda}
            onChange={(e) => set("tipoVenda", e.target.value)}
          >
            <option value="all">Todos</option>
            {options.tiposVenda.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <ClearFiltersButton onClick={() => onChange(defaultNegociacoesFilters())} />
    </div>
    </FiltersPanel>
  );
}
