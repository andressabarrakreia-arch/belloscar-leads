import { useRef, useState, type FocusEvent, type FormEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

type Props = {
  /** Algum campo saiu do padrão. O ícone fica com o fundo vermelho transparente. */
  active?: boolean;
  /** Nome curto, como "filtros" ou "filtros do período". */
  label: string;
  children: ReactNode;
};

function isTextField(target: EventTarget | null): target is HTMLInputElement {
  return target instanceof HTMLInputElement && (target.type === "search" || target.type === "text");
}

/** Ícone flutuante no topo da página. A barra abre no clique e recolhe ao filtrar ou limpar. */
export function FiltersPanel({ active = false, label, children }: Props) {
  const [open, setOpen] = useState(false);
  const skipBlur = useRef(false);

  function close() {
    setOpen(false);
  }

  function onChange(event: FormEvent<HTMLDivElement>) {
    if (isTextField(event.target)) return;
    close();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && isTextField(event.target)) close();
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (skipBlur.current) {
      skipBlur.current = false;
      return;
    }
    if (!isTextField(event.target)) return;
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    close();
  }

  function onClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (target instanceof Element && target.closest("button")) close();
  }

  return (
    <div className={`filters-float${open ? " is-open" : ""}`}>
      <button
        type="button"
        className={`filters-float__toggle${active ? " is-active" : ""}`}
        aria-expanded={open}
        aria-label={open ? `Recolher ${label}` : `Abrir ${label}`}
        onMouseDown={() => {
          skipBlur.current = true;
        }}
        onClick={() => {
          skipBlur.current = false;
          setOpen((value) => !value);
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 5h16l-6.2 7.2V19l-3.6-1.8v-5L4 5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <div className="filters-float__panel" onChange={onChange} onKeyDown={onKeyDown} onBlur={onBlur} onClick={onClick}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
