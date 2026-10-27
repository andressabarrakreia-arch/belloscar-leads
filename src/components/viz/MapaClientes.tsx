import { useEffect, useMemo, useRef, useState } from "react";
import { tinta, useTema } from "../../theme";
import gsap from "gsap";
import { motion } from "motion/react";
import embed from "vega-embed";
import type { TopLevelSpec } from "vega-lite";
import { currentMonthKey, monthRange } from "../../lib/dates";
import {
  FILTRO_MAPA_INICIAL,
  type FiltroMapa,
  type MapaClientes,
  type MapaPonto,
  type OpcoesMapa,
} from "../../lib/geo/clientesMapa";
import { NOME_POR_UF, REGIAO_POR_UF, REGIOES } from "../../lib/geo/ddd";
import { SpotlightCard } from "./SpotlightCard";

const GEO = `${import.meta.env.BASE_URL}geo/br-uf.geojson?v=2`;
const UFS = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];

type Escolha = { tipo: "ddd"; ddd: string } | { tipo: "uf"; uf: string } | null;

function n(value: number): string {
  return value.toLocaleString("pt-BR");
}

function escapar(texto: string): string {
  return texto.replace(/[&<>"]/g, (letra) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[letra] || letra);
}

function par(nome: string, valor: number): string {
  return `<li><span>${nome}</span><b>${n(valor)}</b></li>`;
}

function pedaco(texto: string): string {
  return `<span>${texto}</span>`;
}

function listaCurta(titulo: string, itens: { nome: string; qtd: number }[]): string {
  if (itens.length === 0) return "";
  const texto = itens.map((item) => pedaco(`${escapar(item.nome)} ${n(item.qtd)}`)).join(" · ");
  return `<p><b>${titulo}</b> ${texto}</p>`;
}

function htmlDica(dado: Record<string, unknown>, mapa: MapaClientes): string {
  if (typeof dado.ddd === "string") {
    const ponto = mapa.pontos.find((item) => item.ddd === dado.ddd);
    if (!ponto) return "";
    const nome = NOME_POR_UF[ponto.uf] || ponto.uf;
    const regiao = REGIAO_POR_UF[ponto.uf] || "";
    return `<strong>DDD ${escapar(ponto.ddd)} · ${escapar(ponto.cidade)}</strong><em>${escapar(nome)} (${escapar(ponto.uf)})${regiao ? ` · ${escapar(regiao)}` : ""}</em><ul>${par("Clientes", ponto.clientes)}${par("Agendamentos", ponto.agendamentos)}${par("Visitas", ponto.visitas)}${par("Sucessos", ponto.sucessos)}${par("Insucessos", ponto.insucessos)}</ul>${listaCurta("Origens", ponto.origens)}${listaCurta("Vendedores", ponto.vendedores)}`;
  }
  if (typeof dado.uf !== "string") return "";
  const uf = dado.uf;
  const nome = NOME_POR_UF[uf] || uf;
  const regiao = REGIAO_POR_UF[uf] || "";
  const pontos = mapa.pontos.filter((item) => item.uf === uf);
  const soma = (campo: "clientes" | "agendamentos" | "visitas" | "sucessos" | "insucessos") =>
    pontos.reduce((total, ponto) => total + ponto[campo], 0);
  const cidades = pontos.map((ponto) => pedaco(`${escapar(ponto.cidade)} (${escapar(ponto.ddd)}) ${n(ponto.clientes)}`)).join(" · ");
  const origens = juntarTops(pontos.flatMap((ponto) => ponto.origens));
  const vendedores = juntarTops(pontos.flatMap((ponto) => ponto.vendedores));
  return `<strong>${escapar(nome)}</strong><em>${escapar(uf)}${regiao ? ` · ${escapar(regiao)}` : ""}</em><ul>${par("Clientes", soma("clientes"))}${par("Agendamentos", soma("agendamentos"))}${par("Visitas", soma("visitas"))}${par("Sucessos", soma("sucessos"))}${par("Insucessos", soma("insucessos"))}</ul>${cidades ? `<p><b>DDDs</b> ${cidades}</p>` : ""}${listaCurta("Origens", origens)}${listaCurta("Vendedores", vendedores)}`;
}

function juntarTops(itens: { nome: string; qtd: number }[]): { nome: string; qtd: number }[] {
  const mapa = new Map<string, number>();
  for (const item of itens) mapa.set(item.nome, (mapa.get(item.nome) || 0) + item.qtd);
  return [...mapa.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
    .slice(0, 3)
    .map(([nome, qtd]) => ({ nome, qtd }));
}

function isoLocal(date: Date): string {
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mes}-${dia}`;
}

function moverCena(cena: HTMLDivElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => undefined;
  const giroY = gsap.quickTo(cena, "rotationY", { duration: 0.45, ease: "power3.out" });
  const giroX = gsap.quickTo(cena, "rotationX", { duration: 0.45, ease: "power3.out" });
  gsap.set(cena, { transformPerspective: 900 });
  let caixa = cena.getBoundingClientRect();
  const entrar = () => {
    caixa = cena.getBoundingClientRect();
  };
  const mover = (event: PointerEvent) => {
    const px = (event.clientX - caixa.left) / caixa.width - 0.5;
    const py = (event.clientY - caixa.top) / caixa.height - 0.5;
    giroY(px * 7);
    giroX(py * -5);
  };
  const sair = () => {
    giroY(0);
    giroX(0);
  };
  cena.addEventListener("pointerenter", entrar);
  cena.addEventListener("pointermove", mover);
  cena.addEventListener("pointerleave", sair);
  return () => {
    cena.removeEventListener("pointerenter", entrar);
    cena.removeEventListener("pointermove", mover);
    cena.removeEventListener("pointerleave", sair);
    gsap.set(cena, { clearProps: "transform" });
  };
}

function filtroAplicado(filtro: FiltroMapa) {
  return (Object.keys(FILTRO_MAPA_INICIAL) as (keyof FiltroMapa)[]).some(
    (chave) => filtro[chave] !== FILTRO_MAPA_INICIAL[chave],
  );
}
export function MapaClientes({
  mapa,
  filtro = FILTRO_MAPA_INICIAL,
  opcoes,
  onFiltro,
}: {
  mapa: MapaClientes;
  filtro?: FiltroMapa;
  opcoes?: OpcoesMapa;
  onFiltro?: (filtro: FiltroMapa) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cena = useRef<HTMLDivElement>(null);
  const [escolha, setEscolha] = useState<Escolha>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const escolher = useRef(setEscolha);
  escolher.current = setEscolha;
  const { tema } = useTema();

  const ponto = useMemo(
    () => (escolha?.tipo === "ddd" ? mapa.pontos.find((item) => item.ddd === escolha.ddd) : undefined),
    [escolha, mapa.pontos]
  );
  const doEstado = useMemo(
    () => (escolha?.tipo === "uf" ? mapa.pontos.filter((item) => item.uf === escolha.uf) : []),
    [escolha, mapa.pontos]
  );

  useEffect(() => {
    setEscolha(null);
  }, [mapa]);

  useEffect(() => {
    const el = cena.current;
    if (!el) return;
    return moverCena(el);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spec: TopLevelSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      background: "transparent",
      width: "container",
      height: 460,
      padding: 8,
      projection: { type: "mercator" },
      layer: [
        {
          data: { url: GEO, format: { type: "json", property: "features" } },
          transform: [
            { calculate: "datum.properties.sigla", as: "uf" },
            {
              lookup: "uf",
              from: {
                data: { values: mapa.ufs },
                key: "uf",
                fields: ["clientes", "agendamentos", "visitas", "sucessos"],
              },
            },
            { calculate: "datum.clientes == null ? 0 : datum.clientes", as: "clientes" },
          ],
          mark: { type: "geoshape", stroke: "rgba(255,255,255,0.85)", strokeWidth: 0.8, cursor: "pointer" },
          encoding: {
            color: {
              field: "clientes",
              type: "quantitative",
              title: "Clientes",
              scale: { range: ["rgba(246,228,229,0.42)", "rgba(192,32,38,0.9)"] },
            },
            tooltip: [
              { field: "uf", type: "nominal", title: "Estado" },
              { field: "clientes", type: "quantitative", title: "Clientes", format: "," },
              { field: "agendamentos", type: "quantitative", title: "Agendamentos", format: "," },
              { field: "visitas", type: "quantitative", title: "Visitas", format: "," },
              { field: "sucessos", type: "quantitative", title: "Sucessos", format: "," },
            ],
          },
        },
        {
          data: { values: mapa.pontos },
          mark: { type: "circle", color: "rgba(192,32,38,0.28)", strokeWidth: 0 },
          encoding: {
            longitude: { field: "lon", type: "quantitative" },
            latitude: { field: "lat", type: "quantitative" },
            size: { field: "clientes", type: "quantitative", scale: { range: [80, 1400] }, legend: null },
            opacity: { value: 0.55 },
          },
        },
        {
          data: { values: mapa.pontos },
          mark: { type: "circle", color: tinta("var(--chart-ink)"), stroke: "rgba(255,255,255,0.9)", strokeWidth: 1, cursor: "pointer" },
          encoding: {
            longitude: { field: "lon", type: "quantitative" },
            latitude: { field: "lat", type: "quantitative" },
            size: { field: "clientes", type: "quantitative", title: "Clientes", scale: { range: [28, 520] }, legend: null },
            opacity: { field: "clientes", type: "quantitative", scale: { range: [0.55, 0.95] }, legend: null },
            tooltip: [
              { field: "ddd", type: "nominal", title: "DDD" },
              { field: "cidade", type: "nominal", title: "Cidade" },
              { field: "uf", type: "nominal", title: "Estado" },
              { field: "clientes", type: "quantitative", title: "Clientes", format: "," },
              { field: "agendamentos", type: "quantitative", title: "Agendamentos", format: "," },
              { field: "visitas", type: "quantitative", title: "Visitas", format: "," },
              { field: "sucessos", type: "quantitative", title: "Sucessos", format: "," },
              { field: "insucessos", type: "quantitative", title: "Insucessos", format: "," },
            ],
          },
        },
      ],
    };
    let fechou = false;
    let vista: { finalize: () => void } | null = null;
    const caixa = document.createElement("div");
    caixa.className = "mapa-dica";
    caixa.hidden = true;
    document.body.appendChild(caixa);
    const esconderDica = () => {
      caixa.hidden = true;
    };
    el.addEventListener("pointerleave", esconderDica);
    const mostrarDica = (_handler: unknown, event: unknown, item: unknown, value: unknown) => {
      document.querySelectorAll(".vg-tooltip").forEach((caixaVelha) => caixaVelha.remove());
      const dado = (item as { datum?: Record<string, unknown> } | null)?.datum;
      const html = value != null && dado ? htmlDica(dado, mapa) : "";
      if (!html || !event) {
        caixa.hidden = true;
        return;
      }
      caixa.innerHTML = html;
      caixa.hidden = false;
      const mouse = event as MouseEvent;
      const margem = 14;
      const largura = caixa.offsetWidth;
      const altura = caixa.offsetHeight;
      let x = mouse.clientX + margem;
      let y = mouse.clientY + margem;
      if (x + largura > window.innerWidth - 8) x = Math.max(8, mouse.clientX - largura - margem);
      if (y + altura > window.innerHeight - 8) y = Math.max(8, mouse.clientY - altura - margem);
      caixa.style.left = `${x}px`;
      caixa.style.top = `${y}px`;
    };
    embed(el, spec, { actions: false, renderer: "canvas", tooltip: mostrarDica })
      .then((result) => {
        if (fechou) {
          result.finalize();
          return;
        }
        vista = result;
        result.view.addEventListener("click", (_event, item) => {
          const dado = item?.datum as Record<string, unknown> | undefined;
          if (!dado) return;
          if (typeof dado.ddd === "string") escolher.current({ tipo: "ddd", ddd: dado.ddd });
          else if (typeof dado.uf === "string") escolher.current({ tipo: "uf", uf: dado.uf });
        });
      })
      .catch(() => undefined);
    return () => {
      fechou = true;
      el.removeEventListener("pointerleave", esconderDica);
      caixa.remove();
      vista?.finalize();
    };
  }, [mapa, tema]);

  const periodoTodo = !filtro.from && !filtro.to;
  const pedeVeiculo = filtro.tipoVeiculo !== "all" || filtro.marca !== "all";

  return (
    <section className="indice-card mapa-card" aria-label="Mapa de clientes">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h2>Mapa de clientes</h2>
        <p className="muted">
          {n(mapa.clientes)} clientes com telefone reconhecido
          {periodoTodo ? " em todo o período importado" : " neste recorte"}. A cor do estado segue o volume, do rosa claro ao
          vermelho da marca. O ponto é o DDD. Clique para abrir o painel.
        </p>
        {onFiltro && opcoes ? (
          <button
            type="button"
            className={`mapa-filtro-toggle${filtroAplicado(filtro) ? " is-active" : ""}`}
            aria-expanded={filtrosAbertos}
            onClick={() => setFiltrosAbertos((aberto) => !aberto)}
          >
            {filtrosAbertos ? "Ocultar filtros" : "Filtros"}
          </button>
        ) : null}
        {filtrosAbertos && onFiltro && opcoes ? (
          <Filtros filtro={filtro} opcoes={opcoes} onFiltro={onFiltro} />
        ) : null}
        <div className="mapa-grade">
          <div className="mapa-palco">
            <SpotlightCard className="mapa-cena">
              <div ref={cena}>
                <div ref={ref} className="mapa-vega" role="img" aria-label="Mapa de clientes por DDD" />
              </div>
            </SpotlightCard>
          </div>
          <Painel
            ponto={ponto}
            estado={escolha?.tipo === "uf" ? escolha.uf : ""}
            pontos={doEstado}
            mapa={mapa}
            pedeVeiculo={pedeVeiculo}
          />
        </div>
      </motion.div>
    </section>
  );
}

function Filtros({
  filtro,
  opcoes,
  onFiltro,
}: {
  filtro: FiltroMapa;
  opcoes: OpcoesMapa;
  onFiltro: (filtro: FiltroMapa) => void;
}) {
  function mudar(parcial: Partial<FiltroMapa>) {
    onFiltro({ ...filtro, ...parcial });
  }

  const aplicado = filtroAplicado(filtro);

  function periodo(tipo: "tudo" | "mes" | "ano" | "90") {
    if (tipo === "tudo") {
      mudar({ from: "", to: "" });
      return;
    }
    if (tipo === "mes") {
      mudar(monthRange(currentMonthKey()));
      return;
    }
    if (tipo === "ano") {
      const ano = new Date().getFullYear();
      mudar({ from: `${ano}-01-01`, to: `${ano}-12-31` });
      return;
    }
    const fim = new Date();
    const inicio = new Date();
    inicio.setDate(fim.getDate() - 90);
    mudar({ from: isoLocal(inicio), to: isoLocal(fim) });
  }

  return (
    <div className="mapa-filtros-caixa">
      <div className="mapa-presets">
        <button type="button" onClick={() => periodo("tudo")}>
          Todo o período
        </button>
        <button type="button" onClick={() => periodo("mes")}>
          Este mês
        </button>
        <button type="button" onClick={() => periodo("ano")}>
          Este ano
        </button>
        <button type="button" onClick={() => periodo("90")}>
          90 dias
        </button>
        <button type="button" className={aplicado ? "is-active" : ""} onClick={() => onFiltro(FILTRO_MAPA_INICIAL)}>
          Limpar
        </button>
      </div>
      <div className="mapa-filtros">
        <label>
          De
          <input type="date" min={opcoes.inicio || undefined} max={opcoes.fim || undefined} value={filtro.from} onChange={(event) => mudar({ from: event.target.value })} />
        </label>
        <label>
          Até
          <input type="date" min={opcoes.inicio || undefined} max={opcoes.fim || undefined} value={filtro.to} onChange={(event) => mudar({ to: event.target.value })} />
        </label>
        <Campo label="Região" value={filtro.regiao} opcoes={REGIOES} onChange={(regiao) => mudar({ regiao, uf: "all" })} />
        <Campo label="Estado" value={filtro.uf} opcoes={UFS} onChange={(uf) => mudar({ uf })} />
        <Campo label="Origem" value={filtro.origem} opcoes={opcoes.origens} onChange={(origem) => mudar({ origem })} />
        <Campo label="Canal" value={filtro.canal} opcoes={opcoes.canais} onChange={(canal) => mudar({ canal })} />
        <Campo label="Situação" value={filtro.situacao} opcoes={["Agendado", "Visita", "Sucesso", "Insucesso"]} onChange={(situacao) => mudar({ situacao })} />
        <Campo label="Proposta" value={filtro.proposta} opcoes={opcoes.propostas} onChange={(proposta) => mudar({ proposta })} />
        <Campo label="Tipo de veículo" value={filtro.tipoVeiculo} opcoes={opcoes.tiposVeiculo} onChange={(tipoVeiculo) => mudar({ tipoVeiculo })} />
        <Campo label="Marca" value={filtro.marca} opcoes={opcoes.marcas} onChange={(marca) => mudar({ marca })} />
        <Campo label="Vendedor" value={filtro.vendedor} opcoes={opcoes.vendedores} onChange={(vendedor) => mudar({ vendedor })} />
      </div>
      <p className="muted mapa-filtro-nota">
        Tipo de veículo e marca vêm da negociação e acompanham o nome do cliente. Canal e vendedor vêm da agenda.
        {opcoes.inicio ? ` Datas importadas: ${opcoes.inicio.split("-").reverse().join("/")} a ${opcoes.fim.split("-").reverse().join("/")}.` : ""}
      </p>
    </div>
  );
}

function Campo({
  label,
  value,
  opcoes,
  onChange,
}: {
  label: string;
  value: string;
  opcoes: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="all">Todos</option>
        {opcoes.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

function Painel({
  ponto,
  estado,
  pontos,
  mapa,
  pedeVeiculo,
}: {
  ponto?: MapaPonto;
  estado: string;
  pontos: MapaPonto[];
  mapa: MapaClientes;
  pedeVeiculo: boolean;
}) {
  if (ponto) {
    return (
      <aside className="mapa-painel">
        <h3>
          DDD {ponto.ddd} · {ponto.cidade}
        </h3>
        <p className="muted">{ponto.uf}</p>
        <Numeros ponto={ponto} />
        <Lista titulo="Origens" itens={ponto.origens} />
        <Lista titulo="Vendedores" itens={ponto.vendedores} />
      </aside>
    );
  }
  if (estado) {
    const total = pontos.reduce((soma, item) => soma + item.clientes, 0);
    return (
      <aside className="mapa-painel">
        <h3>{estado}</h3>
        <p>{n(total)} clientes neste estado.</p>
        <ul>
          {pontos.map((item) => (
            <li key={item.ddd}>
              DDD {item.ddd} · {item.cidade}: {n(item.clientes)}
            </li>
          ))}
        </ul>
      </aside>
    );
  }
  return (
    <aside className="mapa-painel">
      <h3>Maiores DDDs</h3>
      {mapa.pontos.length === 0 ? <p>Nenhum cliente neste recorte.</p> : null}
      <ul>
        {mapa.pontos.slice(0, 6).map((item) => (
          <li key={item.ddd}>
            {item.ddd} · {item.cidade}: {n(item.clientes)}
          </li>
        ))}
      </ul>
      {mapa.semDdd > 0 ? <p className="muted">{n(mapa.semDdd)} linhas com DDD fora da lista.</p> : null}
      {pedeVeiculo && mapa.semVeiculo > 0 ? (
        <p className="muted">{n(mapa.semVeiculo)} linhas sem esse veículo no nome da negociação.</p>
      ) : null}
    </aside>
  );
}

function Numeros({ ponto }: { ponto: MapaPonto }) {
  const itens = [
    ["Clientes", ponto.clientes],
    ["Agendamentos", ponto.agendamentos],
    ["Visitas", ponto.visitas],
    ["Sucessos", ponto.sucessos],
    ["Insucessos", ponto.insucessos],
  ] as const;
  return (
    <dl className="mapa-numeros">
      {itens.map(([nome, valor]) => (
        <div key={nome}>
          <dt>{nome}</dt>
          <dd>{n(valor)}</dd>
        </div>
      ))}
    </dl>
  );
}

function Lista({ titulo, itens }: { titulo: string; itens: { nome: string; qtd: number }[] }) {
  if (itens.length === 0) return null;
  return (
    <>
      <h4>{titulo}</h4>
      <ul>
        {itens.map((item) => (
          <li key={item.nome}>
            {item.nome}: {n(item.qtd)}
          </li>
        ))}
      </ul>
    </>
  );
}
