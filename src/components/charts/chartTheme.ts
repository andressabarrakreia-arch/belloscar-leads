export const CHART_COLORS = {
  charcoal: "#404041",
  blue: "#2563eb",
  green: "#16a34a",
  red: "#c02026",
  gray: "#929497",
  teal: "#0f766e",
  navy: "#1e3a8a",
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
  background: "#fff",
  border: "1px solid #e4e5e8",
  borderRadius: 10,
  fontSize: 12,
  color: "#404041",
};
