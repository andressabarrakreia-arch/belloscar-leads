import { ClearFiltersButton, filterActiveClass } from "./ClearFiltersButton";
import { FiltersPanel } from "./FiltersPanel";
import {
  formatMonthLabel,
  monthBounds,
  monthKeyFromRange,
  type CampanhaFilters,
} from "../lib/campanhas/analytics";
import { META_CANAIS, type MetaCanal } from "../lib/campanhas/metaOrigem";

type Props = {
  filters: CampanhaFilters;
  sdrs: string[];
  months?: string[];
  onChange: (next: CampanhaFilters) => void;
};

export function CampanhasFilters({ filters, sdrs, months = [], onChange }: Props) {
  const selectedMonth = monthKeyFromRange(filters.from, filters.to);

  const active = Boolean(filters.from || filters.to || filters.canal || filters.sdr);

  return (
    <FiltersPanel active={active} label="filtros">
    <div className="filters">
      {months.length > 0 && (
        <label>
          Mês
          <select
            className={filterActiveClass(Boolean(selectedMonth))}
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
            {months.map((ym) => (
              <option key={ym} value={ym}>
                {formatMonthLabel(ym)}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        De
        <input
          className={filterActiveClass(Boolean(filters.from))}
          type="date"
          value={filters.from || ""}
          onChange={(e) => onChange({ ...filters, from: e.target.value || undefined })}
        />
      </label>
      <label>
        Até
        <input
          className={filterActiveClass(Boolean(filters.to))}
          type="date"
          value={filters.to || ""}
          onChange={(e) => onChange({ ...filters, to: e.target.value || undefined })}
        />
      </label>
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
      <ClearFiltersButton onClick={() => onChange({})} />
    </div>
    </FiltersPanel>
  );
}
