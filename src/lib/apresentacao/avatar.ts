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

/** Mapa de trechos do nome → arquivo em public/brand/equipe/. */
const FOTOS_EQUIPE: { match: RegExp; file: string }[] = [
  { match: /\bthayna\b/, file: "thayna.png" },
];

/** URL da foto da pessoa, se houver arquivo mapeado. */
export function fotoEquipe(nome: string): string | null {
  const key = chaveNome(nome);
  const hit = FOTOS_EQUIPE.find((item) => item.match.test(key));
  if (!hit) return null;
  return `${import.meta.env.BASE_URL}brand/equipe/${hit.file}`;
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
