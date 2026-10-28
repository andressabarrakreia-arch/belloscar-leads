/**
 * Parse de origem bruta (planilha) → origem(ns) de portal + canal(is) de chegada.
 *
 * Regra: tokens separados por "|" (e também misturados no mesmo texto, ex. "whatsapp site").
 * - Canais (quando há outra palavra): WhatsApp, Telefone, Site
 * - Canais fixos extras: Passante, Outdoor, ML*
 * - Site é dual: vira canal se já houver portal; senão vira origem (ex.: WhatsApp | Site)
 * - Demais tokens = origem/portal
 * - Só canal puro (ex.: "WhatsApp") → origem e canal iguais
 * - Uma origem principal (primeira); todos os canais da célula entram
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

/** Palavras de canal/dual a separar quando coladas no mesmo texto (maior → menor). */
const PEELABLE_CHANNEL_ATOMS = [
  "ml financiamento",
  "ml ligacao",
  "ml whatsapp",
  "whatsapp",
  "telefone",
  "passante",
  "outdoor",
  "site",
];

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
  "carteira prospeccao": "Carteira Prospecção",
  indicacao: "Indicação",
  prospeccao: "Prospecção",
  "busca ativa": "Busca Ativa",
  "link auto": "LINK AUTO",
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

/**
 * Separa canais colados no mesmo texto sem "|".
 * Ex.: "whatsapp site" → ["whatsapp", "site"]; "olx whatsapp" → ["olx", "whatsapp"].
 * Labels canônicos inteiros (ex.: "carteira prospeccao") não são quebrados.
 */
function expandMixedPart(part: string): string[] {
  const key = normalizeToken(part);
  if (!key) return [];
  if (DISPLAY_BY_KEY[key]) return [key];

  let padded = ` ${key} `;
  const found: { atom: string; idx: number }[] = [];

  for (const atom of PEELABLE_CHANNEL_ATOMS) {
    let searchFrom = 0;
    while (true) {
      const idx = padded.indexOf(` ${atom} `, searchFrom);
      if (idx < 0) break;
      found.push({ atom, idx });
      padded =
        padded.slice(0, idx + 1) +
        " ".repeat(atom.length) +
        padded.slice(idx + 1 + atom.length);
      searchFrom = idx + 1;
    }
  }

  if (found.length === 0) return [key];

  const rest = padded.replace(/\s+/g, " ").trim();
  found.sort((a, b) => a.idx - b.idx);
  const out: string[] = [];
  if (rest) out.push(rest);
  for (const f of found) out.push(f.atom);
  return out;
}

export function parseOrigemRaw(raw: string): ParsedOrigem {
  const cleaned = (raw || "").trim() || "Não informado";
  const parts = cleaned
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap(expandMixedPart);

  if (parts.length === 0) {
    return { raw: cleaned, origins: ["Não informado"], channels: [] };
  }

  const portalParts = parts.filter((p) => !isChannelOnly(p) && !isDual(p));
  const channelParts = parts.filter((p) => isChannelOnly(p));
  const dualParts = parts.filter((p) => isDual(p));

  let origins: string[];
  let channels: string[];

  if (portalParts.length > 0) {
    // Ex.: WhatsApp | Site | Carteira → origem Carteira, canais WhatsApp + Site
    origins = portalParts.map(canonicalLabel);
    channels = parts
      .filter((p) => isChannelOnly(p) || isDual(p))
      .map(canonicalLabel);
  } else if (dualParts.length > 0) {
    // Ex.: WhatsApp | Site / "whatsapp site" → origem Site, canal WhatsApp
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

  // Dedup preservando ordem. Uma origem principal; todos os canais da célula.
  const uniq = (list: string[]) => [...new Set(list)];
  const originsUniq = uniq(origins);
  const channelsUniq = uniq(channels);
  return {
    raw: cleaned,
    origins: originsUniq.length > 0 ? [originsUniq[0]] : ["Não informado"],
    channels: channelsUniq,
  };
}

export type PortalGroupId =
  | "meta"
  | "classificados"
  | "link_auto"
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
  { id: "link_auto", label: "LINK AUTO" },
  { id: "site_google", label: "Site / Google" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "relacionamento", label: "Carteira & relacionamento" },
  { id: "telefone", label: "Telefone" },
  { id: "loja", label: "Loja" },
  { id: "outros", label: "Outros" },
];

const CLASSIFICADOS_HINTS = [
  "olx",
  "webmotors",
  "chaves na mao",
  "socarrao",
  "mercado livre",
  "usadosbr",
  "marktplace",
  "marketplace",
  "portais de anuncios",
  "na pista",
  "midia vendedores",
  "busca ativa",
];

export function portalGroupIdForOrigin(origin: string): PortalGroupId {
  const key = normalizeToken(origin);

  if (key.includes("link auto")) return "link_auto";

  if (key.includes("facebook") || key.includes("instagram")) {
    return "meta";
  }

  if (CLASSIFICADOS_HINTS.some((hint) => key === hint || key.includes(hint))) {
    return "classificados";
  }

  if (key === "site" || key === "google" || key.includes("google")) {
    return "site_google";
  }

  if (key === "whatsapp") return "whatsapp";

  if (
    key === "carteira" ||
    key.includes("carteira") ||
    key === "indicacao" ||
    key.includes("indicacao") ||
    key === "prospeccao" ||
    key.includes("prospeccao") ||
    key === "aniversariantes" ||
    key.includes("aniversariante")
  ) {
    return "relacionamento";
  }

  if (key === "telefone") return "telefone";
  if (key === "loja") return "loja";
  return "outros";
}
