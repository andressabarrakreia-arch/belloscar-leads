/**
 * Universo da página Campanhas: só Facebook Ads e Instagram Ads.
 * Organico puro ("Facebook" / "Instagram" sozinhos) fica de fora.
 * Canal junto continua valendo (ex.: `WhatsApp | Instagram Ads`).
 * A decisão é a coluna Origem do LEADS GERAL. O restante cruza por ID.
 */

export const META_CANAIS = ["Facebook Ads", "Instagram Ads"] as const;

export type MetaCanal = (typeof META_CANAIS)[number];

const META_ADS_LABEL: Record<string, MetaCanal> = {
  "facebook ads": "Facebook Ads",
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

/**
 * Tokens Ads presentes na origem, na ordem da célula.
 * Vazio = fora de Campanhas (inclui Facebook/Instagram organico sem Ads).
 */
export function metaTokensInOrigem(raw: string): MetaCanal[] {
  const parts = (raw || "")
    .split("|")
    .map((p) => normalizeToken(p))
    .filter(Boolean);
  const found: MetaCanal[] = [];
  for (const part of parts) {
    const label = META_ADS_LABEL[part];
    if (label && !found.includes(label)) found.push(label);
  }
  return found;
}

export function isMetaCampaignOrigem(raw: string): boolean {
  return metaTokensInOrigem(raw).length > 0;
}
