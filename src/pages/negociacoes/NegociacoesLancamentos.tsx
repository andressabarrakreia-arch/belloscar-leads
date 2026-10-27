import { InfoTip } from "../../components/InfoTip";
import { InteractiveTable } from "../../components/InteractiveTable";
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
      <h2>
        Lançamentos
        <InfoTip>
          Uma linha por negócio. Troca aparece consolidada (placa entrada + placa saída).
        </InfoTip>
      </h2>
      <InteractiveTable
        rows={lancamentos}
        rowKey={(row) => row.dealId}
        columns={[
          { key: "data", label: "Data", sortValue: (row) => row.data, render: (row) => fmtDate(row.data) },
          { key: "n", label: "Nº", sortValue: (row) => row.negociacaoId },
          { key: "vendedor", label: "Vendedor", sortValue: (row) => row.vendedor },
          { key: "tipo", label: "Tipo", sortValue: (row) => row.tipo },
          { key: "mov", label: "Mov.", sortValue: (row) => row.movimentacao || "" },
          {
            key: "pe",
            label: "Placa entrada",
            sortValue: (row) => row.placaEntrada || "",
            render: (row) => (
              <div>
                <div>{row.placaEntrada || "—"}</div>
                {row.modeloEntrada ? (
                  <div className="muted" style={{ fontSize: "0.75rem", lineHeight: 1.2 }}>
                    {row.modeloEntrada}
                  </div>
                ) : null}
              </div>
            ),
          },
          {
            key: "ps",
            label: "Placa saída",
            sortValue: (row) => row.placaSaida || "",
            render: (row) => (
              <div>
                <div>{row.placaSaida || "—"}</div>
                {row.modeloSaida ? (
                  <div className="muted" style={{ fontSize: "0.75rem", lineHeight: 1.2 }}>
                    {row.modeloSaida}
                  </div>
                ) : null}
              </div>
            ),
          },
          { key: "tv", label: "Tipo venda", sortValue: (row) => row.tipoVenda },
          { key: "status", label: "Status", sortValue: (row) => row.status },
          { key: "cliente", label: "Cliente", sortValue: (row) => row.cliente || "" },
        ]}
      />
    </div>
  );
}
