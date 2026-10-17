import type { SdrVendedorPairRow } from "../../lib/scheduling/metrics";

type Props = {
  rows: SdrVendedorPairRow[];
};

export function SdrVendedorProposalTable({ rows }: Props) {
  return (
    <div className="card">
      <h2>Comparação direta: agendamentos × proposta</h2>
      <p className="muted">
        Pré-Venda — cada linha é um par SDR × Vendedor: quantos agendamentos o SDR fez para aquele
        vendedor, por tipo de proposta, visitas, sucessos e insucessos (com %).
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>SDR</th>
              <th>Vendedor</th>
              <th>Agendamentos</th>
              <th>Compra</th>
              <th>Venda</th>
              <th>Troca</th>
              <th>Consign.</th>
              <th>Financ.</th>
              <th>N/I</th>
              <th>Visitas</th>
              <th>Sucessos</th>
              <th>Insucessos</th>
              <th>% Visita</th>
              <th>% Sucesso</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.sdr}::${r.vendedor}`}>
                <td>{r.sdr}</td>
                <td>{r.vendedor}</td>
                <td>{r.total}</td>
                <td>{r.compra}</td>
                <td>{r.venda}</td>
                <td>{r.troca}</td>
                <td>{r.consignacao}</td>
                <td>{r.financiamento}</td>
                <td>{r.naoInformado}</td>
                <td>{r.visitas}</td>
                <td>{r.sucessos}</td>
                <td>{r.insucessos}</td>
                <td>{r.taxaVisita}%</td>
                <td>{r.taxaSucesso}%</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={14} className="muted">
                  Nenhum par SDR × Vendedor com agendamentos no filtro atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
