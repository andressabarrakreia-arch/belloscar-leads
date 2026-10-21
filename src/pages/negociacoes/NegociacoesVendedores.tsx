import { InfoTip } from "../../components/InfoTip";
import { useNegociacoesAnalyticsContext } from "../../context/NegociacoesAnalyticsContext";

export function NegociacoesVendedores() {
  const { analytics } = useNegociacoesAnalyticsContext();
  if (!analytics) return null;

  const { vendedores, rankings, avaliacoes } = analytics;

  return (
    <>
      <div className="card">
        <h2>
          Desempenho por vendedor
          <InfoTip>Vendas + Trocas · Consignações · Compras · Total (filtro atual).</InfoTip>
        </h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Vendas</th>
                <th>Trocas</th>
                <th>Vendas + Trocas</th>
                <th>Consignações</th>
                <th>Compras</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map((r) => (
                <tr key={r.vendedor}>
                  <td>{r.vendedor}</td>
                  <td>{r.vendas}</td>
                  <td>{r.trocas}</td>
                  <td>{r.vendasMaisTrocas}</td>
                  <td>{r.consignacoes}</td>
                  <td>{r.compras}</td>
                  <td>{r.total}</td>
                </tr>
              ))}
              {vendedores.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted">
                    Sem vendedores no filtro atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>
          Rankings
          <InfoTip>
            Uma linha por colocação. Cada bloco mostra o vendedor e a quantidade daquela métrica.
          </InfoTip>
        </h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th rowSpan={2}>#</th>
                <th colSpan={2}>Vendas + Trocas</th>
                <th colSpan={2}>Compras</th>
                <th colSpan={2}>Consignações</th>
              </tr>
              <tr>
                <th>Vendedor</th>
                <th>Qtde</th>
                <th>Vendedor</th>
                <th>Qtde</th>
                <th>Vendedor</th>
                <th>Qtde</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r) => (
                <tr key={r.pos}>
                  <td>{r.pos}</td>
                  <td>{r.vendasTrocas?.vendedor || "—"}</td>
                  <td>{r.vendasTrocas ? r.vendasTrocas.qtde : "—"}</td>
                  <td>{r.compras?.vendedor || "—"}</td>
                  <td>{r.compras ? r.compras.qtde : "—"}</td>
                  <td>{r.consignacoes?.vendedor || "—"}</td>
                  <td>{r.consignacoes ? r.consignacoes.qtde : "—"}</td>
                </tr>
              ))}
              {rankings.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted">
                    Sem dados de ranking no filtro atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>
          Conversão de avaliações
          <InfoTip>Solicitações por vendedor (filtro de mês). % = Aprovadas / Realizadas.</InfoTip>
        </h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Realizadas</th>
                <th>Aprovadas</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {[...avaliacoes]
                .sort(
                  (a, b) =>
                    b.percentual - a.percentual ||
                    b.realizadas - a.realizadas ||
                    a.vendedor.localeCompare(b.vendedor, "pt-BR")
                )
                .map((r) => (
                  <tr key={`${r.monthKey}-${r.vendedor}`}>
                    <td>{r.vendedor}</td>
                    <td>{r.realizadas}</td>
                    <td>{r.aprovadas}</td>
                    <td>{r.percentual}%</td>
                  </tr>
                ))}
              {avaliacoes.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted">
                    Sem dados de avaliação no filtro. Envie a planilha pela Gestão.
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
