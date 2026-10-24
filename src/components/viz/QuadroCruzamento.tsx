import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ErroIdLinha, PresencaPlanilha } from "../../lib/scheduling/errosCruzamento";

const PLANILHAS = [
  ["leads", "Leads Geral"],
  ["realizados", "Realizados"],
  ["agenda", "Agenda"],
  ["sucessos", "Sucessos"],
  ["insucessos", "Insucessos"],
] as const;

type PlanilhaId = (typeof PLANILHAS)[number][0];

type Props = {
  linhas: ErroIdLinha[];
  onId: (id: string) => void;
};

function faltas(row: ErroIdLinha): number {
  return PLANILHAS.reduce((total, [id]) => total + (row[id] === "nao" ? 1 : 0), 0);
}

/** Quadro das cinco planilhas: a barra é a falta, o clique leva o ID à busca. */
export function QuadroCruzamento({ linhas, onId }: Props) {
  const reduzido = useReducedMotion();
  const [ativa, setAtiva] = useState<PlanilhaId | null>(null);

  const faixas = useMemo(() => {
    return PLANILHAS.map(([id, label]) => ({
      id,
      label,
      faltas: linhas.reduce((total, row) => total + (row[id] === "nao" ? 1 : 0), 0),
    }));
  }, [linhas]);
  const maior = Math.max(1, ...faixas.map((faixa) => faixa.faltas));
  const recorte = useMemo(() => {
    const base = ativa ? linhas.filter((row) => row[ativa] === "nao") : linhas;
    return [...base].sort((a, b) => faltas(b) - faltas(a) || a.id.localeCompare(b.id)).slice(0, 16);
  }, [ativa, linhas]);
  const nomeAtiva = PLANILHAS.find(([id]) => id === ativa)?.[1];
  const totalRecorte = ativa ? linhas.filter((row) => (row[ativa] as PresencaPlanilha) === "nao").length : linhas.length;

  return (
    <section className="card quadro-cruzamento">
      <h2>Onde a falta se concentra</h2>
      <p className="muted">
        Cada faixa é uma planilha. A barra mostra quantos IDs deste filtro não estão nela. Clique na faixa e depois no
        número para buscar.
      </p>
      <div className="quadro-faixas">
        {faixas.map((faixa) => (
          <button
            key={faixa.id}
            type="button"
            className={ativa === faixa.id ? "quadro-faixa is-on" : "quadro-faixa"}
            aria-pressed={ativa === faixa.id}
            onClick={() => setAtiva((atual) => (atual === faixa.id ? null : faixa.id))}
          >
            <span>{faixa.label}</span>
            <strong>{faixa.faltas.toLocaleString("pt-BR")}</strong>
            <span className="quadro-trilho" aria-hidden="true">
              <span style={{ transform: `scaleX(${faixa.faltas / maior})` }} />
            </span>
          </button>
        ))}
      </div>
      <div className="quadro-ids">
        {recorte.map((row, index) => (
          <motion.button
            key={row.id}
            type="button"
            className="quadro-id"
            initial={reduzido ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={reduzido ? undefined : { y: -2, transition: { delay: 0, duration: 0.16 } }}
            transition={{ duration: 0.28, delay: reduzido ? 0 : Math.min(index, 12) * 0.03 }}
            onClick={() => onId(row.id)}
          >
            <em>{row.id}</em>
            <span>{ativa ? nomeAtiva : row.faltaEm}</span>
          </motion.button>
        ))}
      </div>
      {totalRecorte > recorte.length ? (
        <p className="muted quadro-resto">
          {recorte.length.toLocaleString("pt-BR")} de {totalRecorte.toLocaleString("pt-BR")} IDs neste recorte. O
          restante segue na tabela.
        </p>
      ) : null}
    </section>
  );
}
