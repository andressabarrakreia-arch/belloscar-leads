import { useMemo, useState } from "react";
import { SeriesChart } from "../../components/charts/SeriesChart";
import { CHART_PALETTE } from "../../components/charts/chartTheme";
import { useNegociacoesAnalyticsContext } from "../../context/NegociacoesAnalyticsContext";
import {
  buildVendedorPeriodBars,
  comparisonGrain,
  periodFiltersOpen,
  type ComparativoTipo,
  type PeriodGrain,
} from "../../lib/negociacoes/metrics";
import type { NegociacaoDeal } from "../../lib/negociacoes/types";

const TIPOS: { id: ComparativoTipo; label: string }[] = [
  { id: "total", label: "Total" },
  { id: "vendasTrocas", label: "Vendas + trocas" },
  { id: "consignacoes", label: "Consignações" },
  { id: "compras", label: "Compras" },
];

function ComparativoChart({
  deals,
  grain,
  tipo,
}: {
  deals: NegociacaoDeal[];
  grain: PeriodGrain;
  tipo: ComparativoTipo;
}) {
  const { rows, periods } = useMemo(
    () => buildVendedorPeriodBars(deals, grain, tipo),
    [deals, grain, tipo]
  );
  const titulo = grain === "dezena" ? "Vendedores por dezena" : "Vendedores por quinzena";
  const recorte = grain === "dezena" ? "dezena" : "quinzena";
  const nomeTipo = TIPOS.find((item) => item.id === tipo)?.label ?? "Negócios";

  return (
    <SeriesChart
      title={titulo}
      tip={`Quem tem mais ${nomeTipo.toLowerCase()} aparece primeiro. O número fica na ponta da barra. As cores separam a ${recorte} do filtro.`}
      data={rows}
      xKey="vendedor"
      kind="bar"
      namesAside
      leadersFirst
      showValues
      rowDividers
      series={periods.map((period, index) => ({
        key: period.key,
        name: period.label,
        color: CHART_PALETTE[index % CHART_PALETTE.length],
      }))}
    />
  );
}

export function NegociacoesComparativo() {
  const { analytics, filters } = useNegociacoesAnalyticsContext();
  const [tipo, setTipo] = useState<ComparativoTipo>("vendasTrocas");
  if (!analytics || !filters) return null;

  const deals = analytics.filtered;
  const charts = periodFiltersOpen(filters) ? (
    <>
      <ComparativoChart deals={deals} grain="quinzena" tipo={tipo} />
      <ComparativoChart deals={deals} grain="dezena" tipo={tipo} />
    </>
  ) : (
    <ComparativoChart deals={deals} grain={comparisonGrain(filters)} tipo={tipo} />
  );

  return (
    <>
      <div className="filters" role="search" aria-label="Tipo de negociação">
        <div className="filters__presets" role="group" aria-label="Tipo de negociação">
          {TIPOS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`btn secondary${tipo === item.id ? " is-active" : ""}`}
              aria-pressed={tipo === item.id}
              onClick={() => setTipo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {charts}
    </>
  );
}
