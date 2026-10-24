import type { Tendencia } from "../lib/tendencia";

const CAMINHO = {
  alta: "M6 2.2 10.2 8.2H1.8z",
  baixa: "M6 9.8 1.8 3.8h8.4z",
} as const;

/** Seta ou traço ao lado do número: alta, baixa ou o valor se manteve. */
export function SinalTendencia({
  tendencia,
  sobeAjuda,
  contra,
}: {
  tendencia: Tendencia | null;
  sobeAjuda: boolean;
  contra: string;
}) {
  if (!tendencia) return null;
  const favoravel = tendencia === "alta" ? sobeAjuda : !sobeAjuda;
  const tom = tendencia === "estavel" ? "neutra" : favoravel ? "boa" : "ruim";
  const verbo = tendencia === "alta" ? "Alta" : tendencia === "baixa" ? "Baixa" : "Manteve";
  const legenda = `${verbo} ${contra}`;
  return (
    <span className={`sinal-tendencia is-${tom}`} title={legenda} aria-label={legenda}>
      {tendencia === "estavel" ? (
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 6h8" />
        </svg>
      ) : (
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d={CAMINHO[tendencia]} />
        </svg>
      )}
    </span>
  );
}
