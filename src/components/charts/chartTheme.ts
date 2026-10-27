export const CHART_COLORS = {
  charcoal: "var(--chart-ink)",
  blue: "var(--chart-blue)",
  green: "var(--chart-green)",
  red: "var(--chart-red)",
  gray: "var(--chart-gray)",
  teal: "var(--chart-teal)",
  navy: "var(--chart-navy)",
} as const;

export const CHART_PALETTE = [
  CHART_COLORS.red,
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.charcoal,
  CHART_COLORS.teal,
  CHART_COLORS.gray,
  CHART_COLORS.navy,
];

export const chartTooltipStyle = {
  background: "var(--chart-tip-bg)",
  border: "1px solid var(--chart-tip-line)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--chart-tip-ink)",
};

export const chartCursor = { fill: "var(--chart-cursor)" };
