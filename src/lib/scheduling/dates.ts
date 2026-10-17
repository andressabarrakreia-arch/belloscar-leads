import { excelSerialToDate } from "../dates";

/** Converte valor Excel/string BR/ISO para Date (meio-dia local quando só data). */
export function parseFlexibleDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return excelSerialToDate(value);
  }

  if (typeof value === "string" && value.trim()) {
    const raw = value.trim();

    const br = raw.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s*(?:às|as)?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?)?/i
    );
    if (br) {
      const day = Number(br[1]);
      const month = Number(br[2]) - 1;
      const year = Number(br[3]);
      const hour = br[4] !== undefined ? Number(br[4]) : 12;
      const minute = br[5] !== undefined ? Number(br[5]) : 0;
      const second = br[6] !== undefined ? Number(br[6]) : 0;
      const d = new Date(year, month, day, hour, minute, second);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) {
      const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 12, 0, 0);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    return excelSerialToDate(raw);
  }

  return null;
}

export function toIsoDate(value: unknown): string | null {
  const d = parseFlexibleDate(value);
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Chaves temporais em calendário local (preserva coerência com ISO YYYY-MM-DD). */
export function isoToMonthKey(iso: string): string {
  const d = parseFlexibleDate(iso);
  if (!d) return iso.slice(0, 7);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function isoToPeriodKey(iso: string): string {
  const d = parseFlexibleDate(iso);
  if (!d) return `${iso.slice(0, 7)}-Q1`;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = d.getDate();
  const q = day <= 15 ? "Q1" : "Q2";
  return `${y}-${m}-${q}`;
}
