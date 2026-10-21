import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CampanhasFilters } from "../components/CampanhasFilters";
import { useCampanhas } from "../hooks/useCampanhas";
import {
  buildCanalRows,
  buildMonthRows,
  buildSdrRows,
  listSdrOptions,
  sliceCampanhas,
  type CampanhaFilters,
} from "../lib/campanhas/analytics";

export function Dashboard() {
  const { dataset, rows, loading, error } = useCampanhas();
  const [filters, setFilters] = useState<CampanhaFilters>({});
  const sdrs = useMemo(() => listSdrOptions(rows), [rows]);
  const slice = useMemo(() => sliceCampanhas(rows, filters), [rows, filters]);
  const canais = useMemo(() => buildCanalRows(slice), [slice]);
  const sdrRows = useMemo(() => buildSdrRows(slice).slice(0, 12), [slice]);
  const months = useMemo(() => buildMonthRows(slice), [slice]);

  if (loading) return <p className="muted">Carregando campanhas…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!dataset) return null;

  const { kpis } = slice;

  return (
    <>
      <div className="card">
        <h2>Facebook e Instagram</h2>
        <p className="muted">
          Só entram IDs cuja origem no LEADS GERAL é Facebook, Facebook Ads, Instagram ou
          Instagram Ads (também com canal junto, como WhatsApp | Instagram Ads). Os demais
          atendimentos ficam de fora. Cada número usa a própria data: atendimento em{" "}
          <strong>Atendido em</strong>, visita em <strong>Visita em</strong> (Visita = Sim),
          agendamento em <strong>Agendado em</strong>, sucesso em <strong>Finalizado em</strong>.
          Cruzamento e dedupe por ID.
        </p>
      </div>

      <CampanhasFilters filters={filters} sdrs={sdrs} onChange={setFilters} />

      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Atendimentos</h3>
          <p>{kpis.atendimentos.toLocaleString("pt-BR")}</p>
        </div>
        <div className="kpi-card">
          <h3>Visitas</h3>
          <p>{kpis.visitas.toLocaleString("pt-BR")}</p>
        </div>
        <div className="kpi-card">
          <h3>Visita / atendimento</h3>
          <p>{kpis.taxaVisita}%</p>
        </div>
        <div className="kpi-card accent">
          <h3>Agendamentos</h3>
          <p>{kpis.agendamentos.toLocaleString("pt-BR")}</p>
        </div>
        <div className="kpi-card success">
          <h3>Sucessos</h3>
          <p>{kpis.sucessos.toLocaleString("pt-BR")}</p>
        </div>
        <div className="kpi-card success">
          <h3>Sucesso / visita</h3>
          <p>{kpis.taxaVisitaParaSucesso}%</p>
        </div>
      </div>

      <div className="card">
        <h2>Por canal</h2>
        <p className="muted">
          Um ID com Facebook e Instagram entra nas duas linhas. O total dos cards acima conta o
          ID uma vez.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Canal</th>
                <th>Atendimentos</th>
                <th>Visitas</th>
                <th>Agendamentos</th>
                <th>Sucessos</th>
                <th>Visita / atend.</th>
                <th>Sucesso / visita</th>
              </tr>
            </thead>
            <tbody>
              {canais.map((row) => (
                <tr key={row.canal}>
                  <td>
                    <strong>{row.canal}</strong>
                  </td>
                  <td>{row.atendimentos}</td>
                  <td className={row.visitas ? "positive" : "zero"}>{row.visitas}</td>
                  <td>{row.agendamentos}</td>
                  <td className={row.sucessos ? "positive" : "zero"}>{row.sucessos}</td>
                  <td>{row.taxaVisita}%</td>
                  <td>{row.taxaVisitaParaSucesso}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="charts">
        <div className="card">
          <h2>Volume por canal</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={canais}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="canal" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="atendimentos" fill="#404041" name="Atendimentos" radius={4} />
              <Bar dataKey="visitas" fill="#2563eb" name="Visitas" radius={4} />
              <Bar dataKey="agendamentos" fill="#929497" name="Agendamentos" radius={4} />
              <Bar dataKey="sucessos" fill="#c02026" name="Sucessos" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2>Por mês</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="atendimentos" fill="#404041" name="Atendimentos" radius={4} />
              <Bar dataKey="visitas" fill="#2563eb" name="Visitas" radius={4} />
              <Bar dataKey="sucessos" fill="#c02026" name="Sucessos" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2>Por SDR</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>SDR</th>
                <th>Atendimentos</th>
                <th>Visitas</th>
                <th>Agendamentos</th>
                <th>Sucessos</th>
                <th>Visita / atend.</th>
              </tr>
            </thead>
            <tbody>
              {sdrRows.map((row) => (
                <tr key={row.sdr}>
                  <td>
                    <strong>{row.sdr}</strong>
                  </td>
                  <td>{row.atendimentos}</td>
                  <td className={row.visitas ? "positive" : "zero"}>{row.visitas}</td>
                  <td>{row.agendamentos}</td>
                  <td className={row.sucessos ? "positive" : "zero"}>{row.sucessos}</td>
                  <td>{row.taxaVisita}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="muted">
        IDs Meta no LEADS GERAL: {rows.length.toLocaleString("pt-BR")} · base publicada em{" "}
        {new Date(dataset.updatedAt).toLocaleString("pt-BR")}
      </p>
    </>
  );
}
