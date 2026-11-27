import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ParticleField } from "./components/ParticleField";
import { AppShell } from "./components/shell/AppShell";
import { TemaProvider, TemaToggle } from "./theme";
import { Attendants } from "./pages/Attendants";
import { Compare } from "./pages/Compare";
import { Dashboard } from "./pages/Dashboard";
import { FormLeads } from "./pages/FormLeads";
import { SchedulingDetalhe } from "./pages/agendamentos/SchedulingDetalhe";
import { SchedulingInsucessos } from "./pages/agendamentos/SchedulingInsucessos";
import { SchedulingOverview } from "./pages/agendamentos/SchedulingOverview";
import { SchedulingPortais } from "./pages/agendamentos/SchedulingPortais";
import { SchedulingPreVendas } from "./pages/agendamentos/SchedulingPreVendas";
import { SchedulingShell } from "./pages/agendamentos/SchedulingShell";
import { SchedulingSucessos } from "./pages/agendamentos/SchedulingSucessos";
import { SchedulingVendedores } from "./pages/agendamentos/SchedulingVendedores";
import { NegociacoesComparativo } from "./pages/negociacoes/NegociacoesComparativo";
import { NegociacoesLancamentos } from "./pages/negociacoes/NegociacoesLancamentos";
import { NegociacoesOverview } from "./pages/negociacoes/NegociacoesOverview";
import { NegociacoesShell } from "./pages/negociacoes/NegociacoesShell";
import { NegociacoesVendedores } from "./pages/negociacoes/NegociacoesVendedores";
import { PerfilClientes } from "./pages/perfil/PerfilClientes";
import { IndiceGeral } from "./pages/IndiceGeral";
import { IndiceGestao } from "./pages/IndiceGestao";
import { MapaDoSite } from "./pages/MapaDoSite";
import { ApresentacaoResultados } from "./pages/ApresentacaoResultados";

/**
 * Módulos com rotas e links distintos.
 * Análise de Campanhas: #/campanhas (shell próprio)
 * Agendamentos + Negociações + Perfil + Apresentação + Mapa: shell unificado
 */
function Ambient() {
  const { pathname } = useLocation();
  if (
    pathname === "/" ||
    pathname === "/indice" ||
    pathname === "/mapa" ||
    pathname === "/apresentacao"
  ) {
    return null;
  }
  return <ParticleField />;
}

/** Apresentação e Mapa ficam só escuros — sem botão de tema nessas rotas. */
function TemaToggleNaRota() {
  const { pathname } = useLocation();
  if (pathname === "/apresentacao" || pathname === "/mapa") return null;
  return <TemaToggle />;
}

export default function App() {
  return (
    <TemaProvider>
      <HashRouter>
        <TemaToggleNaRota />
        <Ambient />
        <Routes>
          <Route index element={<IndiceGeral />} />
          <Route path="indice" element={<IndiceGeral />} />
          <Route path="indice/gestao" element={<IndiceGestao />} />
          <Route path="erros" element={<Navigate to="/" replace />} />
          <Route path="agendamentos/erros" element={<Navigate to="/" replace />} />

          <Route path="campanhas" element={<AppShell mode="campanhas" />}>
            <Route index element={<Dashboard />} />
            <Route path="atendentes" element={<Attendants />} />
            <Route path="comparar" element={<Compare />} />
            <Route path="formularios" element={<FormLeads />} />
            <Route path="admin" element={<Navigate to="/indice/gestao" replace />} />
          </Route>

          <Route element={<AppShell mode="unified" />}>
            <Route path="agendamentos" element={<SchedulingShell />}>
              <Route index element={<SchedulingOverview />} />
              <Route path="pre-vendas" element={<SchedulingPreVendas />} />
              <Route path="vendedores" element={<SchedulingVendedores />} />
              <Route path="detalhe" element={<SchedulingDetalhe />} />
              <Route path="portais" element={<SchedulingPortais />} />
              <Route path="sucessos" element={<SchedulingSucessos />} />
              <Route path="insucessos" element={<SchedulingInsucessos />} />
            </Route>
            <Route path="agendamentos/admin" element={<Navigate to="/indice/gestao" replace />} />

            <Route path="negociacoes" element={<NegociacoesShell />}>
              <Route index element={<NegociacoesOverview />} />
              <Route path="lancamentos" element={<NegociacoesLancamentos />} />
              <Route path="vendedores" element={<NegociacoesVendedores />} />
              <Route path="comparativo" element={<NegociacoesComparativo />} />
            </Route>
            <Route path="negociacoes/admin" element={<Navigate to="/indice/gestao" replace />} />

            <Route path="perfil">
              <Route index element={<PerfilClientes />} />
            </Route>

            <Route path="apresentacao" element={<ApresentacaoResultados />} />
            <Route path="mapa" element={<MapaDoSite />} />
          </Route>

          {/* Compatibilidade com links antigos */}
          <Route path="atendentes" element={<Navigate to="/campanhas/atendentes" replace />} />
          <Route path="comparar" element={<Navigate to="/campanhas/comparar" replace />} />
          <Route path="admin" element={<Navigate to="/indice/gestao" replace />} />

          <Route path="*" element={<Navigate to="/campanhas" replace />} />
        </Routes>
      </HashRouter>
    </TemaProvider>
  );
}
