export function excelSerialToDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = Math.round((value - 25569) * 86400 * 1000);
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function monthKeyFromDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function periodKeyFromDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = d.getUTCDate();
  const q = day <= 15 ? "Q1" : "Q2";
  return `${y}-${m}-${q}`;
}

export function formatPeriodLabel(periodKey: string): string {
  const match = periodKey.match(/^(\d{4})-(\d{2})-Q([12])$/);
  if (!match) return periodKey;
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  const monthName = months[Number(match[2]) - 1] || match[2];
  const half = match[3] === "1" ? "1–15" : "16–fim";
  return `${monthName}/${match[1]} (${half})`;
}
