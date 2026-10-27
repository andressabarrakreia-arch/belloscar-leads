import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { corSetor } from "../../lib/apresentacao/avatar";
import type { ShowPerson } from "../../lib/apresentacao/types";
import { ShowAvatar } from "./ShowAvatar";
import { ShowSharePanel } from "./ShowSharePanel";

type Props = {
  person: ShowPerson;
  periodoLabel: string;
  onClose: () => void;
};

export function ShowPersonModal({ person, periodoLabel, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const hue = corSetor(person.setor);
  const detalhe = person.detalhe ?? { positivos: person.kpis, negativos: [], notas: [] };
  const [shareOpen, setShareOpen] = useState(false);

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
      if (event.key !== "Escape") return;
      if (shareOpen) return;
      event.preventDefault();
      onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, shareOpen]);

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
          <div className="show-modal-toolbar">
            <button
              type="button"
              className="show-modal-share"
              onClick={() => setShareOpen(true)}
              aria-label="Compartilhar no WhatsApp"
              title="Compartilhar no WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
                />
              </svg>
              <span>Compartilhar</span>
            </button>
            <button type="button" className="show-modal-close" onClick={onClose} aria-label="Fechar">
              Fechar
            </button>
          </div>
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

          {shareOpen ? (
            <div className="show-share-layer">
              <ShowSharePanel
                person={person}
                periodoLabel={periodoLabel}
                onClose={() => setShareOpen(false)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
