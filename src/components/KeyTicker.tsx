import { useEffect, useMemo, useState } from "react";
import { loadDataset } from "../lib/dataset";
import { buildSummary, calcMetrics } from "../lib/metrics";
import type { Dataset } from "../lib/types";

function buildItems(dataset: Dataset): string[] {
  const kpis = calcMetrics(dataset.leads);
  const summary = buildSummary(dataset.leads);
  const topOrigin = summary.byOrigin[0];
  const updated = new Date(dataset.updatedAt).toLocaleDateString("pt-BR");

  const items = [
    `Leads: ${kpis.leads.toLocaleString("pt-BR")}`,
    `Visitas: ${kpis.visitas.toLocaleString("pt-BR")} (${kpis.taxaVisita}%)`,
    `Sucessos: ${kpis.sucessos.toLocaleString("pt-BR")} (${kpis.taxaSucesso}%)`,
    `Visita → Sucesso: ${kpis.taxaVisitaParaSucesso}%`,
  ];

  if (topOrigin) {
    items.push(
      `Top origem: ${topOrigin.canal} · ${topOrigin.leads} leads · ${topOrigin.sucessos} sucessos`
    );
  }

  items.push(`Atualizado em ${updated}`);
  return items;
}

export function KeyTicker() {
  const [dataset, setDataset] = useState<Dataset | null>(null);

  useEffect(() => {
    loadDataset()
      .then(setDataset)
      .catch(() => setDataset(null));
  }, []);

  const items = useMemo(() => (dataset ? buildItems(dataset) : null), [dataset]);

  if (!items || items.length === 0) return null;

  const sequence = [...items, ...items];

  return (
    <div className="key-ticker" aria-label="Indicadores principais em destaque">
      <div className="key-ticker-track">
        {sequence.map((text, i) => (
          <span className="key-ticker-item" key={`${text}-${i}`}>
            <span className="key-ticker-dot" aria-hidden="true" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
