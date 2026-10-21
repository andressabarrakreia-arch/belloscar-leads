import { indexCampanhas } from "./analytics";
import type { SchedulingDataset } from "../scheduling/types";

export type ClienteExport = { nome: string; email: string; telefone: string };

/** Clientes do recorte Facebook e Instagram, cruzados por ID com a agenda. */
export function campanhaClientsForExport(dataset: SchedulingDataset): ClienteExport[] {
  const ids = new Set(indexCampanhas(dataset).map((row) => row.id));
  const map = new Map<string, ClienteExport>();

  const add = (nome: string, email: string, telefone: string) => {
    if (!nome && !email && !telefone) return;
    const key = `${nome}|${telefone}`.toLowerCase();
    const prev = map.get(key);
    if (!prev) {
      map.set(key, { nome, email, telefone });
      return;
    }
    if (!prev.email && email) prev.email = email;
  };

  for (const item of dataset.items) {
    if (!ids.has(item.id)) continue;
    add(item.cliente || "", item.email || "", item.celular || "");
  }
  for (const row of dataset.realizados || []) {
    if (!ids.has(row.id)) continue;
    add(row.cliente || "", "", row.celular || "");
  }
  for (const row of dataset.sucessosEventos || []) {
    if (!ids.has(row.id)) continue;
    add(row.cliente || "", "", row.celular || "");
  }

  return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
