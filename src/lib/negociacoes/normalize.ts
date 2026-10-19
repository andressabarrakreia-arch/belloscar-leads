import type { TipoNegociacao } from "./types";

export function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Compra de Consignado não entra na base. */
export function isCompraDeConsignado(tipoRaw: string): boolean {
  const key = normalizeKey(tipoRaw);
  return key.includes("compra") && key.includes("consignado");
}

/** Cancelado não conta em KPIs (pode existir na planilha). */
export function isCancelado(status: string): boolean {
  return normalizeKey(status).includes("cancelado");
}

export function normalizeTipoNegociacao(tipoRaw: string): TipoNegociacao {
  const key = normalizeKey(tipoRaw);
  if (key.includes("troca")) return "Troca";
  if (key.includes("consign")) return "Consignação";
  if (key.includes("compra")) return "Compra";
  if (key.includes("venda")) return "Venda";
  return "Outro";
}

export function cellStr(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

export function cellNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = String(value).replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
