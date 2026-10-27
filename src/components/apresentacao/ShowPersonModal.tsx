import { useEffect, useRef } from "react";
import gsap from "gsap";
import { avatarIniciais, corSetor } from "../../lib/apresentacao/avatar";
import type { ShowPerson } from "../../lib/apresentacao/types";

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
        { opacity: 0, scale: 0.92, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power2.out" }
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
        <button type="button" className="show-modal-close" onClick={onClose} aria-label="Fechar">
          ×
        </button>
        <div className="show-modal-hero">
          <div className="show-avatar show-avatar--lg" aria-hidden="true">
            {avatarIniciais(person.nome)}
          </div>
          <div>
            <p className="show-role">{person.cargo}</p>
            <h2 id="show-modal-title">{person.nome}</h2>
            <p className="show-modal-period">{periodoLabel}</p>
          </div>
        </div>

        <div className="show-modal-cols">
          <section className="show-modal-block show-modal-block--ok">
            <h3>Performance positiva</h3>
            <dl>
              {detalhe.positivos.map((kpi) => (
                <div key={`ok-${kpi.label}`}>
                  <dt>{kpi.label}</dt>
                  <dd>{kpi.value}</dd>
                </div>
              ))}
            </dl>
            {detalhe.positivos.length === 0 ? <p className="muted">Sem destaques neste período.</p> : null}
          </section>
          <section className="show-modal-block show-modal-block--bad">
            <h3>Atenção / negativo</h3>
            <dl>
              {detalhe.negativos.map((kpi) => (
                <div key={`bad-${kpi.label}`}>
                  <dt>{kpi.label}</dt>
                  <dd>{kpi.value}</dd>
                </div>
              ))}
            </dl>
            {detalhe.negativos.length === 0 ? (
              <p className="muted">Nenhum alerta forte neste período.</p>
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
  );
}
