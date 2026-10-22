import { ClearFiltersButton, filterActiveClass } from "./ClearFiltersButton";
import { FiltersPanel } from "./FiltersPanel";
import {
  formatMonthLabel,
  monthBounds,
  monthKeyFromRange,
  type CampanhaFilters,
} from "../lib/campanhas/analytics";
import { META_CANAIS, type MetaCanal } from "../lib/campanhas/metaOrigem";
import { currentMonthKey, currentMonthRange } from "../lib/dates";

type Props = {
  filters: CampanhaFilters;
  sdrs: string[];
  months?: string[];
  /** A comparação usa outra barra para os dois períodos. */
  showPeriod?: boolean;
  onChange: (next: CampanhaFilters) => void;
};

export function CampanhasFilters({
  filters,
  sdrs,
  months = [],
  showPeriod = true,
  onChange,
}: Props) {
  const selectedMonth = monthKeyFromRange(filters.from, filters.to);
  const padrao = currentMonthRange();
  const monthPadrao = currentMonthKey();
  const periodFora =
    showPeriod && (filters.from !== padrao.from || filters.to !== padrao.to);
  const monthChoices = months.includes(monthPadrao) ? months : [monthPadrao, ...months];

  const active = Boolean(filters.canal || filters.sdr || periodFora);

  return (
    <FiltersPanel active={active} label="filtros">
    <div className="filters">
      {showPeriod && (
        <label>
          Mês
          <select
            className={filterActiveClass(selectedMonth !== monthPadrao)}
            value={selectedMonth}
            aria-label="Mês"
            onChange={(e) => {
              const ym = e.target.value;
              if (!ym) {
                onChange({ ...filters, from: undefined, to: undefined });
                return;
              }
              const { from, to } = monthBounds(ym);
              onChange({ ...filters, from, to });
            }}
          >
            <option value="">Todos</option>
            {monthChoices.map((ym) => (
              <option key={ym} value={ym}>
                {formatMonthLabel(ym)}
              </option>
            ))}
          </select>
        </label>
      )}
      {showPeriod && (
      <label>
        De
        <input
          className={filterActiveClass(filters.from !== padrao.from)}
          type="date"
          value={filters.from || ""}
          onChange={(e) => onChange({ ...filters, from: e.target.value || undefined })}
        />
      </label>
      )}
      {showPeriod && (
      <label>
        Até
        <input
          className={filterActiveClass(filters.to !== padrao.to)}
          type="date"
          value={filters.to || ""}
          onChange={(e) => onChange({ ...filters, to: e.target.value || undefined })}
        />
      </label>
      )}
      <label>
        Canal Meta
        <select
          className={filterActiveClass(Boolean(filters.canal))}
          value={filters.canal || ""}
          onChange={(e) =>
            onChange({ ...filters, canal: (e.target.value || "") as MetaCanal | "" })
          }
        >
          <option value="">Facebook e Instagram</option>
          {META_CANAIS.map((canal) => (
            <option key={canal} value={canal}>
              {canal}
            </option>
          ))}
        </select>
      </label>
      <label>
        SDR
        <select
          className={filterActiveClass(Boolean(filters.sdr))}
          value={filters.sdr || ""}
          onChange={(e) => onChange({ ...filters, sdr: e.target.value || undefined })}
        >
          <option value="">Todos</option>
          {sdrs.map((sdr) => (
            <option key={sdr} value={sdr}>
              {sdr}
            </option>
          ))}
        </select>
      </label>
      <ClearFiltersButton
        onClick={() => onChange(showPeriod ? { ...currentMonthRange() } : {})}
      />
    </div>
    </FiltersPanel>
  );
}
