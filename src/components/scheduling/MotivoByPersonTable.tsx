import type { MotivoByPersonRow } from "../../lib/scheduling/metrics";

type Props = {
  rows: MotivoByPersonRow[];
  title: string;
  subtitle: string;
  nameLabel: string;
};

/** Tabela de motivos de insucesso cruzados por pessoa (SDR ou vendedor). */
export function MotivoByPersonTable({ rows, title, subtitle, nameLabel }: Props) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p className="muted">{subtitle}</p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{nameLabel}</th>
              <th>Insucessos</th>
              <th>Principal motivo</th>
              <th>Qtd</th>
              <th>% do recorte</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const top = r.motivos[0];
              return (
                <tr key={r.nome}>
                  <td>{r.nome}</td>
                  <td>{r.totalInsucessos}</td>
                  <td>{top?.motivo ?? "—"}</td>
                  <td>{top?.quantidade ?? "—"}</td>
                  <td>{top ? `${top.percentual}%` : "—"}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  Nenhum insucesso no filtro atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
