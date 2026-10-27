import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import type { ErroIdLinha } from "../../lib/scheduling/errosCruzamento";

const PLANILHAS = [
  ["leads", "Leads Geral"],
  ["realizados", "Realizados"],
  ["agenda", "Agenda"],
  ["sucessos", "Sucessos"],
  ["insucessos", "Insucessos"],
] as const;

/** Quantos IDs faltam em cada planilha. A ausência cinza não entra. */
export function FaltasPlanilha({ linhas }: { linhas: ErroIdLinha[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const data = useMemo(
    () =>
      PLANILHAS.map(([key, nome]) => ({
        nome,
        qtd: linhas.filter((row) => row[key] === "nao").length,
      })),
    [linhas]
  );

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 640;
    const bar = 28;
    const height = bar * data.length + 8;
    const margin = { left: 130, right: 48, top: 4, bottom: 4 };
    const inner = width - margin.left - margin.right;
    const max = d3.max(data, (row) => row.qtd) || 1;
    const x = d3.scaleLinear().domain([0, max]).range([0, inner]);
    const y = d3
      .scaleBand<string>()
      .domain(data.map((row) => row.nome))
      .range([0, bar * data.length])
      .padding(0.28);

    svg.attr("viewBox", `0 0 ${width} ${height}`);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", 0)
      .attr("y", (row) => y(row.nome) ?? 0)
      .attr("height", y.bandwidth())
      .attr("width", (row) => x(row.qtd))
      .attr("fill", "#c02026")
      .attr("rx", 4);
    g.selectAll("text.qtd")
      .data(data)
      .join("text")
      .attr("class", "qtd")
      .attr("x", (row) => x(row.qtd) + 6)
      .attr("y", (row) => (y(row.nome) ?? 0) + y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "var(--chart-ink)")
      .attr("font-size", 13)
      .text((row) => row.qtd.toLocaleString("pt-BR"));
    g.selectAll("text.nome")
      .data(data)
      .join("text")
      .attr("class", "nome")
      .attr("x", -10)
      .attr("y", (row) => (y(row.nome) ?? 0) + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", "var(--chart-ink)")
      .attr("font-size", 13)
      .text((row) => row.nome);
  }, [data]);

  return <svg ref={ref} className="faltas-planilha" role="img" aria-label="IDs que faltam em cada planilha" />;
}
