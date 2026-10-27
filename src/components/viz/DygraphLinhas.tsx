import { useEffect, useRef } from "react";
import Dygraph from "dygraphs";
import "dygraphs/dist/dygraph.css";
import { tinta, useTema } from "../../theme";

type Linha = Record<string, string | number>;

type Serie = { key: string; name: string; color: string };

type Props = {
  titulo: string;
  dica: string;
  linhas: Linha[];
  x: string;
  series: Serie[];
};

function comoData(value: string): Date {
  if (/^\d{4}-\d{2}-Q[12]$/.test(value)) {
    const dia = value.endsWith("Q2") ? "16" : "01";
    return new Date(`${value.slice(0, 7)}-${dia}T00:00:00`);
  }
  if (/^\d{4}-\d{2}$/.test(value)) return new Date(`${value}-01T00:00:00`);
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date(value) : parsed;
}

/** Série no tempo com zoom: arraste para aproximar, clique duplo para voltar. */
export function DygraphLinhas({ titulo, dica, linhas, x, series }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { tema } = useTema();

  const assinatura = JSON.stringify({ linhas, series, x, tema });

  useEffect(() => {
    const el = ref.current;
    const pacote = JSON.parse(assinatura) as { linhas: Linha[]; series: Serie[]; x: string };
    if (!el || pacote.linhas.length === 0) return;
    const data = pacote.linhas.map((row) => [
      comoData(String(row[pacote.x])),
      ...pacote.series.map((serie) => Number(row[serie.key]) || 0),
    ]);
    const grafico = new Dygraph(el, data, {
      labels: ["Data", ...pacote.series.map((serie) => serie.name)],
      colors: pacote.series.map((serie) => tinta(serie.color)),
      legend: "always",
      ylabel: "Quantidade",
      strokeWidth: 2,
      fillAlpha: 0.15,
      animatedZooms: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      axisLabelFontSize: 12,
      axisLabelColor: tinta("var(--chart-muted)"),
      axisLineColor: tinta("var(--chart-grid)"),
      highlightCircleSize: 4,
    });
    const onResize = () => grafico.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      grafico.destroy();
    };
  }, [assinatura]);

  return (
    <section className="card">
      <h2>{titulo}</h2>
      <p className="muted">{dica}</p>
      <div ref={ref} className="dygraph-box" role="img" aria-label={titulo} />
    </section>
  );
}
