import { NavLink, Outlet } from "react-router-dom";

export function Layout({ readOnly = false }: { readOnly?: boolean }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <h1>Belloscar Leads</h1>
          <span>Análise de campanhas · somente leitura para a equipe</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/atendentes">Atendentes</NavLink>
          <NavLink to="/comparar">Comparar</NavLink>
          {!readOnly && (
            <NavLink to="/admin" className="muted">
              Gestão
            </NavLink>
          )}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
