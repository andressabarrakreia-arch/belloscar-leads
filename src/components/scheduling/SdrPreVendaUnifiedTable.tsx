import type { PropostaConversao, SdrPreVendaRow } from "../../lib/scheduling/types";

type Props = {
  rows: SdrPreVendaRow[];
};

function shortTipo(tipo: string): string {
  if (tipo === "não informado(celulas em branco)") return "N/I";
  if (tipo === "Consignação") return "Consign.";
  if (tipo === "Financiamento") return "Financ.";
  return tipo;
}

function ConvPropostaCell({ rows }: { rows: PropostaConversao[] }) {
  if (rows.length === 0) return <span className="muted">—</span>;
  return (
    <ul className="mini-list">
      {rows.map((r) => (
        <li key={r.tipo}>
          <strong>{shortTipo(r.tipo)}</strong> {r.taxa}%{" "}
          <span className="muted">
            ({r.sucessos}/{r.agendamentos})
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Tabela única Pré-Vendas: volumes, taxas, conv. por proposta e top 3 parceiros. */
export function SdrPreVendaUnifiedTable({ rows }: Props) {
  return (
    <div className="card">
      <h2>Desempenho Pré-Vendas</h2>
      <p className="muted">
        Painel unificado por SDR (ordem da equipe web). Show-up = Visitas/Agendamentos · Conv. =
        Sucessos/Agendamentos · Conv. por proposta = Sucessos do tipo / Agendamentos do tipo · Top 3
        = vendedores com mais agendamentos daquele SDR. Recepção não entra neste bloco.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Atendido por</th>
              <th>Agend.</th>
              <th>Visitas</th>
              <th>Sucessos</th>
              <th>Insucessos</th>
              <th>Show-up</th>
              <th>Conv.</th>
              <th>% Insuc.</th>
              <th>Compra</th>
              <th>Venda</th>
              <th>Troca</th>
              <th>Consign.</th>
              <th>Financ.</th>
              <th>N/I</th>
              <th>Conv. por proposta (Su/Ag do tipo)</th>
              <th>Top 3 vendedores</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sdr}>
                <td>{r.sdr}</td>
                <td>{r.totalAgendamentos}</td>
                <td>{r.totalVisitas}</td>
                <td>{r.totalSucesso}</td>
                <td>{r.totalInsucesso}</td>
                <td>{r.taxaConversaoVisita}%</td>
                <td>{r.taxaConversaoSucesso}%</td>
                <td>{r.taxaInsucesso}%</td>
                <td>{r.propostasBreakdown.Compra}</td>
                <td>{r.propostasBreakdown.Venda}</td>
                <td>{r.propostasBreakdown.Troca}</td>
                <td>{r.propostasBreakdown.Consignação}</td>
                <td>{r.propostasBreakdown.Financiamento}</td>
                <td>{r.propostasBreakdown["não informado(celulas em branco)"]}</td>
                <td>
                  <ConvPropostaCell rows={r.conversaoPorProposta} />
                </td>
                <td>
                  {r.topParceiros.length === 0 ? (
                    <span className="muted">—</span>
                  ) : (
                    <ol className="mini-list mini-list--ol">
                      {r.topParceiros.map((p, idx) => (
                        <li key={p.vendedor}>
                          {idx + 1}. {p.vendedor}{" "}
                          <span className="muted">
                            ({p.total} ag · {p.taxaSucesso}% Su/Ag)
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={16} className="muted">
                  Nenhum registro de Pré-Venda no filtro atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
