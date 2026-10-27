import {
  currentMonthRange,
  formatDateRangeLabel,
  isoDaysAgo,
  isoToday,
  monthToDateRange,
} from "../../lib/dates";
import type { ShowPeriod } from "../../lib/apresentacao/types";

type Props = {
  period: ShowPeriod;
  onChange: (next: ShowPeriod) => void;
};

export function ShowPeriodFilter({ period, onChange }: Props) {
  const mtd = monthToDateRange();
  const closed = currentMonthRange();
  const today = isoToday();
  const week = { from: isoDaysAgo(6), to: today };
  const fortnight = { from: isoDaysAgo(14), to: today };

  const is = (a: ShowPeriod) => a.from === period.from && a.to === period.to;

  return (
    <div className="show-filter" role="search" aria-label="Filtro de período">
      <div className="show-filter-presets" role="group" aria-label="Atalhos">
        <button
          type="button"
          className={`btn secondary${is(mtd) ? " is-active" : ""}`}
          onClick={() => onChange(mtd)}
        >
          Mês vigente
        </button>
        <button
          type="button"
          className={`btn secondary${is(closed) ? " is-active" : ""}`}
          onClick={() => onChange(closed)}
        >
          Mês fechado
        </button>
        <button
          type="button"
          className={`btn secondary${is(week) ? " is-active" : ""}`}
          onClick={() => onChange(week)}
        >
          7 dias
        </button>
        <button
          type="button"
          className={`btn secondary${is(fortnight) ? " is-active" : ""}`}
          onClick={() => onChange(fortnight)}
        >
          Quinzena
        </button>
        <button type="button" className="btn secondary" onClick={() => onChange(mtd)}>
          Limpar
        </button>
      </div>
      <div className="show-filter-dates">
        <label>
          De
          <input
            type="date"
            value={period.from}
            onChange={(e) => onChange({ ...period, from: e.target.value || mtd.from })}
          />
        </label>
        <label>
          Até
          <input
            type="date"
            value={period.to}
            onChange={(e) => onChange({ ...period, to: e.target.value || mtd.to })}
          />
        </label>
        <p className="show-filter-label">{formatDateRangeLabel(period.from, period.to)}</p>
      </div>
    </div>
  );
}
