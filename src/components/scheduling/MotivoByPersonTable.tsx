import type { MotivoByPersonRow } from "../../lib/scheduling/metrics";
import { InfoTip } from "../InfoTip";
import { MotivoLabel } from "./MotivoLabel";

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
      <h2>
        {title}
        {subtitle ? <InfoTip>{subtitle}</InfoTip> : null}
      </h2>
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
                  <td className="num-bad">{r.totalInsucessos}</td>
                  <td>
                    <MotivoLabel motivo={top?.motivo ?? "—"} ids={top?.ids} />
                  </td>
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
