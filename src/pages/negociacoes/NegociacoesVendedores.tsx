import { useNegociacoesAnalyticsContext } from "../../context/NegociacoesAnalyticsContext";

export function NegociacoesVendedores() {
  const { analytics } = useNegociacoesAnalyticsContext();
  if (!analytics) return null;

  const { vendedores } = analytics;
  const rankingVt = [...vendedores].sort((a, b) => b.vendasMaisTrocas - a.vendasMaisTrocas);
  const rankingCompra = [...vendedores].sort((a, b) => b.compras - a.compras);
  const rankingConsig = [...vendedores].sort((a, b) => b.consignacoes - a.consignacoes);

  return (
    <>
      <div className="card">
        <h2>Desempenho por vendedor</h2>
        <p className="muted">
          Vendas + Trocas · Consignações · Compras · Total (filtro atual).
        </p>
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
        <h2>Rankings</h2>
        <div className="charts" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <RankingBlock title="Vendas + Trocas" rows={rankingVt.map((r) => ({ nome: r.vendedor, qtde: r.vendasMaisTrocas }))} />
          <RankingBlock title="Compras" rows={rankingCompra.map((r) => ({ nome: r.vendedor, qtde: r.compras }))} />
          <RankingBlock title="Consignações" rows={rankingConsig.map((r) => ({ nome: r.vendedor, qtde: r.consignacoes }))} />
        </div>
      </div>
    </>
  );
}

function RankingBlock({
  title,
  rows,
}: {
  title: string;
  rows: { nome: string; qtde: number }[];
}) {
  const top = rows.filter((r) => r.qtde > 0).slice(0, 8);
  return (
    <div>
      <h3>{title}</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Vendedor</th>
            <th>Qtde</th>
          </tr>
        </thead>
        <tbody>
          {top.map((r, i) => (
            <tr key={r.nome}>
              <td>{i + 1}</td>
              <td>{r.nome}</td>
              <td>{r.qtde}</td>
            </tr>
          ))}
          {top.length === 0 && (
            <tr>
              <td colSpan={3} className="muted">
                —
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
