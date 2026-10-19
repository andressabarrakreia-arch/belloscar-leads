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
import { useNegociacoesAnalyticsContext } from "../../context/NegociacoesAnalyticsContext";

export function NegociacoesOverview() {
  const { analytics } = useNegociacoesAnalyticsContext();
  if (!analytics) return null;

  const { kpis, periodSeries, statusRows } = analytics;

  return (
    <>
      <div className="card">
        <h2>Resumo da loja</h2>
        <p className="muted">
          Total = negócios contáveis (sem Cancelado · sem Compra de Consignado). Troca com 2
          linhas conta como 1; Venda/Compra multi-linha contam por linha.
        </p>
        <div className="kpi-grid">
          <div className="kpi-card accent">
            <h3>Total negócios</h3>
            <p>{kpis.total}</p>
          </div>
          <div className="kpi-card">
            <h3>Vendas</h3>
            <p>{kpis.vendas}</p>
          </div>
          <div className="kpi-card">
            <h3>Trocas</h3>
            <p>{kpis.trocas}</p>
          </div>
          <div className="kpi-card">
            <h3>Compras</h3>
            <p>{kpis.compras}</p>
          </div>
          <div className="kpi-card success">
            <h3>Consignações</h3>
            <p>{kpis.consignacoes}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Série por quinzena</h2>
        {periodSeries.length === 0 ? (
          <p className="muted">Sem negócios no filtro atual.</p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={periodSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="vendas" stackId="a" fill="#c02026" name="Vendas" />
                <Bar dataKey="trocas" stackId="a" fill="#2563eb" name="Trocas" />
                <Bar dataKey="compras" stackId="a" fill="#404041" name="Compras" />
                <Bar dataKey="consignacoes" stackId="a" fill="#16a34a" name="Consignações" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Status</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Qtd</th>
              </tr>
            </thead>
            <tbody>
              {statusRows.map((r) => (
                <tr key={r.status}>
                  <td>{r.status}</td>
                  <td>{r.quantidade}</td>
                </tr>
              ))}
              {statusRows.length === 0 && (
                <tr>
                  <td colSpan={2} className="muted">
                    Sem dados no filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
