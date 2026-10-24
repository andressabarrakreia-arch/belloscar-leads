import { useEffect, useRef } from "react";
import embed from "vega-embed";
import type { TopLevelSpec } from "vega-lite";

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

  useEffect(() => {
    const el = ref.current;
    if (!el || dados.length === 0) return;
    const spec: TopLevelSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      width: "container",
      height: Math.max(180, dados.length * 28),
      data: { values: dados },
      mark: { type: "bar", color: "#c02026", cornerRadiusEnd: 4 },
      encoding: {
        y: { field: nome, type: "nominal", sort: "-x", title: null, axis: { labelLimit: 180 } },
        x: { field: valor, type: "quantitative", title: valorLabel },
        tooltip: [
          { field: nome, type: "nominal", title: "Nome" },
          { field: valor, type: "quantitative", title: valorLabel, format: "," },
        ],
      },
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
  }, [dados, nome, valor, valorLabel]);

  if (dados.length === 0) return null;

  return (
    <section className="card">
      <h2>{titulo}</h2>
      <p className="muted">{dica}</p>
      <div ref={ref} className="vega-barras" />
    </section>
  );
}
