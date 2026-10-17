import type { ComparisonRow } from "../../lib/scheduling/metrics";

type Props = {
  rows: ComparisonRow[];
};

export function PerformanceComparisonTable({ rows }: Props) {
  return (
    <div className="card">
      <h2>Comparação direta de performance</h2>
      <p className="muted">
        Visão analítica para gerentes, sócios e donos — SDRs e vendedores lado a lado.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Papel</th>
              <th>Canal</th>
              <th>Total</th>
              <th>Visitas</th>
              <th>Sucessos</th>
              <th>Insucessos</th>
              <th>% Visita</th>
              <th>% Sucesso</th>
              <th>% Pré-Venda</th>
              <th>% Recepção</th>
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
              <tr key={`${r.papel}-${r.nome}`}>
                <td>{r.nome}</td>
                <td>{r.papel}</td>
                <td>{r.canal}</td>
                <td>{r.total}</td>
                <td>{r.visitas}</td>
                <td>{r.sucessos}</td>
                <td>{r.insucessos}</td>
                <td>{r.taxaVisita}%</td>
                <td>{r.taxaSucesso}%</td>
                <td>{r.convPreVenda !== undefined ? `${r.convPreVenda}%` : "—"}</td>
                <td>{r.convRecepcao !== undefined ? `${r.convRecepcao}%` : "—"}</td>
                <td>{r.compra}</td>
                <td>{r.venda}</td>
                <td>{r.troca}</td>
                <td>{r.consignacao}</td>
                <td>{r.financiamento}</td>
                <td>{r.naoInformado}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={17} className="muted">
                  Importe planilhas em Gestão para popular a comparação.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
