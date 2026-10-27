/** Iniciais para avatar (fotos entram depois em public/brand/equipe/). */
export function avatarIniciais(nome: string): string {
  const parts = nome
    .trim()
    .split(/\s+/)
    .filter((p) => p && !/^(da|de|do|das|dos|e)$/i.test(p));
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
