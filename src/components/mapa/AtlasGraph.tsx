import { useEffect, useRef } from "react";
import * as d3 from "d3";
import gsap from "gsap";

export type GraphKind = "hub" | "module" | "gate" | "admin" | "data";

export type GraphNodeInput = {
  id: string;
  label: string;
  kind: GraphKind;
  hash: string;
};

type SimNode = GraphNodeInput & d3.SimulationNodeDatum;
type SimLink = d3.SimulationLinkDatum<SimNode>;

const KIND_FILL: Record<GraphKind, string> = {
  hub: "#3d9aad",
  module: "#e8e6e1",
  gate: "#c02026",
  admin: "#e0a24a",
  data: "#7a848c",
};

type AtlasGraphProps = {
  nodes: GraphNodeInput[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function AtlasGraph({ nodes, activeId, onSelect }: AtlasGraphProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const svgEl = svgRef.current;
    const wrap = wrapRef.current;
    if (!svgEl || !wrap || nodes.length === 0) return;

    const width = Math.max(320, wrap.clientWidth);
    const height = Math.min(480, Math.max(320, Math.round(width * 0.55)));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }));
    const byId = new Map(simNodes.map((n) => [n.id, n]));
    const links: SimLink[] = [];

    const hub = byId.get("hub");
    for (const n of simNodes) {
      if (n.kind === "module" && hub) links.push({ source: hub, target: n });
      if ((n.kind === "gate" || n.kind === "admin") && hub) links.push({ source: hub, target: n });
    }
    const dataAg = byId.get("data-ag");
    const dataNeg = byId.get("data-neg");
    const dataLeg = byId.get("data-leg");
    for (const id of ["campanhas", "agendamentos", "erros"]) {
      const m = byId.get(id);
      if (m && dataAg) links.push({ source: dataAg, target: m });
    }
    const neg = byId.get("negociacoes");
    if (neg && dataNeg) links.push({ source: dataNeg, target: neg });
    const perfil = byId.get("perfil");
    if (perfil && dataNeg) links.push({ source: dataNeg, target: perfil });
    if (hub && dataLeg) links.push({ source: dataLeg, target: hub });

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", height);

    const g = svg.append("g").attr("class", "atlas-graph-root");

    const simulation = d3
      .forceSimulation(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(72)
          .strength(0.55)
      )
      .force("charge", d3.forceManyBody().strength(-220))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(28));

    if (reduce) {
      simulation.stop();
      const ring = Math.min(width, height) * 0.32;
      simNodes.forEach((n, i) => {
        const a = (i / simNodes.length) * Math.PI * 2 - Math.PI / 2;
        n.x = width / 2 + Math.cos(a) * (n.kind === "hub" ? 0 : ring);
        n.y = height / 2 + Math.sin(a) * (n.kind === "hub" ? 0 : ring);
      });
    }

    const link = g
      .append("g")
      .attr("class", "atlas-graph-links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "rgba(61, 154, 173, 0.35)")
      .attr("stroke-width", 1.25);

    const node = g
      .append("g")
      .attr("class", "atlas-graph-nodes")
      .selectAll("g")
      .data(simNodes)
      .join("g")
      .attr("class", (d) => `atlas-graph-node${d.id === activeId ? " is-active" : ""}`)
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, SimNode>()
          .on("start", (event, d) => {
            if (!event.active && !reduce) simulation.alphaTarget(0.25).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active && !reduce) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    node
      .append("circle")
      .attr("r", (d) => (d.kind === "hub" ? 16 : d.kind === "data" ? 9 : 12))
      .attr("fill", (d) => KIND_FILL[d.kind])
      .attr("stroke", (d) => (d.id === activeId ? "#fff" : "rgba(18,21,26,0.85)"))
      .attr("stroke-width", (d) => (d.id === activeId ? 2.5 : 1.25));

    node
      .append("text")
      .text((d) => d.label)
      .attr("x", 0)
      .attr("y", 26)
      .attr("text-anchor", "middle")
      .attr("fill", "#d4cfc4")
      .attr("font-size", 11)
      .attr("font-family", "IBM Plex Sans, system-ui, sans-serif");

    node.on("click", (_event, d) => {
      onSelectRef.current(d.id);
    });

    function tick() {
      link
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);
      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    }

    if (reduce) {
      tick();
    } else {
      simulation.on("tick", tick);
      gsap.fromTo(
        svgEl,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" }
      );
    }

    return () => {
      simulation.stop();
      svg.selectAll("*").remove();
    };
    // activeId só para stroke inicial; recriar o grafo a cada activeId reinicia a física demais
    // eslint-disable-next-line react-hooks/exhaustive-deps -- montar quando a lista de nós muda
  }, [nodes]);

  return (
    <section className="atlas-graph" aria-label="Mapa gráfico interativo do site">
      <div className="atlas-graph-head">
        <h3>Mapa gráfico</h3>
        <p>Arraste os nós · clique para selecionar e abrir a rota</p>
      </div>
      <div className="atlas-graph-canvas" ref={wrapRef}>
        <svg ref={svgRef} role="img" aria-label="Grafo de rotas e dados do BellosCar" />
      </div>
    </section>
  );
}
