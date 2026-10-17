import type { CanalAtendimento, StatusAgendamento, TipoProposta } from "./types";

export function normHeader(h: unknown): string {
  return String(h ?? "")
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

export function isVisitFlag(visita: unknown, status: StatusAgendamento): boolean {
  const v = String(visita ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (v === "sim" || v === "s" || v === "yes" || v === "1") return true;
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
