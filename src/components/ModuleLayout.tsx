import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ModuleTickerProvider } from "../context/ModuleTickerContext";
import type { AppModule } from "../modules/registry";
import { InfoTip } from "./InfoTip";
import { KeyTicker } from "./KeyTicker";

const brandLogo = `${import.meta.env.BASE_URL}brand/acm-logo.png?v=2`;
const HUB_TITLE = "Análise de Resultados";

type Props = {
  module: AppModule;
  /** Se false, oculta itens adminOnly do menu (link da equipe) */
  showAdminNav?: boolean;
};

export function ModuleLayout({ module, showAdminNav = true }: Props) {
  const navItems = module.nav.filter((item) => showAdminNav || !item.adminOnly);

  useEffect(() => {
    document.title = `BellosCar · ${module.name}`;
    return () => {
      document.title = `BellosCar · ${HUB_TITLE}`;
    };
  }, [module.name]);

  return (
    <ModuleTickerProvider>
      <div className="app-shell">
        <header className="topbar">
          <div className="brand">
            <img className="brand-logo" src={brandLogo} alt="Andressa Car Metrics" />
            <div className="brand-text">
              <h1>
                Bellos<span className="car">Car</span>
              </h1>
              <span className="brand-module-row">
                <span>{module.name}</span>
                <InfoTip>{module.tagline}</InfoTip>
              </span>
            </div>
          </div>
          <nav className="nav" aria-label={`Navegação · ${module.name}`}>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <KeyTicker moduleId={module.id} />
        <Outlet />
        <footer className="page-footer">
          <span>
            BellosCar · {module.name} · Curitiba
          </span>
          <span className="checkered" aria-hidden="true" />
        </footer>
      </div>
    </ModuleTickerProvider>
  );
}
