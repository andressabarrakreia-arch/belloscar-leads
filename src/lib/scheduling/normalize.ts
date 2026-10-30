import type { CanalAtendimento, StatusAgendamento, TipoProposta } from "./types";

/**
 * CSV UTF-8 às vezes chega como Latin-1 (ex.: ResponsÃ¡vel).
 * Reinterpreta bytes Latin-1 como UTF-8 quando parece mojibake.
 */
export function repairUtf8Mojibake(raw: string): string {
  if (!/[ÃÂ]/.test(raw)) return raw;
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    if (code > 255) return raw;
    bytes[i] = code;
  }
  try {
    const decoded = new TextDecoder("utf-8").decode(bytes);
    if (decoded.includes("\uFFFD")) return raw;
    return decoded;
  } catch {
    return raw;
  }
}

export function normHeader(h: unknown): string {
  return repairUtf8Mojibake(String(h ?? ""))
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeId(raw: unknown): string {
  let s = String(raw ?? "").trim();
  if (!s) return "";
  if (s.startsWith("#")) s = s.slice(1);
  // Excel às vezes entrega número
  if (/^\d+\.0+$/.test(s)) s = s.replace(/\.0+$/, "");
  return s;
}

export function normalizeTipoProposta(raw: unknown): TipoProposta {
  const t = String(raw ?? "").trim();
  if (!t) return "não informado(celulas em branco)";
  const n = t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (n === "compra") return "Compra";
  if (n === "venda") return "Venda";
  if (n === "troca") return "Troca";
  if (n === "consignacao") return "Consignação";
  if (n === "financiamento") return "Financiamento";
  // Mantém label original capitalizada se desconhecida, mas tipamos como não informado só para vazio
  if (n.includes("financi")) return "Financiamento";
  return "não informado(celulas em branco)";
}

export function normalizeStatus(raw: unknown): StatusAgendamento {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (s.startsWith("sucesso")) return "Sucesso";
  if (s === "visita") return "Visita";
  if (s === "agendado") return "Agendado";
  if (s === "insucesso") return "Insucesso";
  if (s.includes("sucesso")) return "Sucesso";
  return "Agendado";
}

/** Só o campo Visita (Sim/Não) — usado em REALIZADOS. */
export function isVisitYesNo(visita: unknown): boolean {
  const v = String(visita ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return v === "sim" || v === "s" || v === "yes" || v === "1" || v === "true";
}

export function isVisitFlag(visita: unknown, status: StatusAgendamento): boolean {
  if (isVisitYesNo(visita)) return true;
  if (status === "Visita" || status === "Sucesso") return true;
  return false;
}

/** Recepção = nomes Recepção ou Gabriela (regra de negócio). */
export function isRecepcaoName(name: string): boolean {
  const n = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!n) return false;
  if (n === "recepcao" || n.includes("recepcao")) return true;
  if (n === "gabriela" || n.startsWith("gabriela ")) return true;
  return false;
}

export function canalFromSdr(sdr: string): CanalAtendimento {
  return isRecepcaoName(sdr) ? "Recepção" : "Pré-Venda";
}

/** Pendente / Descartado não entram em atendimento de ninguém. */
export function statusForaDoAtendimento(value: string | undefined): boolean {
  const text = (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return text === "pendente" || text === "descartado";
}

export function emptyPropostasBreakdown(): Record<TipoProposta, number> {
  return {
    Compra: 0,
    Venda: 0,
    Troca: 0,
    Consignação: 0,
    Financiamento: 0,
    "não informado(celulas em branco)": 0,
  };
}
