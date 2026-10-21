import type { NegociacaoLine } from "./types";

/** A planilha da loja traz o nome do cliente, sem e-mail nem telefone. */
export function negociacoesClientsForExport(lines: NegociacaoLine[]) {
  const map = new Map<string, { nome: string; email: string; telefone: string }>();
  for (const line of lines) {
    const nome = line.cliente.trim();
    if (!nome) continue;
    const key = nome.toLowerCase();
    if (!map.has(key)) map.set(key, { nome, email: "", telefone: "" });
  }
  return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
