import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiltersBar } from "../components/FiltersBar";
import { KpiGrid } from "../components/KpiGrid";
import { OriginTable } from "../components/OriginTable";
import { useDataset, useFilteredAnalytics } from "../hooks/useDataset";
import type { AnalyticsFilters } from "../lib/types";

const COLORS = ["#e74c3c", "#2ecc71", "#f1c40f", "#9b59b6", "#34495e", "#3498db", "#e67e22"];

export function Dashboard() {
  const { dataset, loading, error } = useDataset();
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const analytics = useFilteredAnalytics(dataset, filters);

  if (loading) return <p className="muted">Carregando dados…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!analytics || !dataset) return null;

  const { summary, options } = analytics;
  const stacked = summary.propostaByOrigin.canais.map((canal, idx) => {
    const row: Record<string, string | number> = { canal };
    for (const ds of summary.propostaByOrigin.datasets) {
      row[ds.label] = ds.data[idx] || 0;
    }
    return row;
  });

  return (
    <>
      <FiltersBar options={options} filters={filters} onChange={setFilters} />
      <KpiGrid kpis={summary.kpis} />
      <OriginTable rows={summary.byOrigin} />

      <div className="charts">
        <div className="card">
          <h2>Volume de Leads por Canal</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={summary.byOrigin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="canal" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="leads" fill="#3498db" radius={4} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Sucessos por Tipo de Proposta</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={summary.sucessoByProposal}
                dataKey="value"
                nameKey="label"
                outerRadius={100}
                label
              >
                {summary.sucessoByProposal.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Composição de Propostas por Canal</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stacked}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="canal" hide />
              <YAxis />
              <Tooltip />
              <Legend />
              {summary.propostaByOrigin.datasets.map((ds, i) => (
                <Bar
                  key={ds.label}
                  dataKey={ds.label}
                  stackId="a"
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Comparativo por Mês</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={summary.byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="leads" fill="#95a5a6" radius={4} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="muted">
        Atualizado em {new Date(dataset.updatedAt).toLocaleString("pt-BR")} ·{" "}
        {dataset.leads.length} leads no arquivo publicado
      </p>
    </>
  );
}
