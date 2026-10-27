import { useEffect, useRef } from "react";
import gsap from "gsap";
import { corSetor } from "../../lib/apresentacao/avatar";
import type { ShowPerson } from "../../lib/apresentacao/types";
import { ShowAvatar } from "./ShowAvatar";

type Props = {
  person: ShowPerson;
  periodoLabel: string;
  onClose: () => void;
};

export function ShowPersonModal({ person, periodoLabel, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const hue = corSetor(person.setor);
  const detalhe = person.detalhe ?? { positivos: person.kpis, negativos: [], notas: [] };

  useEffect(() => {
    const panel = panelRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (panel && !reduce) {
      gsap.fromTo(
        panel,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="show-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="show-modal-title"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="show-modal-panel"
        style={{ ["--show-accent" as string]: hue }}
        onClick={(e) => e.stopPropagation()}
      >
        <aside className="show-modal-rail" aria-hidden="true">
          <span>Briefing</span>
          <strong>{person.setor}</strong>
        </aside>
        <div className="show-modal-main">
          <button type="button" className="show-modal-close" onClick={onClose} aria-label="Fechar">
            Fechar
          </button>
          <header className="show-modal-hero">
            <ShowAvatar nome={person.nome} size="xl" strikeOnMount />
            <div>
              <p className="show-role">{person.cargo}</p>
              <h2 id="show-modal-title">{person.nome}</h2>
              <p className="show-modal-period">{periodoLabel}</p>
            </div>
          </header>

          <div className="show-modal-cols">
            <section className="show-modal-block">
              <h3>
                <span className="show-modal-mark show-modal-mark--ok" />
                Performance positiva
              </h3>
              <dl>
                {detalhe.positivos.map((kpi) => (
                  <div key={`ok-${kpi.label}`}>
                    <dt>{kpi.label}</dt>
                    <dd>{kpi.value}</dd>
                  </div>
                ))}
              </dl>
              {detalhe.positivos.length === 0 ? (
                <p className="show-modal-empty">Sem destaques neste período.</p>
              ) : null}
            </section>
            <section className="show-modal-block">
              <h3>
                <span className="show-modal-mark show-modal-mark--bad" />
                Atenção
              </h3>
              <dl>
                {detalhe.negativos.map((kpi) => (
                  <div key={`bad-${kpi.label}`}>
                    <dt>{kpi.label}</dt>
                    <dd>{kpi.value}</dd>
                  </div>
                ))}
              </dl>
              {detalhe.negativos.length === 0 ? (
                <p className="show-modal-empty">Nenhum alerta forte neste período.</p>
              ) : null}
            </section>
          </div>

          {detalhe.notas && detalhe.notas.length > 0 ? (
            <ul className="show-modal-notes">
              {detalhe.notas.map((nota) => (
                <li key={nota}>{nota}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
