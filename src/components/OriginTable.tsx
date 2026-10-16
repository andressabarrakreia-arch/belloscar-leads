import type { Kpis } from "../lib/types";

type Row = Kpis & { canal: string };

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
              <th>Visitas</th>
              <th>Taxa Visita</th>
              <th>Sucessos</th>
              <th>Taxa Sucesso</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.canal}>
                <td>
                  <strong>{row.canal}</strong>
                </td>
                <td>{row.leads}</td>
                <td className={row.visitas ? "positive" : "zero"}>{row.visitas}</td>
                <td className={row.taxaVisita ? "positive" : "zero"}>{row.taxaVisita}%</td>
                <td className={row.sucessos ? "positive" : "zero"}>{row.sucessos}</td>
                <td className={row.taxaSucesso ? "positive" : "zero"}>{row.taxaSucesso}%</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
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
