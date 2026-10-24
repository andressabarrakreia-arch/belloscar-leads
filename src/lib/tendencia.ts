export type Tendencia = "alta" | "baixa" | "estavel";

export function tendenciaDe(atual: number, anterior: number): Tendencia {
  if (!Number.isFinite(atual) || !Number.isFinite(anterior)) return "estavel";
  if (atual > anterior) return "alta";
  if (atual < anterior) return "baixa";
  return "estavel";
}
