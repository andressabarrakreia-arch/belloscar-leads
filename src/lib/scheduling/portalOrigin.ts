/**
 * Parse de origem bruta (planilha) → origem(ns) de portal + canal(is) de chegada.
 *
 * Regra: tokens separados por "|".
 * - Canais fixos: WhatsApp, Telefone, Passante, Outdoor, ML*
 * - Site é dual: vira canal se já houver portal; senão vira origem (ex.: WhatsApp | Site)
 * - Demais tokens = origem/portal
 * - Só canal puro (ex.: "WhatsApp") → origem e canal iguais
 * - Cada ID conta uma vez: a primeira origem e o primeiro canal da célula
 */

export type ParsedOrigem = {
  raw: string;
  origins: string[];
  channels: string[];
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

/** Canais que nunca são portal (quando há outro token de origem). */
const CHANNEL_ONLY_KEYS = new Set([
  "whatsapp",
  "telefone",
  "passante",
  "outdoor",
  "ml whatsapp",
  "ml ligacao",
  "ml financiamento",
]);

const DUAL_KEYS = new Set(["site"]);

/** Rótulos canônicos de exibição por chave normalizada. */
const DISPLAY_BY_KEY: Record<string, string> = {
  whatsapp: "WhatsApp",
  site: "Site",
  telefone: "Telefone",
  passante: "Passante",
  outdoor: "Outdoor",
  "ml whatsapp": "ML WhatsApp",
  "ml ligacao": "ML Ligação",
  "ml financiamento": "ML Financiamento",
  olx: "OLX",
  "olx vendedores": "OLX Vendedores",
  "mercado livre": "Mercado Livre",
  socarrao: "SóCarrão",
  "chaves na mao": "Chaves na Mão",
  webmotors: "WebMotors",
  "webmotors vendedores": "WebMotors Vendedores",
  facebook: "Facebook",
  "facebook ads": "Facebook Ads",
  instagram: "Instagram",
  "instagram ads": "Instagram Ads",
  google: "Google",
  carteira: "Carteira",
  indicacao: "Indicação",
  prospeccao: "Prospecção",
  loja: "Loja",
  "na pista": "Na Pista",
  "nao informado": "Não informado",
};

export function canonicalLabel(token: string): string {
  const key = normalizeToken(token);
  if (DISPLAY_BY_KEY[key]) return DISPLAY_BY_KEY[key];
  return token.trim();
}

function isChannelOnly(token: string): boolean {
  return CHANNEL_ONLY_KEYS.has(normalizeToken(token));
}

function isDual(token: string): boolean {
  return DUAL_KEYS.has(normalizeToken(token));
}

export function parseOrigemRaw(raw: string): ParsedOrigem {
  const cleaned = (raw || "").trim() || "Não informado";
  const parts = cleaned
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { raw: cleaned, origins: ["Não informado"], channels: [] };
  }

  const portalParts = parts.filter((p) => !isChannelOnly(p) && !isDual(p));
  const channelParts = parts.filter((p) => isChannelOnly(p));
  const dualParts = parts.filter((p) => isDual(p));

  let origins: string[];
  let channels: string[];

  if (portalParts.length > 0) {
    origins = portalParts.map(canonicalLabel);
    channels = parts
      .filter((p) => isChannelOnly(p) || isDual(p))
      .map(canonicalLabel);
  } else if (dualParts.length > 0) {
    // Ex.: WhatsApp | Site → origem Site, canal WhatsApp
    origins = dualParts.map(canonicalLabel);
    channels =
      channelParts.length > 0
        ? channelParts.map(canonicalLabel)
        : dualParts.map(canonicalLabel);
  } else {
    // Só canais (ex.: WhatsApp) → origem = canal
    origins = channelParts.map(canonicalLabel);
    channels = channelParts.map(canonicalLabel);
  }

  // Dedup preservando ordem. Um ID entra na primeira origem e no primeiro canal.
  const uniq = (list: string[]) => [...new Set(list)];
  const originsUniq = uniq(origins);
  const channelsUniq = uniq(channels);
  return {
    raw: cleaned,
    origins: originsUniq.length > 0 ? [originsUniq[0]] : ["Não informado"],
    channels: channelsUniq.length > 0 ? [channelsUniq[0]] : [],
  };
}

export type PortalGroupId =
  | "meta"
  | "classificados"
  | "site_google"
  | "whatsapp"
  | "relacionamento"
  | "telefone"
  | "loja"
  | "outros";

export type PortalGroupDef = {
  id: PortalGroupId;
  label: string;
};

export const PORTAL_GROUPS: PortalGroupDef[] = [
  { id: "meta", label: "Meta / Social" },
  { id: "classificados", label: "Classificados" },
  { id: "site_google", label: "Site / Google" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "relacionamento", label: "Carteira & relacionamento" },
  { id: "telefone", label: "Telefone" },
  { id: "loja", label: "Loja" },
  { id: "outros", label: "Outros" },
];

export function portalGroupIdForOrigin(origin: string): PortalGroupId {
  const key = normalizeToken(origin);
  if (
    key === "facebook" ||
    key === "facebook ads" ||
    key === "instagram" ||
    key === "instagram ads"
  ) {
    return "meta";
  }
  if (
    key === "olx" ||
    key === "olx vendedores" ||
    key === "webmotors" ||
    key === "webmotors vendedores" ||
    key === "socarrao" ||
    key === "chaves na mao" ||
    key === "mercado livre" ||
    key === "usadosbr" ||
    key === "marktplace vendedores" ||
    key === "portais de anuncios" ||
    key === "na pista" ||
    key === "midia vendedores"
  ) {
    return "classificados";
  }
  if (key === "site" || key === "google") return "site_google";
  if (key === "whatsapp") return "whatsapp";
  if (
    key === "carteira" ||
    key === "indicacao" ||
    key === "prospeccao" ||
    key === "aniversariantes" ||
    key === "busca ativa"
  ) {
    return "relacionamento";
  }
  if (key === "telefone") return "telefone";
  if (key === "loja") return "loja";
  return "outros";
}
