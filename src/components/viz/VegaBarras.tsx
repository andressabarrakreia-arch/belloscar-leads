import { useEffect, useRef } from "react";
import embed from "vega-embed";
import type { TopLevelSpec } from "vega-lite";
import { tinta, useTema } from "../../theme";

type Props = {
  titulo: string;
  dica: string;
  dados: Record<string, string | number>[];
  nome: string;
  valor: string;
  valorLabel?: string;
};

/** Barras declaradas em Vega-Lite. O mouse mostra o valor. */
export function VegaBarras({ titulo, dica, dados, nome, valor, valorLabel = "Quantidade" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { tema } = useTema();

  useEffect(() => {
    const el = ref.current;
    if (!el || dados.length === 0) return;
    const tintaEixo = tinta("var(--chart-ink)");
    const tintaNota = tinta("var(--chart-muted)");
    const tintaGrade = tinta("var(--chart-grid)");
    const spec: TopLevelSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      background: "transparent",
      width: "container",
      height: Math.max(180, dados.length * 28),
      data: { values: dados },
      mark: { type: "bar", color: tinta("var(--chart-red)"), cornerRadiusEnd: 4 },
      encoding: {
        y: {
          field: nome,
          type: "nominal",
          sort: "-x",
          title: null,
          axis: { labelLimit: 180, labelColor: tintaEixo, tickColor: tintaGrade, domainColor: tintaGrade },
        },
        x: {
          field: valor,
          type: "quantitative",
          title: valorLabel,
          axis: {
            labelColor: tintaEixo,
            titleColor: tintaNota,
            gridColor: tintaGrade,
            tickColor: tintaGrade,
            domainColor: tintaGrade,
          },
        },
        tooltip: [
          { field: nome, type: "nominal", title: "Nome" },
          { field: valor, type: "quantitative", title: valorLabel, format: "," },
        ],
      },
      config: { view: { stroke: "transparent" }, background: "transparent" },
    };
    let fechou = false;
    let vista: { finalize: () => void } | null = null;
    embed(el, spec, { actions: false, renderer: "svg" }).then((result) => {
      if (fechou) result.finalize();
      else vista = result;
    });
    return () => {
      fechou = true;
      vista?.finalize();
    };
  }, [dados, nome, valor, valorLabel, tema]);

  if (dados.length === 0) return null;

  return (
    <section className="card">
      <h2>{titulo}</h2>
      <p className="muted">{dica}</p>
      <div ref={ref} className="vega-barras" />
    </section>
  );
}
