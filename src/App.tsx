import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ModuleLayout } from "./components/ModuleLayout";
import { ParticleField } from "./components/ParticleField";
import { AGENDAMENTOS, CAMPANHAS, NEGOCIACOES } from "./modules/registry";
import { Admin } from "./pages/Admin";
import { Attendants } from "./pages/Attendants";
import { Compare } from "./pages/Compare";
import { Dashboard } from "./pages/Dashboard";
import { SchedulingAdmin } from "./pages/agendamentos/SchedulingAdmin";
import { SchedulingDetalhe } from "./pages/agendamentos/SchedulingDetalhe";
import { SchedulingInsucessos } from "./pages/agendamentos/SchedulingInsucessos";
import { SchedulingOverview } from "./pages/agendamentos/SchedulingOverview";
import { SchedulingPortais } from "./pages/agendamentos/SchedulingPortais";
import { SchedulingPreVendas } from "./pages/agendamentos/SchedulingPreVendas";
import { SchedulingShell } from "./pages/agendamentos/SchedulingShell";
import { SchedulingVendedores } from "./pages/agendamentos/SchedulingVendedores";
import { NegociacoesAdmin } from "./pages/negociacoes/NegociacoesAdmin";
import { NegociacoesLancamentos } from "./pages/negociacoes/NegociacoesLancamentos";
import { NegociacoesOverview } from "./pages/negociacoes/NegociacoesOverview";
import { NegociacoesShell } from "./pages/negociacoes/NegociacoesShell";
import { NegociacoesVendedores } from "./pages/negociacoes/NegociacoesVendedores";
import { IndiceGeral } from "./pages/IndiceGeral";
import { IndiceGestao } from "./pages/IndiceGestao";

/**
 * Módulos com rotas e links distintos.
 * Análise de Campanhas: #/campanhas
 * Análise de Agendamentos: #/agendamentos
 * Análise de Negociações: #/negociacoes
 */
function Ambient() {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname === "/indice") return null;
  return <ParticleField />;
}

export default function App() {
  return (
    <HashRouter>
      <Ambient />
      <Routes>
        <Route index element={<IndiceGeral />} />
        <Route path="indice" element={<IndiceGeral />} />
        <Route path="indice/gestao" element={<IndiceGestao />} />

        <Route path="campanhas" element={<ModuleLayout module={CAMPANHAS} />}>
          <Route index element={<Dashboard />} />
          <Route path="atendentes" element={<Attendants />} />
          <Route path="comparar" element={<Compare />} />
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route path="agendamentos" element={<ModuleLayout module={AGENDAMENTOS} />}>
          <Route element={<SchedulingShell />}>
            <Route index element={<SchedulingOverview />} />
            <Route path="pre-vendas" element={<SchedulingPreVendas />} />
            <Route path="vendedores" element={<SchedulingVendedores />} />
            <Route path="detalhe" element={<SchedulingDetalhe />} />
            <Route path="portais" element={<SchedulingPortais />} />
            <Route path="insucessos" element={<SchedulingInsucessos />} />
          </Route>
          <Route path="admin" element={<SchedulingAdmin />} />
        </Route>

        <Route path="negociacoes" element={<ModuleLayout module={NEGOCIACOES} />}>
          <Route element={<NegociacoesShell />}>
            <Route index element={<NegociacoesOverview />} />
            <Route path="lancamentos" element={<NegociacoesLancamentos />} />
            <Route path="vendedores" element={<NegociacoesVendedores />} />
          </Route>
          <Route path="admin" element={<NegociacoesAdmin />} />
        </Route>

        {/* Compatibilidade com links antigos */}
        <Route path="atendentes" element={<Navigate to="/campanhas/atendentes" replace />} />
        <Route path="comparar" element={<Navigate to="/campanhas/comparar" replace />} />
        <Route path="admin" element={<Navigate to="/campanhas/admin" replace />} />

        <Route path="*" element={<Navigate to="/campanhas" replace />} />
      </Routes>
    </HashRouter>
  );
}
