import { useNegociacoesAnalyticsContext } from "../../context/NegociacoesAnalyticsContext";

function fmtDate(iso: string): string {
  if (!iso || iso === "1970-01-01") return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function NegociacoesLancamentos() {
  const { analytics } = useNegociacoesAnalyticsContext();
  if (!analytics) return null;

  const { lancamentos } = analytics;

  return (
    <div className="card">
      <h2>Lançamentos</h2>
      <p className="muted">
        Uma linha por negócio. Troca aparece consolidada (placa entrada + placa saída).
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Nº</th>
              <th>Vendedor</th>
              <th>Tipo</th>
              <th>Mov.</th>
              <th>Placa entrada</th>
              <th>Placa saída</th>
              <th>Tipo venda</th>
              <th>Status</th>
              <th>Cliente</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map((r) => (
              <tr key={r.dealId}>
                <td>{fmtDate(r.data)}</td>
                <td>{r.negociacaoId}</td>
                <td>{r.vendedor}</td>
                <td>{r.tipo}</td>
                <td>{r.movimentacao || "—"}</td>
                <td>{r.placaEntrada || "—"}</td>
                <td>{r.placaSaida || "—"}</td>
                <td>{r.tipoVenda}</td>
                <td>{r.status}</td>
                <td>{r.cliente || "—"}</td>
              </tr>
            ))}
            {lancamentos.length === 0 && (
              <tr>
                <td colSpan={10} className="muted">
                  Nenhum lançamento no filtro atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
