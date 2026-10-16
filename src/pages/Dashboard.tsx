import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
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

const COLORS = ["#c02026", "#2563eb", "#16a34a", "#404041", "#e21e26", "#929497", "#1e3a8a"];

function deltaClass(n: number) {
  if (n > 0) return "positive";
  if (n < 0) return "delta-neg";
  return "zero";
}

function fmtDelta(n: number, suffix = "") {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}${suffix}`;
}

export function Dashboard() {
  const { dataset, loading, error } = useDataset();
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const analytics = useFilteredAnalytics(dataset, filters);

  if (loading) return <p className="muted">Carregando dados…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!analytics || !dataset) return null;

  const { summary, options, insights } = analytics;
  const stacked = summary.propostaByOrigin.canais.map((canal, idx) => {
    const row: Record<string, string | number> = { canal };
    for (const ds of summary.propostaByOrigin.datasets) {
      row[ds.label] = ds.data[idx] || 0;
    }
    return row;
  });

  const periodChart = insights.byPeriod.map((p) => ({
    label: p.label.replace(/ \(.*?\)/, ""),
    leads: p.leads,
    sucessos: p.sucessos,
    visitas: p.visitas,
    taxaSucesso: p.taxaSucesso,
  }));

  return (
    <>
      <FiltersBar options={options} filters={filters} onChange={setFilters} />
      <KpiGrid kpis={summary.kpis} />

      <div className="kpi-grid insight-kpis">
        <div className="kpi-card">
          <h3>Em atendimento / fila</h3>
          <p>{insights.emAtendimento}</p>
        </div>
        <div className="kpi-card accent">
          <h3>Agendados em aberto</h3>
          <p>{insights.agendadosAbertos}</p>
        </div>
        <div className="kpi-card">
          <h3>Dias até visita (média)</h3>
          <p>{insights.visitTiming.count ? insights.visitTiming.avgDays : "—"}</p>
        </div>
        <div className="kpi-card">
          <h3>Dias até visita (mediana)</h3>
          <p>{insights.visitTiming.count ? insights.visitTiming.medianDays : "—"}</p>
        </div>
      </div>

      {insights.periodDelta && (
        <div className="card">
          <h2>
            Quinzena atual vs anterior · {insights.periodDelta.currLabel} ×{" "}
            {insights.periodDelta.prevLabel}
          </h2>
          <div className="kpi-grid">
            <div className="kpi-card">
              <h3>Δ Leads</h3>
              <p className={deltaClass(insights.periodDelta.leads)}>
                {fmtDelta(insights.periodDelta.leads)}
              </p>
              <small className="muted">
                {insights.periodDelta.prev.leads} → {insights.periodDelta.curr.leads}
              </small>
            </div>
            <div className="kpi-card">
              <h3>Δ Visitas</h3>
              <p className={deltaClass(insights.periodDelta.visitas)}>
                {fmtDelta(insights.periodDelta.visitas)}
              </p>
              <small className="muted">
                {insights.periodDelta.prev.visitas} → {insights.periodDelta.curr.visitas}
              </small>
            </div>
            <div className="kpi-card accent">
              <h3>Δ Sucessos</h3>
              <p className={deltaClass(insights.periodDelta.sucessos)}>
                {fmtDelta(insights.periodDelta.sucessos)}
              </p>
              <small className="muted">
                {insights.periodDelta.prev.sucessos} → {insights.periodDelta.curr.sucessos}
              </small>
            </div>
            <div className="kpi-card success">
              <h3>Δ Taxa Sucesso (p.p.)</h3>
              <p className={deltaClass(insights.periodDelta.taxaSucesso)}>
                {fmtDelta(insights.periodDelta.taxaSucesso)}
              </p>
              <small className="muted">
                {insights.periodDelta.prev.taxaSucesso}% → {insights.periodDelta.curr.taxaSucesso}%
              </small>
            </div>
            <div className="kpi-card">
              <h3>Δ Taxa Visita (p.p.)</h3>
              <p className={deltaClass(insights.periodDelta.taxaVisita)}>
                {fmtDelta(insights.periodDelta.taxaVisita)}
              </p>
              <small className="muted">
                {insights.periodDelta.prev.taxaVisita}% → {insights.periodDelta.curr.taxaVisita}%
              </small>
            </div>
          </div>
        </div>
      )}

      <div className="charts highlight-row">
        <div className="card">
          <h2>Destaques de conversão (mín. 10 leads)</h2>
          <ul className="insight-list">
            <li>
              <strong>Melhor taxa de visita:</strong>{" "}
              {insights.bestVisitRate
                ? `${insights.bestVisitRate.canal} · ${insights.bestVisitRate.taxaVisita}% (${insights.bestVisitRate.visitas}/${insights.bestVisitRate.leads})`
                : "Sem volume suficiente"}
            </li>
            <li>
              <strong>Melhor taxa de sucesso:</strong>{" "}
              {insights.bestSuccessRate
                ? `${insights.bestSuccessRate.canal} · ${insights.bestSuccessRate.taxaSucesso}% (${insights.bestSuccessRate.sucessos}/${insights.bestSuccessRate.leads})`
                : "Sem volume suficiente"}
            </li>
            <li>
              <strong>Melhor visita → sucesso:</strong>{" "}
              {insights.bestVisitToSuccess
                ? `${insights.bestVisitToSuccess.canal} · ${insights.bestVisitToSuccess.taxaVisitaParaSucesso}%`
                : "Sem volume suficiente"}
            </li>
            <li>
              <strong>Tempo até visita:</strong>{" "}
              {insights.visitTiming.count
                ? `média ${insights.visitTiming.avgDays} dias · mediana ${insights.visitTiming.medianDays} dias (${insights.visitTiming.count} com data)`
                : "Sem datas de visita no filtro"}
            </li>
          </ul>
        </div>

        <div className="card">
          <h2>Funil por Status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={insights.funnel} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#c02026" radius={4} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <OriginTable rows={insights.byOriginShare} />

      <div className="charts">
        <div className="card">
          <h2>Evolução por quinzena</h2>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={periodChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="leads" fill="#404041" radius={4} name="Leads" />
              <Bar yAxisId="left" dataKey="visitas" fill="#2563eb" radius={4} name="Visitas" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sucessos"
                stroke="#c02026"
                strokeWidth={2}
                name="Sucessos"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Mix de propostas (todos os leads)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={insights.propostaAll}
                dataKey="value"
                nameKey="label"
                outerRadius={100}
                label
              >
                {insights.propostaAll.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Top 5 atendentes (volume)</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Atendente</th>
                  <th>Leads</th>
                  <th>Visitas</th>
                  <th>Sucessos</th>
                  <th>Taxa Suc.</th>
                </tr>
              </thead>
              <tbody>
                {insights.topAttendantsByLeads.map((a) => (
                  <tr key={a.responsavel}>
                    <td>
                      <strong>{a.responsavel}</strong>
                    </td>
                    <td>{a.leads}</td>
                    <td>{a.visitas}</td>
                    <td className={a.sucessos ? "positive" : "zero"}>{a.sucessos}</td>
                    <td>{a.taxaSucesso}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>Top 5 atendentes (taxa sucesso · mín. 5 leads)</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Atendente</th>
                  <th>Leads</th>
                  <th>Sucessos</th>
                  <th>Taxa Suc.</th>
                  <th>Visita → Suc.</th>
                </tr>
              </thead>
              <tbody>
                {insights.topAttendantsBySuccess.map((a) => (
                  <tr key={a.responsavel}>
                    <td>
                      <strong>{a.responsavel}</strong>
                    </td>
                    <td>{a.leads}</td>
                    <td className={a.sucessos ? "positive" : "zero"}>{a.sucessos}</td>
                    <td className="positive">{a.taxaSucesso}%</td>
                    <td>{a.taxaVisitaParaSucesso}%</td>
                  </tr>
                ))}
                {insights.topAttendantsBySuccess.length === 0 && (
                  <tr>
                    <td colSpan={5} className="muted">
                      Sem atendentes com volume mínimo no filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>Volume de Leads por Canal</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={summary.byOrigin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="canal" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="leads" fill="#c02026" radius={4} name="Leads" />
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
              <Legend />
              <Bar dataKey="leads" fill="#404041" radius={4} name="Leads" />
              <Bar dataKey="visitas" fill="#2563eb" radius={4} name="Visitas" />
              <Bar dataKey="sucessos" fill="#c02026" radius={4} name="Sucessos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="muted">
        Filtro atual: {analytics.filtered.length.toLocaleString("pt-BR")} leads · arquivo publicado:{" "}
        {dataset.leads.length.toLocaleString("pt-BR")} · atualizado em{" "}
        {new Date(dataset.updatedAt).toLocaleString("pt-BR")}
      </p>
    </>
  );
}
