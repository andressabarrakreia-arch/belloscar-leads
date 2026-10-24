import { InfoTip } from "../../components/InfoTip";
import { InteractiveTable } from "../../components/InteractiveTable";
import { ShareDonut } from "../../components/charts/ShareDonut";
import { useNegociacoesAnalyticsContext } from "../../context/NegociacoesAnalyticsContext";

export function NegociacoesVendedores() {
  const { analytics } = useNegociacoesAnalyticsContext();
  if (!analytics) return null;

  const { vendedores, rankings, avaliacoes } = analytics;

  return (
    <>
      <div className="charts">
        <ShareDonut
          title="Total por vendedor"
          data={vendedores.map((row) => ({ label: row.vendedor, value: row.total }))}
        />
      </div>
      <div className="card">
        <h2>
          Desempenho por vendedor
          <InfoTip>Vendas + Trocas · Consignações · Compras · Total (filtro atual).</InfoTip>
        </h2>
        <InteractiveTable
          rows={vendedores}
          rowKey={(row) => row.vendedor}
          columns={[
            { key: "vendedor", label: "Vendedor", sortValue: (row) => row.vendedor },
            { key: "vendas", label: "Vendas", sortValue: (row) => row.vendas, render: (row) => <span className="num-ok">{row.vendas}</span> },
            { key: "trocas", label: "Trocas", sortValue: (row) => row.trocas },
            { key: "vt", label: "Vendas + Trocas", sortValue: (row) => row.vendasMaisTrocas },
            { key: "consignacoes", label: "Consignações", sortValue: (row) => row.consignacoes },
            { key: "compras", label: "Compras", sortValue: (row) => row.compras },
            { key: "total", label: "Total", sortValue: (row) => row.total },
          ]}
        />
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
