import { useRef, type FocusEvent, type FormEvent, type KeyboardEvent, type MouseEvent, type ReactNode, useState } from "react";

type Props = {
  /** Algum campo saiu do padrão. A aba fica com o fundo vermelho transparente. */
  active?: boolean;
  /** Nome curto, como "filtros" ou "filtros do período". */
  label: string;
  children: ReactNode;
};

function isTextField(target: EventTarget | null): target is HTMLInputElement {
  return target instanceof HTMLInputElement && (target.type === "search" || target.type === "text");
}

/** Aba vertical na borda. O clique abre o filtro. O segundo clique recolhe. */
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
    if (event.key === "Escape") close();
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
        className={`filters-float__peek${active ? " is-active" : ""}`}
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
        Filtro
      </button>
      {open ? (
        <div className="filters-float__panel" onChange={onChange} onKeyDown={onKeyDown} onBlur={onBlur} onClick={onClick}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
