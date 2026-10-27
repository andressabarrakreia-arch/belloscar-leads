/** Iniciais para avatar; fotos em public/brand/equipe/ quando existirem. */
export function avatarIniciais(nome: string): string {
  const parts = nome
    .trim()
    .split(/\s+/)
    .filter((p) => p && !/^(da|de|do|das|dos|e)$/i.test(p));
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Chave normalizada para casar nomes de planilha com arquivos de foto. */
function chaveNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Mapa de trechos do nome → arquivo em public/brand/equipe/.
 * Ordem: mais específico primeiro (ex. gabriel willyan antes de gabriel).
 */
const FOTOS_EQUIPE: { match: RegExp; file: string }[] = [
  { match: /\bsem interesse\b/, file: "lead-sem-interesse.png" },
  { match: /\bespaco bellos\b/, file: "espaco-bellos.png" },
  { match: /\baniversariantes\b/, file: "aniversariantes-belloscar.png" },
  { match: /\bcampanhas meta\b/, file: "campanhas-meta.png" },
  { match: /^agendamentos$/, file: "agendamentos.png" },
  { match: /\bnegociacoes\b.*\bloja\b/, file: "negociacoes-loja.png" },
  { match: /\bsem sdr\b/, file: "sem-sdr.png" },
  { match: /^recepcao$/, file: "recepcao.png" },
  { match: /\bthayna\b/, file: "thayna.png" },
  { match: /\bmatheus\b.*\bimbroinise\b|\bimbroinise\b/, file: "matheus-imbroinise.png" },
  { match: /\ballan\b/, file: "allan-junior.png" },
  { match: /\blais\b/, file: "lais-narima.png" },
  { match: /\bliriane\b/, file: "liriane-larissa.png" },
  { match: /\bgabriel\b.*\bwillyan\b|\bwillyan\b/, file: "gabriel-willyan.png" },
  { match: /\bgabriel\b.*\bvendas\b|\bgabriel vendas\b/, file: "gabriel-vendas.png" },
  { match: /\bfilipe\b/, file: "filipe-portes.png" },
  { match: /\banderson\b/, file: "anderson-pires.png" },
  { match: /\bmarcia\b/, file: "marcia.png" },
  { match: /\bdimas\b/, file: "dimas-noldin.png" },
  { match: /\bewerton\b/, file: "ewerton-rocha.png" },
  { match: /\bandressa\b/, file: "andressa-kreia.png" },
  { match: /\bcelso\b/, file: "celso-fofo.png" },
  { match: /\bbruno\b/, file: "bruno-prospeccao.png" },
  { match: /\bana dal\b|\bana\b.*\bdal bello\b/, file: "ana-dal-bello.png" },
  { match: /\bsilvan\b/, file: "silvan-dal-bello.png" },
  { match: /\bmarquinhos\b/, file: "marquinhos.png" },
  { match: /\bsibele\b/, file: "sibele-baranhuk.png" },
];

/** URL da foto da pessoa, se houver arquivo mapeado. */
export function fotoEquipe(nome: string): string | null {
  const key = chaveNome(nome);
  const hit = FOTOS_EQUIPE.find((item) => item.match.test(key));
  if (!hit) return null;
  return `${import.meta.env.BASE_URL}brand/equipe/${hit.file}`;
}

/** Logos / artes coletivas usam contain em vez de cover. */
export function isLogoEquipe(nome: string): boolean {
  const key = chaveNome(nome);
  return (
    /\bsem interesse\b/.test(key) ||
    /\bespaco bellos\b/.test(key) ||
    /\baniversariantes\b/.test(key) ||
    /\bcampanhas meta\b/.test(key) ||
    key === "agendamentos" ||
    /\bnegociacoes\b.*\bloja\b/.test(key) ||
    /\bsem sdr\b/.test(key) ||
    key === "recepcao"
  );
}

export type SetorId = "coletivo" | "prevenda" | "campanhas" | "vendedores" | "loja";

const SETOR_HUE: Record<SetorId, string> = {
  coletivo: "#c02026",
  prevenda: "#3d9aad",
  campanhas: "#6b8cae",
  vendedores: "#e0a24a",
  loja: "#8f6bb8",
};

export function corSetor(setor: SetorId): string {
  return SETOR_HUE[setor];
}
