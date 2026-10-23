import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ModuleTickerProvider } from "../context/ModuleTickerContext";
import type { AppModule } from "../modules/registry";
import { InfoTip } from "./InfoTip";
import { KeyTicker } from "./KeyTicker";
import { SiteCredit } from "./SiteCredit";

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
        <header className="sticky top-0 z-20 mb-4 rounded-lg border border-border bg-white/95 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <img className="h-14 w-auto max-w-[140px] object-contain" src={brandLogo} alt="Andressa Car Metrics" />
              <div className="min-w-0">
                <p className="font-display text-lg font-extrabold leading-none text-foreground">
                  Bellos<span className="text-primary">Car</span>
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{module.name}</span>
                  <InfoTip>{module.tagline}</InfoTip>
                </p>
              </div>
            </div>
            <nav className="nav" aria-label={`Navegação · ${module.name}`}>
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
        <KeyTicker moduleId={module.id} />
        <Outlet />
        <footer className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-4 text-sm text-muted-foreground">
          <span>BellosCar · {module.name} · Curitiba</span>
          <SiteCredit />
        </footer>
      </div>
    </ModuleTickerProvider>
  );
}
