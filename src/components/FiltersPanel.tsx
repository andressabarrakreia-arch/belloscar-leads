import { useEffect, useRef, useState, type FocusEvent, type FormEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

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

/** Ícone flutuante. Entra na tela, se recolhe sozinho e deixa uma aba “Filtro” na borda. */
export function FiltersPanel({ active = false, label, children }: Props) {
  const [open, setOpen] = useState(false);
  const [tucked, setTucked] = useState(true);
  const [entered, setEntered] = useState(false);
  const skipBlur = useRef(false);
  const openRef = useRef(false);
  openRef.current = open;

  useEffect(() => {
    const enter = window.setTimeout(() => {
      setTucked(false);
      setEntered(true);
    }, 280);
    return () => window.clearTimeout(enter);
  }, []);

  useEffect(() => {
    if (!entered || open) {
      if (open) setTucked(false);
      return;
    }
    const hide = window.setTimeout(() => setTucked(true), 1600);
    return () => window.clearTimeout(hide);
  }, [entered, open]);

  useEffect(() => {
    function onScroll() {
      if (openRef.current) return;
      setTucked(true);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <div className={`filters-float${open ? " is-open" : ""}${tucked && !open ? " is-tucked" : ""}`}>
      <button
        type="button"
        className={`filters-float__peek${active ? " is-active" : ""}`}
        aria-label={`Mostrar ${label}`}
        tabIndex={tucked && !open ? 0 : -1}
        onClick={() => {
          setTucked(false);
          setOpen(true);
        }}
      >
        Filtro
      </button>
      <button
        type="button"
        className={`filters-float__toggle${active ? " is-active" : ""}`}
        aria-expanded={open}
        aria-label={open ? `Recolher ${label}` : `Abrir ${label}`}
        tabIndex={tucked && !open ? -1 : 0}
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
