import { useEffect, useRef } from "react";
import { BarChart } from "echarts/charts";
import { DataZoomComponent, GridComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import type { ErroCategoria } from "../../lib/scheduling/errosCruzamento";

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
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: { type: "value", name: "IDs", nameLocation: "middle", nameGap: 28 },
      yAxis: {
        type: "category",
        data: data.map((row) => row.nome),
        inverse: true,
        axisLabel: { color: "#404041", width: 190, overflow: "truncate" },
      },
      dataZoom: [
        { type: "inside", yAxisIndex: 0, zoomOnMouseWheel: true, moveOnMouseMove: true },
        { type: "slider", yAxisIndex: 0, width: 14, right: 8 },
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
  }, [data, categoria]);

  return <div ref={host} className="faltas-chart" role="img" aria-label="IDs por tipo de falta" />;
}
