declare module "dc" {
  export interface DcChart {
    dimension(value: unknown): DcChart;
    group(value: unknown): DcChart;
    elasticX(value: boolean): DcChart;
    cap(value: number): DcChart;
    ordinalColors(colors: string[]): DcChart;
    width(value: number): DcChart;
    height(value: number): DcChart;
    renderLabel(value: boolean): DcChart;
    render(): DcChart;
  }
  export function rowChart(parent: HTMLElement, chartGroup?: string): DcChart;
  export function deregisterChart(chart: DcChart): void;
}

declare module "dygraphs" {
  export default class Dygraph {
    constructor(el: HTMLElement, data: unknown, options?: Record<string, unknown>);
    destroy(): void;
    resize(): void;
  }
}
