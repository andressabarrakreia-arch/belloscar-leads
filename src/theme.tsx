import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const CHAVE = "belloscar-tema";
export type Tema = "light" | "dark";

type TemaValor = {
  tema: Tema;
  alternar: () => void;
};

const TemaContext = createContext<TemaValor | null>(null);

function temaInicial(): Tema {
  if (typeof document !== "undefined" && document.documentElement.dataset.theme === "dark") return "dark";
  return "light";
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    if (tema === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem(CHAVE, tema);
    } catch {
      /* armazenamento indisponível */
    }
  }, [tema]);

  return (
    <TemaContext.Provider
      value={{
        tema,
        alternar: () => setTema((atual) => (atual === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  const valor = useContext(TemaContext);
  if (!valor) throw new Error("useTema fora do TemaProvider");
  return valor;
}

/** Resolve `var(--token)` para o hex que canvas e bibliotecas conseguem pintar. */
export function tinta(cor: string) {
  const match = cor.match(/^var\((--[\w-]+)\)$/);
  if (!match || typeof document === "undefined") return cor;
  const valor = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return valor || cor;
}

export function TemaToggle() {
  const { tema, alternar } = useTema();
  const escuro = tema === "dark";
  return (
    <button type="button" className="tema-toggle" onClick={alternar} aria-pressed={escuro}>
      {escuro ? "Tema claro" : "Tema escuro"}
    </button>
  );
}
