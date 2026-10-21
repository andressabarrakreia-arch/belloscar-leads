import type { ComparisonRow } from "../../lib/scheduling/metrics";
import { InfoTip } from "../InfoTip";

type Props = {
  rows: ComparisonRow[];
  title: string;
  subtitle: string;
  showCanalSplit?: boolean;
};

export function PerformanceComparisonTable({
  rows,
  title,
  subtitle,
  showCanalSplit = false,
}: Props) {
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
              <th>Nome</th>
              <th>Papel</th>
              <th>Canal</th>
              <th>Total</th>
              <th>Visitas</th>
              <th>Sucessos</th>
              <th>Insucessos</th>
              <th>Show-up (Vi/Ag)</th>
              <th>Conv. (Su/Ag)</th>
              {showCanalSplit && <th>% Pré-Venda</th>}
              {showCanalSplit && <th>% Recepção</th>}
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
              <tr key={`${r.papel}-${r.canal}-${r.nome}`}>
                <td>{r.nome}</td>
                <td>{r.papel}</td>
                <td>{r.canal}</td>
                <td>{r.total}</td>
                <td>{r.visitas}</td>
                <td>{r.sucessos}</td>
                <td>{r.insucessos}</td>
                <td>{r.taxaVisita}%</td>
                <td>{r.taxaSucesso}%</td>
                {showCanalSplit && (
                  <td>{r.convPreVenda !== undefined ? `${r.convPreVenda}%` : "—"}</td>
                )}
                {showCanalSplit && (
                  <td>{r.convRecepcao !== undefined ? `${r.convRecepcao}%` : "—"}</td>
                )}
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
                <td colSpan={showCanalSplit ? 17 : 15} className="muted">
                  Sem dados neste canal no filtro atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
