import { useMemo } from "react";
import { InfoTip } from "../../components/InfoTip";
import { InteractiveTable } from "../../components/InteractiveTable";
import { useSchedulingAnalyticsContext } from "../../context/SchedulingAnalyticsContext";
import { useNegociacoesStore } from "../../hooks/useNegociacoesStore";
import { buildSucessosListaRows } from "../../lib/scheduling/sucessosLista";

function fmtDate(iso: string | null): string {
  if (!iso || iso === "1970-01-01") return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Aba Sucessos — lista do recorte (mês atual por padrão) com veículos da loja. */
export function SchedulingSucessos() {
  const { analytics, dataset } = useSchedulingAnalyticsContext();
  const negociacoes = useNegociacoesStore();

  const rows = useMemo(() => {
    if (!analytics || !dataset) return [];
    return buildSucessosListaRows(analytics.filteredSucessos || [], {
      items: dataset.items,
      realizados: dataset.realizados || [],
      leads: dataset.leadsAtendimentos || [],
      negociacaoLines: negociacoes.dataset?.lines || [],
    });
  }, [analytics, dataset, negociacoes.dataset]);

  if (!analytics || !dataset) return null;

  const comVeiculo = rows.filter((r) => r.veiculoEntrada || r.veiculoSaida).length;

  return (
    <>
      <div className="card">
        <h2>
          Sucessos · lista
          <InfoTip>
            Recorte pelos mesmos filtros do módulo (padrão: mês atual · Finalizado em).
            Responsável = Responsável do ID. Início = Atendido em (senão Criado em / Agendado em).
            Dias = Finalizado em − Início. Veículos vêm das Negociações: o telefone do sucesso
            liga aos nomes na base de agendamentos e cruza com o cliente da loja (a planilha da
            loja não tem telefone). Clique no cabeçalho para ordenar.
          </InfoTip>
        </h2>
        <div className="kpi-grid">
          <div className="kpi-card success">
            <h3>Sucessos</h3>
            <p>{rows.length}</p>
            <small className="muted">Finalizado em · filtro</small>
          </div>
          <div className="kpi-card">
            <h3>Com veículo</h3>
            <p>{comVeiculo}</p>
            <small className="muted">cruzou negociação</small>
          </div>
          <div className="kpi-card">
            <h3>Sem veículo</h3>
            <p>{rows.length - comVeiculo}</p>
            <small className="muted">sem match na loja</small>
          </div>
        </div>
        {negociacoes.loading ? (
          <p className="muted">Carregando base de negociações para o cruzamento de veículos…</p>
        ) : null}
        {negociacoes.error ? <p className="error">{negociacoes.error}</p> : null}
      </div>

      <div className="card">
        <InteractiveTable
          rows={rows}
          rowKey={(row) => row.id}
          defaultSortKey="sucesso"
          defaultDirection="desc"
          columns={[
            {
              key: "id",
              label: "ID",
              sortValue: (row) => row.id,
            },
            {
              key: "inicio",
              label: "Início",
              sortValue: (row) => row.dataInicio || "",
              render: (row) => fmtDate(row.dataInicio),
            },
            {
              key: "responsavel",
              label: "Responsável",
              sortValue: (row) => row.responsavel,
            },
            {
              key: "vendedor",
              label: "Vendedor",
              sortValue: (row) => row.vendedor,
            },
            {
              key: "proposta",
              label: "Proposta",
              sortValue: (row) => row.proposta,
            },
            {
              key: "origem",
              label: "Origem",
              sortValue: (row) => row.origem,
            },
            {
              key: "entrada",
              label: "Veíc. entrada",
              sortValue: (row) => row.veiculoEntrada,
              render: (row) => row.veiculoEntrada || "—",
            },
            {
              key: "saida",
              label: "Veíc. saída",
              sortValue: (row) => row.veiculoSaida,
              render: (row) => row.veiculoSaida || "—",
            },
            {
              key: "sucesso",
              label: "Sucesso",
              sortValue: (row) => row.dataSucesso,
              render: (row) => fmtDate(row.dataSucesso),
            },
            {
              key: "dias",
              label: "Dias",
              align: "right",
              sortValue: (row) => (row.dias == null ? -1 : row.dias),
              render: (row) => (row.dias == null ? "—" : String(row.dias)),
            },
          ]}
        />
      </div>
    </>
  );
}
