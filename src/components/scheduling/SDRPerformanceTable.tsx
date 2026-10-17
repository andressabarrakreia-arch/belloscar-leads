import type { SdrMetrics } from "../../lib/scheduling/types";

type Props = {
  rows: SdrMetrics[];
};

export function SDRPerformanceTable({ rows }: Props) {
  return (
    <div className="card">
      <h2>Desempenho de Pré-Venda / Recepção (SDR)</h2>
      <p className="muted">
        Totais por quem atendeu o lead. Recepção inclui os nomes Recepção e Gabriela.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>SDR</th>
              <th>Canal</th>
              <th>Agendamentos</th>
              <th>Compra</th>
              <th>Venda</th>
              <th>Troca</th>
              <th>Consignação</th>
              <th>Financiamento</th>
              <th>N/I</th>
              <th>Visitas</th>
              <th>Sucessos</th>
              <th>% Visita</th>
              <th>% Sucesso</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sdr}>
                <td>{r.sdr}</td>
                <td>{r.canal}</td>
                <td>{r.totalAgendamentos}</td>
                <td>{r.propostasBreakdown.Compra}</td>
                <td>{r.propostasBreakdown.Venda}</td>
                <td>{r.propostasBreakdown.Troca}</td>
                <td>{r.propostasBreakdown.Consignação}</td>
                <td>{r.propostasBreakdown.Financiamento}</td>
                <td>{r.propostasBreakdown["não informado(celulas em branco)"]}</td>
                <td>{r.totalVisitas}</td>
                <td>{r.totalSucesso}</td>
                <td>{r.taxaConversaoVisita}%</td>
                <td>{r.taxaConversaoSucesso}%</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={13} className="muted">
                  Nenhum registro no filtro atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
