type Props = {
  onClick: () => void;
};

/** Botão compacto, alinhado à base dos campos da barra `.filters`. */
export function ClearFiltersButton({ onClick }: Props) {
  return (
    <div className="filters__clear">
      <button type="button" className="filters__clear-btn" onClick={onClick}>
        Limpar filtros
      </button>
    </div>
  );
}

/** Classe do controle quando o filtro saiu do valor padrão. */
export function filterActiveClass(active: boolean): string | undefined {
  return active ? "is-active" : undefined;
}
