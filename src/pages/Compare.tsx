import { useMemo, useState } from "react";
import { FiltersBar } from "../components/FiltersBar";
import { useDataset, useFilteredAnalytics } from "../hooks/useDataset";
import { comparePeriods, getFilterOptions } from "../lib/metrics";
import type { AnalyticsFilters } from "../lib/types";

export function Compare() {
  const { dataset, loading, error } = useDataset();
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [periodA, setPeriodA] = useState("");
  const [periodB, setPeriodB] = useState("");
  const analytics = useFilteredAnalytics(dataset, {
    origem: filters.origem,
    responsavel: filters.responsavel,
    from: filters.from,
    to: filters.to,
  });

  const options = dataset ? getFilterOptions(dataset.leads) : null;

  const result = useMemo(() => {
    if (!analytics || !periodA || !periodB) return null;
    return comparePeriods(analytics.filtered, periodA, periodB);
  }, [analytics, periodA, periodB]);

  if (loading) return <p className="muted">Carregando dados…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!options) return null;

  return (
    <>
      <FiltersBar
        options={options}
        filters={filters}
        onChange={(f) => setFilters({ ...f, periodKeys: undefined, monthKeys: undefined })}
      />

      <div className="filters">
        <label>
          Período A
          <select value={periodA} onChange={(e) => setPeriodA(e.target.value)}>
            <option value="">Selecione</option>
            {options.periods.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Período B
          <select value={periodB} onChange={(e) => setPeriodB(e.target.value)}>
            <option value="">Selecione</option>
            {options.periods.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!result && <p className="muted">Selecione dois períodos para comparar.</p>}

      {result && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <h3>Δ Leads</h3>
              <p>{result.delta.leads}</p>
            </div>
            <div className="kpi-card">
              <h3>Δ Visitas</h3>
              <p>{result.delta.visitas}</p>
            </div>
            <div className="kpi-card accent">
              <h3>Δ Sucessos</h3>
              <p>{result.delta.sucessos}</p>
            </div>
            <div className="kpi-card success">
              <h3>Δ Taxa Sucesso (p.p.)</h3>
              <p>{result.delta.taxaSucesso}</p>
            </div>
          </div>

          <div className="charts">
            <div className="card">
              <h2>{result.periodA.label}</h2>
              <p>
                Leads: <strong>{result.periodA.kpis.leads}</strong> · Visitas:{" "}
                <strong>{result.periodA.kpis.visitas}</strong> · Sucessos:{" "}
                <strong>{result.periodA.kpis.sucessos}</strong> · Conv:{" "}
                <strong>{result.periodA.kpis.taxaSucesso}%</strong>
              </p>
            </div>
            <div className="card">
              <h2>{result.periodB.label}</h2>
              <p>
                Leads: <strong>{result.periodB.kpis.leads}</strong> · Visitas:{" "}
                <strong>{result.periodB.kpis.visitas}</strong> · Sucessos:{" "}
                <strong>{result.periodB.kpis.sucessos}</strong> · Conv:{" "}
                <strong>{result.periodB.kpis.taxaSucesso}%</strong>
              </p>
            </div>
          </div>

          <div className="card">
            <h2>Origem — A vs B</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Canal</th>
                    <th>Leads A</th>
                    <th>Leads B</th>
                    <th>Δ Leads</th>
                    <th>Taxa Suc. A</th>
                    <th>Taxa Suc. B</th>
                    <th>Δ Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {result.byOrigin.map((row) => (
                    <tr key={row.canal}>
                      <td>
                        <strong>{row.canal}</strong>
                      </td>
                      <td>{row.periodA.leads}</td>
                      <td>{row.periodB.leads}</td>
                      <td>{row.deltaLeads}</td>
                      <td>{row.periodA.taxaSucesso}%</td>
                      <td>{row.periodB.taxaSucesso}%</td>
                      <td>{row.deltaTaxaSucesso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
