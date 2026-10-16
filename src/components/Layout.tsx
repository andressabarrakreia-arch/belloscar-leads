import { NavLink, Outlet } from "react-router-dom";
import { KeyTicker } from "./KeyTicker";

const brandIcon = `${import.meta.env.BASE_URL}brand/bc-icon.png`;

export function Layout({ readOnly = false }: { readOnly?: boolean }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img className="brand-mark" src={brandIcon} alt="BellosCar" width={52} height={52} />
          <div className="brand-text">
            <h1>
              Bellos<span className="car">Car</span> Leads
            </h1>
            <span>Veículos seminovos e usados · análise de campanhas</span>
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/atendentes">Atendentes</NavLink>
          <NavLink to="/comparar">Comparar</NavLink>
          {!readOnly && <NavLink to="/admin">Gestão</NavLink>}
        </nav>
      </header>
      <KeyTicker />
      <Outlet />
      <footer className="page-footer">
        <span>BellosCar · Espaço Bello&apos;s · Curitiba</span>
        <span className="checkered" aria-hidden="true" />
      </footer>
    </div>
  );
}
