import type { Kpis } from "../lib/types";

type Row = Kpis & { canal: string; shareLeads?: number };

export function OriginTable({ rows }: { rows: Row[] }) {
  return (
    <div className="card">
      <h2>Desempenho por Canal / Origem</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Canal Origem</th>
              <th>Leads</th>
              <th>% do total</th>
              <th>Visitas</th>
              <th>Taxa Visita</th>
              <th>Sucessos</th>
              <th>Taxa Sucesso</th>
              <th>Visita → Sucesso</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.canal}>
                <td>
                  <strong>{row.canal}</strong>
                </td>
                <td>{row.leads}</td>
                <td className={row.shareLeads ? "" : "zero"}>
                  {row.shareLeads != null ? `${row.shareLeads}%` : "—"}
                </td>
                <td className={row.visitas ? "positive" : "zero"}>{row.visitas}</td>
                <td className={row.taxaVisita ? "positive" : "zero"}>{row.taxaVisita}%</td>
                <td className="num-ok">{row.sucessos}</td>
                <td className="num-ok">{row.taxaSucesso}%</td>
                <td className="num-ok">
                  {row.taxaVisitaParaSucesso}%
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="muted">
                  Nenhum dado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
