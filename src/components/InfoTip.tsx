import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  label?: string;
};

/** Definição sob demanda: o texto só aparece ao passar o mouse ou focar o ícone. */
export function InfoTip({ children, label = "Ver definição" }: Props) {
  return (
    <span className="info-tip">
      <button type="button" className="info-tip-btn" aria-label={label}>
        i
      </button>
      <span className="info-tip-bubble" role="tooltip">
        {children}
      </span>
    </span>
  );
}
