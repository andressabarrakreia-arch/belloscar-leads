import { useEffect, useRef } from "react";
import { BarChart } from "echarts/charts";
import { DataZoomComponent, GridComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import type { ErroCategoria } from "../../lib/scheduling/errosCruzamento";
import { tinta, useTema } from "../../theme";

echarts.use([BarChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);

export type FaltaBarra = {
  id: ErroCategoria;
  nome: string;
  ids: number;
};

type Props = {
  data: FaltaBarra[];
  categoria: ErroCategoria | "todos";
  onPick: (id: ErroCategoria) => void;
};

/** Barras com zoom interno. O clique filtra a tabela. */
export function FaltasChart({ data, categoria, onPick }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);
  const pick = useRef(onPick);
  pick.current = onPick;
  const { tema } = useTema();

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const instance = echarts.init(el);
    chart.current = instance;
    const onResize = () => instance.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      instance.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = chart.current;
    if (!instance) return;
    instance.setOption({
      grid: { left: 210, right: 56, top: 8, bottom: 28 },
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: tinta("var(--chart-tip-bg)"),
        borderColor: tinta("var(--chart-tip-line)"),
        textStyle: { color: tinta("var(--chart-tip-ink)") },
        axisPointer: {
          type: "shadow",
          shadowStyle: { color: tema === "dark" ? "rgba(255,255,255,0.08)" : "rgba(64,64,65,0.08)" },
        },
      },
      xAxis: {
        type: "value",
        name: "IDs",
        nameLocation: "middle",
        nameGap: 28,
        nameTextStyle: { color: tinta("var(--chart-muted)") },
        axisLabel: { color: tinta("var(--chart-muted)") },
        axisLine: { lineStyle: { color: tinta("var(--chart-grid)") } },
        splitLine: { lineStyle: { color: tinta("var(--chart-grid)") } },
      },
      yAxis: {
        type: "category",
        data: data.map((row) => row.nome),
        inverse: true,
        axisLabel: { color: tinta("var(--chart-muted)"), width: 190, overflow: "truncate" },
      },
      dataZoom: [
        { type: "inside", yAxisIndex: 0, zoomOnMouseWheel: true, moveOnMouseMove: true },
        {
          type: "slider",
          yAxisIndex: 0,
          width: 14,
          right: 8,
          backgroundColor: tema === "dark" ? "#212023" : "#f4f5f7",
          fillerColor: tema === "dark" ? "rgba(229,86,111,0.35)" : "rgba(192,32,38,0.25)",
          borderColor: tema === "dark" ? "#2e2e32" : "#e4e5e8",
          textStyle: { color: tinta("var(--chart-muted)") },
          handleStyle: { color: tema === "dark" ? "#3a3a3e" : "#ffffff", borderColor: tema === "dark" ? "#3a3a3e" : "#e4e5e8" },
        },
      ],
      series: [
        {
          type: "bar",
          name: "IDs",
          data: data.map((row) => ({
            value: row.ids,
            id: row.id,
            itemStyle: {
              color: categoria === "todos" || categoria === row.id ? "#c02026" : "rgba(192, 32, 38, 0.35)",
              borderRadius: [0, 6, 6, 0],
            },
          })),
        },
      ],
    });
    instance.off("click");
    instance.on("click", (params) => {
      if (params.dataIndex == null) return;
      const row = data[params.dataIndex];
      if (row) pick.current(row.id);
    });
  }, [data, categoria, tema]);

  return <div ref={host} className="faltas-chart" role="img" aria-label="IDs por tipo de falta" />;
}
