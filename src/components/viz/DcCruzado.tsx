import { useEffect, useRef } from "react";
import crossfilter from "crossfilter2";
import { deregisterChart, rowChart } from "dc";
import "dc/dist/style/dc.css";

type Linha = Record<string, string>;

type Props = {
  titulo: string;
  dica: string;
  linhas: Linha[];
  chaveA: string;
  tituloA: string;
  chaveB: string;
  tituloB: string;
};

/** Duas barras ligadas: o clique numa filtra a outra. */
export function DcCruzado({ titulo, dica, linhas, chaveA, tituloA, chaveB, tituloB }: Props) {
  const refA = useRef<HTMLDivElement>(null);
  const refB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elA = refA.current;
    const elB = refB.current;
    if (!elA || !elB || linhas.length === 0) return;
    const fatos = crossfilter(linhas);
    const dimA = fatos.dimension((row) => row[chaveA] || "—");
    const dimB = fatos.dimension((row) => row[chaveB] || "—");
    const grupo = `dc-${chaveA}-${chaveB}`;
    const chartA = rowChart(elA, grupo);
    const chartB = rowChart(elB, grupo);
    const altura = 280;
    chartA
      .width(elA.clientWidth || 320)
      .height(altura)
      .dimension(dimA)
      .group(dimA.group())
      .elasticX(true)
      .cap(12)
      .ordinalColors(["#c02026"])
      .renderLabel(true);
    chartB
      .width(elB.clientWidth || 320)
      .height(altura)
      .dimension(dimB)
      .group(dimB.group())
      .elasticX(true)
      .cap(12)
      .ordinalColors(["#404041"])
      .renderLabel(true);
    chartA.render();
    chartB.render();
    return () => {
      deregisterChart(chartA);
      deregisterChart(chartB);
      elA.replaceChildren();
      elB.replaceChildren();
    };
  }, [linhas, chaveA, chaveB]);

  if (linhas.length === 0) return null;

  return (
    <section className="card dc-cruzado">
      <h2>{titulo}</h2>
      <p className="muted">{dica}</p>
      <div className="dc-grade">
        <div>
          <h3>{tituloA}</h3>
          <div ref={refA} />
        </div>
        <div>
          <h3>{tituloB}</h3>
          <div ref={refB} />
        </div>
      </div>
    </section>
  );
}
