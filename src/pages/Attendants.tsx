import { useState } from "react";
import { FiltersBar } from "../components/FiltersBar";
import { KpiGrid } from "../components/KpiGrid";
import { useDataset, useFilteredAnalytics } from "../hooks/useDataset";
import { calcMetrics } from "../lib/metrics";
import type { AnalyticsFilters } from "../lib/types";

export function Attendants() {
  const { dataset, loading, error } = useDataset();
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const analytics = useFilteredAnalytics(dataset, filters);

  if (loading) return <p className="muted">Carregando dados…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!analytics) return null;

  const { attendants, options, filtered } = analytics;
  const totals = calcMetrics(filtered);

  return (
    <>
      <FiltersBar options={options} filters={filters} onChange={setFilters} />
      <KpiGrid kpis={totals} />

      <div className="card">
        <h2>Desempenho por Atendente</h2>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Atendente</th>
                <th>Leads</th>
                <th>Visitas</th>
                <th>Taxa Visita</th>
                <th>Sucessos</th>
                <th>Taxa Sucesso</th>
                <th>Visita → Sucesso</th>
              </tr>
            </thead>
            <tbody>
              {attendants.attendants.map((a) => (
                <tr key={a.responsavel}>
                  <td>
                    <strong>{a.responsavel}</strong>
                  </td>
                  <td>{a.leads}</td>
                  <td className={a.visitas ? "positive" : "zero"}>{a.visitas}</td>
                  <td>{a.taxaVisita}%</td>
                  <td className={a.sucessos ? "positive" : "zero"}>{a.sucessos}</td>
                  <td>{a.taxaSucesso}%</td>
                  <td>{a.taxaVisitaParaSucesso}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Atendente × Origem (leads / sucessos)</h2>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Atendente</th>
                {attendants.origens.map((o) => (
                  <th key={o}>{o}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendants.matrix.map((row) => (
                <tr key={row.responsavel}>
                  <td>
                    <strong>{row.responsavel}</strong>
                  </td>
                  {attendants.origens.map((o) => {
                    const m = row.byOrigem[o];
                    return (
                      <td key={o} className={m.leads ? "" : "zero"}>
                        {m.leads} / {m.sucessos}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
