import { META_CANAIS, type MetaCanal } from "../lib/campanhas/metaOrigem";
import type { CampanhaFilters } from "../lib/campanhas/analytics";

type Props = {
  filters: CampanhaFilters;
  sdrs: string[];
  onChange: (next: CampanhaFilters) => void;
};

export function CampanhasFilters({ filters, sdrs, onChange }: Props) {
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
        Canal Meta
        <select
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
    </div>
  );
}
