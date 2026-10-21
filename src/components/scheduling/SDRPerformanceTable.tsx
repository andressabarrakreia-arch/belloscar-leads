import type { SdrMetrics } from "../../lib/scheduling/types";
import { InfoTip } from "../InfoTip";

type Row = SdrMetrics & {
  totalAtendimentos?: number;
  taxaAgendamento?: number;
};

type Props = {
  rows: Row[];
  title: string;
  subtitle: string;
  /** Exibe colunas de atendimentos (LEADS GERAL). */
  showAtendimentos?: boolean;
};

export function SDRPerformanceTable({
  rows,
  title,
  subtitle,
  showAtendimentos = false,
}: Props) {
  const colSpan = showAtendimentos ? 14 : 12;
  return (
    <div className="card">
      <h2>
        {title}
        {subtitle ? <InfoTip>{subtitle}</InfoTip> : null}
      </h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Atendido por</th>
              {showAtendimentos && <th>Atendimentos</th>}
              <th>Agendamentos</th>
              {showAtendimentos && <th>% Agend.</th>}
              <th>Compra</th>
              <th>Venda</th>
              <th>Troca</th>
              <th>Consignação</th>
              <th>Financiamento</th>
              <th>N/I</th>
              <th>Visitas</th>
              <th>Sucessos</th>
              <th>Conv. visita</th>
              <th>Conv.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sdr}>
                <td>{r.sdr}</td>
                {showAtendimentos && <td>{r.totalAtendimentos ?? 0}</td>}
                <td>{r.totalAgendamentos}</td>
                {showAtendimentos && <td>{r.taxaAgendamento ?? 0}%</td>}
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
                <td colSpan={colSpan} className="muted">
                  Nenhum registro neste canal no filtro atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
