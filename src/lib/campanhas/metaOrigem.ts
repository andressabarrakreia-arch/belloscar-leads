/**
 * Universo da página Campanhas: só origem Facebook / Instagram
 * (e Ads), inclusive quando a célula traz canal junto (`WhatsApp | Instagram Ads`).
 * A decisão é a coluna Origem do LEADS GERAL (recebidos). O restante cruza por ID.
 */

export const META_CANAIS = ["Facebook", "Facebook Ads", "Instagram", "Instagram Ads"] as const;

export type MetaCanal = (typeof META_CANAIS)[number];

const META_LABEL: Record<string, MetaCanal> = {
  facebook: "Facebook",
  "facebook ads": "Facebook Ads",
  instagram: "Instagram",
  "instagram ads": "Instagram Ads",
};

function normalizeToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Tokens Meta presentes na origem, na ordem da célula. Vazio = fora de Campanhas. */
export function metaTokensInOrigem(raw: string): MetaCanal[] {
  const parts = (raw || "")
    .split("|")
    .map((p) => normalizeToken(p))
    .filter(Boolean);
  const found: MetaCanal[] = [];
  for (const part of parts) {
    const label = META_LABEL[part];
    if (label && !found.includes(label)) found.push(label);
  }
  return found;
}

export function isMetaCampaignOrigem(raw: string): boolean {
  return metaTokensInOrigem(raw).length > 0;
}
