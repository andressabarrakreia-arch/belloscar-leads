import type { PropostaConversao, SdrPreVendaRow } from "../../lib/scheduling/types";

type Props = {
  rows: SdrPreVendaRow[];
};

function taxaOf(rows: PropostaConversao[], tipo: string): string {
  const hit = rows.find((r) => r.tipo === tipo);
  if (!hit) return "—";
  return `${hit.taxa}% (${hit.sucessos}/${hit.agendamentos})`;
}

/** 1) Desempenho unificado (volumes + taxas + mix em quantidade). */
export function SdrPreVendaUnifiedTable({ rows }: Props) {
  return (
    <div className="card">
      <h2>Desempenho Pré-Vendas</h2>
      <p className="muted">
        Por SDR (ordem da equipe web). Atendimentos = LEADS GERAL · % Agend. = Agendamentos/Atendimentos
        · Conv. visita = Visitas/Agendamentos · Conv. = Sucessos/Agendamentos. Recepção não entra
        neste bloco.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Atendido por</th>
              <th>Atendimentos</th>
              <th>Agend.</th>
              <th>% Agend.</th>
              <th>Visitas</th>
              <th>Sucessos</th>
              <th>Insucessos</th>
              <th>Conv. visita</th>
              <th>Conv.</th>
              <th>Compra</th>
              <th>Venda</th>
              <th>Troca</th>
              <th>Consign.</th>
              <th>Financ.</th>
              <th>N/I</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sdr}>
                <td>{r.sdr}</td>
                <td>{r.totalAtendimentos}</td>
                <td>{r.totalAgendamentos}</td>
                <td>{r.taxaAgendamento}%</td>
                <td>{r.totalVisitas}</td>
                <td>{r.totalSucesso}</td>
                <td>{r.totalInsucesso}</td>
                <td>{r.taxaConversaoVisita}%</td>
                <td>{r.taxaConversaoSucesso}%</td>
                <td>{r.propostasBreakdown.Compra}</td>
                <td>{r.propostasBreakdown.Venda}</td>
                <td>{r.propostasBreakdown.Troca}</td>
                <td>{r.propostasBreakdown.Consignação}</td>
                <td>{r.propostasBreakdown.Financiamento}</td>
                <td>{r.propostasBreakdown["não informado(celulas em branco)"]}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={15} className="muted">
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

/** 2) Conversão por tipo de proposta (Su/Ag do tipo), por SDR. */
export function SdrPreVendaConvPropostaTable({ rows }: Props) {
  return (
    <div className="card">
      <h2>Conversão por tipo de proposta</h2>
      <p className="muted">
        Por SDR — % = Sucessos do tipo / Agendamentos daquele tipo (Su/Ag). Tipos sem volume
        aparecem como —.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Atendido por</th>
              <th>Compra</th>
              <th>Venda</th>
              <th>Troca</th>
              <th>Consign.</th>
              <th>Financ.</th>
              <th>N/I</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sdr}>
                <td>{r.sdr}</td>
                <td>{taxaOf(r.conversaoPorProposta, "Compra")}</td>
                <td>{taxaOf(r.conversaoPorProposta, "Venda")}</td>
                <td>{taxaOf(r.conversaoPorProposta, "Troca")}</td>
                <td>{taxaOf(r.conversaoPorProposta, "Consignação")}</td>
                <td>{taxaOf(r.conversaoPorProposta, "Financiamento")}</td>
                <td>{taxaOf(r.conversaoPorProposta, "não informado(celulas em branco)")}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
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

/** 3) Top 3 vendedores por SDR. */
export function SdrPreVendaTopParceirosTable({ rows }: Props) {
  return (
    <div className="card">
      <h2>Top 3 vendedores por SDR</h2>
      <p className="muted">
        Resumo SDR × vendedor — os 3 vendedores com mais agendamentos de cada SDR (volume e %
        Su/Ag). Detalhe completo na aba Agendamentos.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Atendido por</th>
              <th>1º</th>
              <th>2º</th>
              <th>3º</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const [a, b, c] = r.topParceiros;
              const fmt = (p?: (typeof r.topParceiros)[0]) =>
                p ? (
                  <>
                    {p.vendedor}{" "}
                    <span className="muted">
                      ({p.total} ag · {p.taxaSucesso}% Su/Ag)
                    </span>
                  </>
                ) : (
                  <span className="muted">—</span>
                );
              return (
                <tr key={r.sdr}>
                  <td>{r.sdr}</td>
                  <td>{fmt(a)}</td>
                  <td>{fmt(b)}</td>
                  <td>{fmt(c)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
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
