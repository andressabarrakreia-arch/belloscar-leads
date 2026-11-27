import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ModuleTickerProvider } from "../../context/ModuleTickerContext";
import { KeyTicker } from "../KeyTicker";
import { MetriCarLogo } from "../MetriCarLogo";
import { SiteCredit } from "../SiteCredit";
import {
  navForMode,
  resolvePageChrome,
  type ShellMode,
  type ShellNavGroup,
  type ShellNavItem,
} from "./navConfig";

type Props = {
  mode: ShellMode;
};

function isGroup(item: ShellNavItem): item is ShellNavGroup {
  return item.kind === "group";
}

function pathInGroup(pathname: string, group: ShellNavGroup): boolean {
  return pathname === group.basePath || pathname.startsWith(`${group.basePath}/`);
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`shell-chevron${open ? " is-open" : ""}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function AppShell({ mode }: Props) {
  const { pathname } = useLocation();
  const chrome = useMemo(() => resolvePageChrome(pathname, mode), [pathname, mode]);
  const items = useMemo(() => navForMode(mode), [mode]);
  const immersive =
    chrome.moduleId === "mapa" || chrome.moduleId === "apresentacao";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const item of navForMode(mode)) {
      if (isGroup(item) && pathInGroup(pathname, item)) init[item.id] = true;
    }
    return init;
  });

  useEffect(() => {
    document.title = `BellosCar · ${chrome.eyebrow} · ${chrome.title}`;
  }, [chrome.eyebrow, chrome.title]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const item of items) {
        if (isGroup(item) && pathInGroup(pathname, item)) {
          next[item.id] = true;
        }
      }
      return next;
    });
  }, [pathname, items]);

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const sidebar = (
    <aside className="shell-sidebar" aria-label="Navegação principal">
      <div className="shell-brand">
        <Link to="/" className="shell-brand-link" onClick={() => setMobileOpen(false)}>
          <MetriCarLogo className="shell-brand-logo" force="dark" />
          <div className="shell-brand-text">
            <span className="shell-brand-name">
              Bellos<span>Car</span>
            </span>
            <span className="shell-brand-tag">
              {mode === "campanhas" ? "Análise de Campanhas" : "Análise de Resultados"}
            </span>
          </div>
        </Link>
      </div>

      <nav className="shell-nav">
        {items.map((item) => {
          if (item.kind === "leaf") {
            return (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `shell-nav-link${isActive ? " is-active" : ""}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.label}</span>
                <span className="shell-nav-dot" aria-hidden="true" />
              </NavLink>
            );
          }

          const open = openGroups[item.id] ?? pathInGroup(pathname, item);
          return (
            <div key={item.id} className="shell-nav-group">
              <button
                type="button"
                className={`shell-nav-group-btn${pathInGroup(pathname, item) ? " is-current" : ""}`}
                aria-expanded={open}
                onClick={() => toggleGroup(item.id)}
              >
                <span>{item.label}</span>
                <Chevron open={open} />
              </button>
              {open ? (
                <div className="shell-nav-children">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end={child.end}
                      className={({ isActive }) =>
                        `shell-nav-link shell-nav-link--child${isActive ? " is-active" : ""}`
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{child.label}</span>
                      <span className="shell-nav-dot" aria-hidden="true" />
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="shell-sidebar-footer">
        {mode === "campanhas" ? (
          <Link to="/agendamentos" className="shell-side-cta" onClick={() => setMobileOpen(false)}>
            Ir para Agendamentos / Negociações
          </Link>
        ) : (
          <Link to="/campanhas" className="shell-side-cta" onClick={() => setMobileOpen(false)}>
            Ir para Análise de Campanhas
          </Link>
        )}
        <Link to="/" className="shell-side-link" onClick={() => setMobileOpen(false)}>
          Índice Geral
        </Link>
        <div className="shell-status-pill" title="BellosCar">
          <span className="shell-status-pulse" aria-hidden="true" />
          BellosCar online
        </div>
      </div>
    </aside>
  );

  return (
    <ModuleTickerProvider>
      <div className={`shell-root${mobileOpen ? " is-drawer-open" : ""}`}>
        <button
          type="button"
          className="shell-menu-btn"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <MenuIcon open={mobileOpen} />
        </button>

        {mobileOpen ? (
          <button
            type="button"
            className="shell-backdrop"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        {sidebar}

        <div className="shell-main">
          <header className="shell-header">
            <div className="shell-header-titles">
              <p className="shell-eyebrow">{chrome.eyebrow}</p>
              <h1 className="shell-title">{chrome.title}</h1>
            </div>
            <div className="shell-header-meta">
              <span className="shell-loja-pill">BellosCar</span>
            </div>
          </header>

          <div className={`shell-content${immersive ? " shell-content--immersive" : ""}`}>
            {immersive ? null : <KeyTicker moduleId={chrome.moduleId} />}
            <Outlet />
            {immersive ? null : (
              <footer className="shell-page-footer">
                <span>
                  BellosCar · {chrome.eyebrow} · Curitiba
                </span>
                <SiteCredit />
              </footer>
            )}
          </div>
        </div>
      </div>
    </ModuleTickerProvider>
  );
}
