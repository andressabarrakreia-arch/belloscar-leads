# Catálogo do agente

Atualizado em 2026-10-27 (Apresentação UX + badges + compartilhar imagem).

Este arquivo reúne o que o agente usa neste projeto: skills, rules, hooks, MCP e plugins. Cada item diz para que serve aqui e se entra sozinho ou só quando você pede.

A regra `.cursor/rules/skills-catalogo.mdc` vale em toda conversa. Antes de uma tarefa, o agente lê este arquivo e escolhe o que entra. Se você não citar nenhuma skill, ele escolhe. No mesmo turno em que uma skill, rule, hook, MCP ou plugin entrar, sair ou mudar, este arquivo é atualizado.

## Como ler

| Modo | O que significa |
| --- | --- |
| Autônoma | O agente lê a skill e age quando a situação combina. Você não precisa citar o nome. |
| Manual | Você pede, ou o agente para e espera um sim antes de enviar, publicar, salvar no histórico (commit), enviar ao GitHub (push) ou fechar um issue. |
| Mista | A preparação é autônoma. O passo que sai do seu computador é manual. |

Limite deste projeto: as seis skills vindas do Ant Design foram escritas para o repositório da biblioteca, não para este painel. O agente segue o espírito delas e troca o alvo pelos arquivos daqui. Não publica o pacote `antd` e não cria changelog em inglês e chinês. A skill Graphify é da ferramenta de mapa do código: a leitura do código fica neste computador. A skill Humanizer reescreve texto para parecer escrito por uma pessoa, sem mudar o que o texto afirma. A skill find-skills procura skills prontas na lista pública e só instala depois do sim. As skills de visual (`frontend-design`, `web-design-guidelines`, `recharts`) melhoram gráficos e tabelas sem trocar a marca BellosCar. A skill de architecture decision record grava a decisão em `decisions/` ou na pasta de ADR que o projeto já tiver. Não instala ferramenta de pull request sozinha. As skills Angular (`angular-developer`, `angular-new-app`) são do framework Angular. Este painel é React com Vite. Elas não reescrevem o painel e não rodam `ng new` aqui. Só entram quando você pedir código ou um aplicativo Angular, fora deste painel. A skill `benchmark-optimization-loop` só mede e troca um caminho quando você pedir para deixar algo mais rápido. Primeiro registra o tempo atual. Cada tentativa testa uma ideia só. Não varre o painel inteiro sozinha. A skill `blueprint` só entra em mudança grande, que cabe em vários pull requests ou sessões. Uma tarefa pequena ou um "faz logo" segue sem esse plano. O arquivo vai para `plans/`. Abrir branch e pull request continua esperando o sim.

## Lista completa

| Skill | Função neste projeto | Modo |
| --- | --- | --- |
| `reuse-before-create` | Antes de criar página ou módulo, reutiliza o que já existe | Autônoma |
| `identificar-padroes` | Percebe repetição e pergunta se vira regra ou skill | Mista |
| `antd-commit-msg` | Escreve a frase de uma linha do commit | Mista |
| `antd-create-pr` | Monta o texto de um pull request | Mista |
| `changelog-collect` | Junta o que mudou entre versões no changelog | Mista |
| `antd-test-review` | Diz se um teste vale a pena | Autônoma |
| `antd-issue-reply` | Prepara resposta a issue no GitHub | Manual |
| `antd-version-release` | Prepara versão; não publica pacote npm | Manual |
| `graphify` | Mapa do código: responde como arquivos e funções se ligam | Mista |
| `humanizer` | Reescreve texto para soar como uma pessoa, sem mudar o sentido | Autônoma |
| `find-skills` | Procura uma skill pronta para a tarefa e mostra as opções | Mista |
| `frontend-design` | Direção visual de cards, tabelas e gráficos, mantendo a marca | Mista |
| `web-design-guidelines` | Revisa contraste, rótulos e leitura da tela | Manual |
| `recharts` | Monta e ajusta os gráficos da biblioteca que o painel já usa | Autônoma |
| `architecture-decision-record-skill` | Registra uma decisão de arquitetura: contexto, escolha e consequência | Autônoma |
| `angular-developer` | Escreve código Angular no estilo atual do framework | Manual |
| `angular-new-app` | Cria um aplicativo Angular novo com a CLI | Manual |
| `benchmark-optimization-loop` | Mede o caminho atual e só troca pela variante mais rápida que continua correta | Mista |
| `blueprint` | Quebra uma mudança grande em passos do tamanho de um pull request | Mista |
| `vega-mapa-clientes` | Mapa de clientes no índice e barras Vega | Autônoma |
| `sigma-cruzamento` | Quadro das cinco planilhas na página Erros | Autônoma |
| `dc-cruzado` | Dois gráficos dc.js que se filtram juntos | Autônoma |
| `d3-cruzamento` | Barras D3 de falta por planilha | Autônoma |
| `dygraphs-series` | Série no tempo com zoom por arraste | Autônoma |
| `echarts-erros` | Barras ECharts dos tipos de falta | Autônoma |
| `gsap-belloscar` | Abertura do índice e inclinação do pátio de erros | Autônoma |
| `three-abertura` | Histórico do anel Three; abertura atual usa logo BC + GSAP | Autônoma |
| `motion-abertura` | Botão Entrar e fade do mapa com Motion | Autônoma |
| `motion-performance` | Movimento só com transform e opacity | Autônoma |
| `kpi-dashboard-design` | Widgets e leitura de KPIs na Apresentação | Mista |
| `polish` | Passada final de microtipografia e espaçamento | Mista |
| `visual-consistency` | Alinha cards/trilhos (nomes, KPIs, alturas) | Autônoma |
| `ui-scroll-regions` | Scroll horizontal/vertical com scrollbar no tema | Autônoma |
| `sharp` | Pipeline de imagem (resize, JPEG/PNG) para assets | Manual |
| `byted-las-image-resample` | Orientação de resample/upscale de artes | Manual |
| `remotion-limite` | Impede instalar Remotion neste site | Autônoma |
| `video-maker-limite` | Impede clonar o video-maker | Autônoma |
| `hyperframes-limite` | Impede instalar HyperFrames neste site | Autônoma |
| `higgsfield-limite` | Impede instalar o treino de GPU Higgsfield | Autônoma |
| `agencia-indice` | Qualidade visual do índice sem clonar agency-agents | Autônoma |
| `grill-mapa` | Decisões já fechadas do mapa de clientes | Autônoma |
| `nexus-mapper` | Gera `.nexus-map/` para o agente não se perder no código | Mista |
| `system-atlas` | Atlas do sistema (`SYSTEM.md` + mapa) a partir de uma fonte de dados | Mista |
| `context-map` | Antes de mudar código, mapeia arquivos, deps, testes e riscos | Autônoma |
| `ghost-repo-context` | Resume arquitetura do repositório em `repo.md` | Mista |
| `codebase-onboarding` | Guia de onboarding / alinhamento com `AGENTS.md` | Mista |
| `codebase-learner` | Estado atual do código; modo site-ia para IA do produto | Mista |
| `d3-visualization` | Grafos e viz customizados em D3 (mapa gráfico do site) | Autônoma |
| `cinematic-web` | Direção de motion cinematográfica em páginas de show | Mista |
| `presentation-building` | Estrutura de deck/apresentação (teclado, seções) | Mista |
| `design-taste-frontend` | Audit/redesign anti-slop de telas existentes | Mista |
| `design-distinctive-ui` | Redesign/Polish com ponto de vista distintivo | Mista |

---

## Rules

Arquivos em `.cursor/rules/`. **Sempre** entra em toda conversa. **No arquivo** entra quando o arquivo aberto combina com o glob.

| Rule | Quando entra | Função |
| --- | --- | --- |
| `skills-catalogo` | Sempre | Lê este catálogo, escolhe as skills e atualiza o arquivo |
| `update-documentation` | Sempre | Atualiza changelog e docs ao fim da tarefa |
| `escopo-estrito` | Sempre | Muda só o que foi pedido |
| `reuse-before-create` | Sempre | Reutiliza página, módulo e padrão já existentes |
| `identificar-padroes` | Sempre | Pergunta antes de virar repetição em regra ou skill |
| `typescript-stack` | Sempre | React, TypeScript e GitHub Pages |
| `belloscar-product-prefs` | Sempre | Nome, marca e módulos do produto |
| `testar-e-perguntar-publicacao` | Sempre | Pede teste e o sim antes de publicar |
| `no-secrets-in-repo` | Sempre | Não versiona token nem senha |
| `filtros-barra` | Sempre | Filtro recolhido, limpar e vermelho no filtro ativo |
| `painel-gestao-planilhas` | Sempre | Upload só no Painel de Gestão |
| `module-storage-isolation` | Sempre | Storage de um módulo não vaza para outro |
| `multi-module-pages` | Sempre | Módulos com rota e link próprios |
| `scheduling-dedupe` | Sempre | Agendamento único por ID |
| `graphify` | Sempre | Consulta o mapa do código antes de vasculhar arquivo |
| `negociacoes-dedupe` | No arquivo de negociações | Contagem e dedupe da loja |
| `mapa-orientacao-dados` | Sempre | Lê `.nexus-map/` antes de criar/mover dados ou rotas; Erros/Mapa usam gate PIN separado da Gestão |

### mapa-orientacao-dados

- Arquivo: `.cursor/rules/mapa-orientacao-dados.mdc`
- Função: cold start pelos mapas do produto; não recriar JSON keys; mapa geográfico só no índice; `#/mapa` é atlas do site.
- Sempre: entra em toda conversa.

## Hooks

Nenhum hook neste repositório. Não há `hooks.json`. Se um hook for criado, entra nesta seção no mesmo turno, com o arquivo e o evento que dispara.

## MCP

Nenhum servidor MCP versionado neste repositório. O navegador usado para conferir a tela é o do Cursor, fora deste catálogo de código. Um `mcp.json` do projeto, se aparecer, entra aqui com o nome e o que ele lê.

## Plugins

Nenhum plugin do Cursor neste repositório. Se um plugin for adicionado, entra aqui com o nome e a função.

---

### reuse-before-create

- Arquivo: `.cursor/skills/reuse-before-create/SKILL.md`
- Função: ao criar página, módulo, importador ou painel, olhar o código atual (registro de módulos, layout, leitura de planilha, PIN, CSS) e estender isso em vez de inventar outro caminho.
- Autônoma: toda criação ou alteração de página neste repositório. A regra `.cursor/rules/reuse-before-create.mdc` já dispara isso.
- Manual: nada. Não pede confirmação para reutilizar.
- Você pode dizer: "cria a página nova seguindo o que já existe".

### identificar-padroes

- Arquivo: `.cursor/skills/identificar-padroes/SKILL.md`
- Função: notar filtro, botão, card ou texto que se repete e perguntar se isso vira regra ou skill.
- Autônoma: observar durante tarefas de tela, filtro, página ou botão. A regra `.cursor/rules/identificar-padroes.mdc` dispara a pergunta.
- Manual: criar a regra ou a skill. Só depois do seu sim. Se você disser não, o agente não insiste nessa tarefa.
- Você pode dizer: "pode transformar isso em regra" ou "pode virar skill".

### antd-commit-msg

- Arquivo: `.agents/skills/antd-commit-msg/SKILL.md`
- Função: gerar uma única linha de commit que cubra tudo o que está separado para salvar, no estilo dos commits recentes deste repositório.
- Autônoma: quando você pedir a mensagem, disser "msg", ou quando já tiver dito que pode fazer o commit. Antes de escrever, o agente olha o que está staged, o diff e os últimos commits. A frase sai numa linha só.
- Manual: executar o commit e o push. Continua valendo `.cursor/rules/testar-e-perguntar-publicacao.mdc`: sem o seu "ok para commit e publicar", nada é salvo no GitHub.
- Você pode dizer: "escreve a mensagem de commit" ou "pode commitar".

### antd-create-pr

- Arquivo: `.agents/skills/antd-create-pr/SKILL.md`
- Referência extra: `.agents/skills/antd-create-pr/references/template-notes-and-examples.md`
- Função: resumir a branch inteira (não só o último commit) e montar título e texto de pull request.
- Autônoma: quando você pedir para abrir, redigir ou preparar um PR. O agente lê a branch, a base e o diff completo, e entrega o rascunho.
- Manual: rodar a criação de verdade (`gh pr create`). O agente mostra base, título e texto e espera o seu sim. Se você mudar o título no meio, ele atualiza o rascunho e pergunta de novo.
- Neste repositório não há os modelos oficiais do Ant Design em `.github/`. O texto segue as mesmas seções (o que mudou, por quê, como testar), em português. O título fica em português, alinhado aos commits daqui.
- Você pode dizer: "abre um PR" ou "monta o texto do PR".

### changelog-collect

- Arquivo: `.agents/skills/changelog-collect/SKILL.md`
- Função: reunir o que entrou entre duas versões e organizar o `CHANGELOG.md` deste projeto, em português, com data.
- Autônoma: quando você pedir para coletar, gerar, atualizar ou comparar changelog. Se a versão não estiver clara, o agente pergunta antes de escrever. O arquivo oficial daqui é só `CHANGELOG.md`.
- Manual: não roda sozinho no fim de toda tarefa. A regra de escopo estrito continua: changelog do produto só entra quando você pedir. Publicar a versão também espera o seu sim.
- Você pode dizer: "atualiza o changelog" ou "compara com a versão anterior".

### antd-test-review

- Arquivo: `.agents/skills/antd-test-review/SKILL.md`
- Função: julgar se um teste merece ficar. Procura teste que só repete a implementação, cobre o mesmo caso duas vezes ou trava detalhe interno sem valor.
- Autônoma: quando você pedir para revisar, validar ou decidir se um teste fica, muda ou sai. A resposta começa pela conclusão e pelo motivo principal. Por padrão é leitura do código, sem rodar a suíte de testes.
- Manual: apagar ou reescrever o teste, e mexer no código do painel. O agente não cria teste novo por conta própria.
- Você pode dizer: "revisa esses testes" ou "esse teste vale a pena?".

### antd-issue-reply

- Arquivo: `.agents/skills/antd-issue-reply/SKILL.md`
- Referência extra: `.agents/skills/antd-issue-reply/references/labels-and-resources.md`
- Função: classificar um issue (erro ou pedido de função) e redigir uma resposta educada, no idioma do texto original do issue.
- Manual: esta skill só começa quando você pedir para responder, triar ou fechar issue. Enviar a resposta e fechar o issue também esperam o seu sim. O agente não varre issues do Ant Design nem do BellosCar sozinho.
- Você pode dizer: "responde esse issue" ou "pode fechar, o problema já foi resolvido".

### antd-version-release

- Arquivo: `.agents/skills/antd-version-release/SKILL.md`
- Função: no Ant Design, esta skill prepara o PR de versão e o `npm publish`. Aqui ela não publica pacote. Publicar o painel é outro fluxo: commit na `main` e push, para o GitHub Pages atualizar o site.
- Manual: só entra se você falar em versão, release ou publicar pacote. Mesmo assim o agente não roda `npm publish`. Ele explica a diferença e, se você quiser o site no ar, segue a pergunta de publicação que já existe. Subir o número em `CHANGELOG.md` espera o seu sim e, se o changelog ainda não foi organizado, usa antes a skill `changelog-collect`.
- Você pode dizer: "sobe a versão no changelog" ou "quero publicar o site".

### graphify

- Arquivo: `.agents/skills/graphify/SKILL.md`
- Regra que dispara sozinha: `.cursor/rules/graphify.mdc`
- Função: montar um mapa do projeto (o que importa o quê, quem chama quem) e responder perguntas de arquitetura por esse mapa, em vez de abrir arquivo por arquivo. O mapa desta instalação está em `graphify-out/` (843 nós, só código, sem enviar documentos para fora).
- Autônoma: pergunta sobre como o código se organiza, caminho entre duas partes, ou explicação de um conceito. A regra manda consultar o mapa antes de vasculhar os arquivos. Depois de mudar código, o agente roda `graphify update .` para atualizar o mapa sem custo de API.
- Manual: clonar outro repositório, mandar o mapa para Neo4j ou FalkorDB, vigiar a pasta em tempo real (`watch`), extrair PDF ou imagem com modelo externo, ou apagar o mapa. Isso só com o seu pedido.
- O programa `graphify` está instalado neste computador (pacote `graphifyy` 0.9.95). Se uma janela nova disser que o comando não existe, o Windows ainda não procura sozinho na pasta de scripts do Python do usuário.
- Você pode dizer: "como o módulo de agendamentos se liga ao resto?" ou "atualiza o mapa do código".

### humanizer

- Arquivo: `.agents/skills/humanizer/SKILL.md`
- Função: tirar o tom de texto gerado por máquina. O sentido, os números, os nomes e os caminhos de arquivo ficam iguais. Não serve para enganar detector de texto automático.
- Autônoma: quando a tarefa escreve ou revisa texto que uma pessoa lê. Isso inclui frases da tela, explicações, changelog e este catálogo. O agente lê a skill e reescreve só esse texto. Código, comandos e dados ficam como estão.
- O bloco de resumo no fim da tarefa continua obrigatório, no formato que a regra de comunicação já pede.
- Não sai vasculhando telas antigas só para reescrever frase. Só entra no texto da tarefa atual.
- Manual: nada para enviar ou publicar. Se quiser um texto solto reescrito, cole e peça.
- Você pode dizer: "deixa esse texto mais natural" ou "humanize o texto do card".

### find-skills

- Arquivo: `.agents/skills/find-skills/SKILL.md`
- Fonte: [vercel-labs/skills](https://github.com/vercel-labs/skills/tree/main/skills/find-skills)
- Função: quando a tarefa pede uma capacidade que talvez já exista como skill, procurar em [skills.sh](https://skills.sh/) e com `npx skills find`. Mostra nome, o que faz, de onde vem e o comando de instalação.
- Autônoma: a busca e a lista de opções. Prefere skills conhecidas e com bastante uso. Se não achar nada, segue a tarefa com o que o projeto já tem.
- Manual: instalar. Só depois do seu sim. A instalação fica neste projeto, não no computador inteiro, e este catálogo é atualizado na mesma tarefa.
- Você pode dizer: "existe uma skill para revisar testes?" ou "pode instalar essa".

### frontend-design

- Arquivo: `.agents/skills/frontend-design/SKILL.md`
- Fonte: [anthropics/skills](https://skills.sh/anthropics/skills/frontend-design)
- Função: escolher tipo de letra, espaço, cor e hierarquia para a tela ficar intencional. Vale para card, tabela e gráfico.
- Autônoma: quando a tarefa já mexe em uma tela, tabela ou gráfico. A paleta continua a do BellosCar (vermelho, carvão, azul de apoio). Não inventa outra marca.
- Manual: um retoque visual da página inteira. Você diz qual página.
- Você pode dizer: "melhora a tabela de pré-vendas" ou "deixa o gráfico de portais mais fácil de ler".

### web-design-guidelines

- Arquivo: `.agents/skills/web-design-guidelines/SKILL.md`
- Fonte: [vercel-labs/agent-skills](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines)
- Função: revisar a tela contra um guia de leitura e acessibilidade (contraste, rótulo, foco, texto pequeno demais). O resultado é uma lista do que ajustar, com arquivo e linha.
- Manual: só quando você pedir a revisão. Se não disser o arquivo, o agente pergunta qual tela. Corrigir o que a lista apontar também espera o seu sim.
- Você pode dizer: "revisa a leitura da Visão Geral de Agendamentos" ou "confere a tabela de formulários".

### recharts

- Arquivo: `.agents/skills/recharts/SKILL.md`
- Fonte: [andy-spike/skills](https://skills.sh/andy-spike/skills/recharts)
- Função: criar ou ajustar gráfico de linha, barra, área ou pizza com a biblioteca Recharts, que o painel já tem. Cuida de tamanho, legenda, eixo e dica ao passar o mouse.
- Autônoma: quando a tarefa cria ou muda um gráfico. Não troca a biblioteca e não reinstala o que já está no projeto.
- Manual: nada para publicar. Um gráfico novo só entra se a tarefa pedir esse gráfico.
- Você pode dizer: "troca esse gráfico para barras" ou "a legenda do gráfico de motivos está ilegível".

### architecture-decision-record-skill

- Arquivo: `.agents/skills/architecture-decision-record-skill/SKILL.md`
- Referência extra: `.agents/skills/architecture-decision-record-skill/reference/templates.md` e `.agents/skills/architecture-decision-record-skill/reference/writing-guide.md`
- Fonte: [architecture-decision-record/architecture-decision-record](https://github.com/architecture-decision-record/architecture-decision-record/tree/main/skills/architecture-decision-record-skill)
- Função: decidir se uma escolha de arquitetura merece registro, criar o arquivo, nomear, escolher o modelo e escrever contexto, decisão e consequências. O modelo padrão é o Nygard. Um arquivo, uma decisão.
- Autônoma: quando você pedir para documentar, escrever, nomear, organizar ou substituir uma decisão de arquitetura. O agente segue a pasta que o projeto já usa. Se não houver pasta, usa `decisions/`.
- Manual: instalar ADR Guard ou Decision Guardian no pull request. Commit e push continuam esperando o seu sim.
- Você pode dizer: "escreve um ADR para a escolha do banco" ou "documenta essa decisão".

### angular-developer

- Arquivo: `.agents/skills/angular-developer/SKILL.md`
- Referência extra: `.agents/skills/angular-developer/references/`
- Fonte: [angular/skills](https://github.com/angular/skills)
- Função: gerar componente, serviço, rota, formulário e teste no Angular atual (signals, injeção de dependência, acessibilidade, CLI).
- Manual: este painel é React. A skill só começa quando você pedir trabalho em Angular. Não converte o BellosCar e não troca React por Angular.
- Você pode dizer: "cria um componente Angular de lista" ou "qual a forma atual de fazer formulário com signals".

### angular-new-app

- Arquivo: `.agents/skills/angular-new-app/SKILL.md`
- Fonte: [angular/skills](https://github.com/angular/skills)
- Função: criar um aplicativo Angular novo com `npx ng new`, fora deste repositório.
- Manual: só quando você pedir um app Angular novo. O agente confirma o nome antes de rodar a CLI. Instalar `@angular/cli` no computador também espera o seu sim. Não cria esse app dentro do BellosCar.
- Você pode dizer: "cria um app Angular novo chamado oficina".

### benchmark-optimization-loop

- Arquivo: `.agents/skills/benchmark-optimization-loop/SKILL.md`
- Fonte: [affaan-m/ECC](https://github.com/affaan-m/ECC/tree/main/skills/benchmark-optimization-loop)
- Função: transformar "deixa mais rápido" num ciclo medido. Registra o tempo atual, testa uma hipótese por vez e fica com a variante mais rápida que continua correta.
- Autônoma: quando você pedir para acelerar um script, uma leitura de planilha, um gráfico ou uma geração de dados. O agente mede o caminho de hoje antes de mudar código.
- Manual: uma busca longa espera você dizer quantas tentativas e quanto tempo. Trocar o caminho padrão só depois da medida repetir e da checagem continuar verde. Commit e push continuam esperando o seu sim.
- Você pode dizer: "mede a geração de agendamentos e deixa mais rápida" ou "compara essas duas formas de ler a planilha".

### blueprint

- Arquivo: `.agents/skills/blueprint/SKILL.md`
- Fonte: [affaan-m/ECC](https://github.com/affaan-m/ECC/tree/main/skills/blueprint)
- Função: transformar um objetivo de uma linha num plano de construção. Cada passo cabe num pull request e traz contexto, verificação e critério de saída, para outra sessão continuar sem reler o histórico.
- Autônoma: quando você pedir para planejar uma função grande, uma refatoração ou um roteiro que atravessa várias sessões. O agente grava o plano em `plans/`. Não usa o comando `/blueprint` e não instala o ECC.
- Manual: criar branch, abrir pull request, commit e push. O plano descreve esses passos. Executar cada um espera o seu sim. Tarefa pequena ou "faz logo" não gera plano.
- Você pode dizer: "monta o plano para separar o módulo de negociações" ou "quebra essa refatoração em passos".

---

### vega-mapa-clientes

- Arquivo: `.agents/skills/vega-mapa-clientes/SKILL.md`
- Função: mapa de clientes no índice, com DDD, estado e filtros. A dica do mouse é o balão curto `.mapa-dica` (nome do estado, cidade, região e números), instalado na criação da vista. As barras soltas usam `VegaBarras`.
- Autônoma: quando a tarefa mexe no mapa ou numa barra Vega.
- Você pode dizer: "ajusta o mapa de clientes".

### sigma-cruzamento

- Arquivo: `.agents/skills/sigma-cruzamento/SKILL.md`
- Função: o quadro das cinco planilhas na página Erros. O grafo do sigma não é desenhado nessa tela.
- Autônoma: quando a tarefa mexe nesse quadro.
- Você pode dizer: "muda o quadro de faltas".

### dc-cruzado

- Arquivo: `.agents/skills/dc-cruzado/SKILL.md`
- Função: dois gráficos de linha do dc.js que se filtram ao clique, em Atendentes e Insucessos.
- Autônoma: quando a tarefa mexe nesses dois gráficos.

### d3-cruzamento

- Arquivo: `.agents/skills/d3-cruzamento/SKILL.md`
- Função: barras D3 de quantos IDs faltam em cada planilha.
- Autônoma: quando a tarefa mexe nessa contagem visual.

### dygraphs-series

- Arquivo: `.agents/skills/dygraphs-series/SKILL.md`
- Função: série no tempo com zoom por arraste. Não substitui os gráficos Recharts já existentes.
- Autônoma: quando a tarefa mexe numa série dygraphs.

### echarts-erros

- Arquivo: `.agents/skills/echarts-erros/SKILL.md`
- Função: barras ECharts dos tipos de falta, com zoom e clique que filtra a tabela.
- Autônoma: quando a tarefa mexe nesse gráfico.

### gsap-belloscar

- Arquivo: `.agents/skills/gsap-belloscar/SKILL.md`
- Função: linha do tempo da abertura e inclinação do fundo na página Erros. A tabela de IDs fica parada.
- Autônoma: quando a tarefa mexe na abertura ou nesse fundo.

### three-abertura

- Arquivo: `.agents/skills/three-abertura/SKILL.md`
- Função: referência histórica do anel WebGL. A abertura vigente (`IndiceAbertura`) usa o logo BC em 2.5D (GSAP), fecha só no clique/Escape e não usa timeout de sessão.
- Autônoma: quando a tarefa mexe na abertura do índice.

### motion-abertura

- Arquivo: `.agents/skills/motion-abertura/SKILL.md`
- Função: hover do botão Entrar e a entrada do mapa. O pacote instalado é `motion`.
- Autônoma: quando a tarefa mexe nesse botão ou nessa entrada.

### motion-performance

- Arquivo: `.agents/skills/motion-performance/SKILL.md`
- Função: animar com transform e opacity. O mapa não ganha blur contínuo.
- Autônoma: quando a tarefa adiciona movimento.

### remotion-limite

- Arquivo: `.agents/skills/remotion-limite/SKILL.md`
- Função: Remotion gera vídeo e pode exigir licença de empresa. Não entra neste site.
- Autônoma: quando alguém pedir para instalar Remotion aqui.

### video-maker-limite

- Arquivo: `.agents/skills/video-maker-limite/SKILL.md`
- Função: o video-maker não é clonado neste projeto.
- Autônoma: quando alguém pedir esse repositório aqui.

### hyperframes-limite

- Arquivo: `.agents/skills/hyperframes-limite/SKILL.md`
- Função: HyperFrames renderiza vídeo. A abertura continua ao vivo.
- Autônoma: quando alguém pedir HyperFrames neste site.

### higgsfield-limite

- Arquivo: `.agents/skills/higgsfield-limite/SKILL.md`
- Função: Higgsfield treina modelo em GPU. Os números do painel vêm das planilhas.
- Autônoma: quando alguém pedir Higgsfield aqui.

### agencia-indice

- Arquivo: `.agents/skills/agencia-indice/SKILL.md`
- Função: o índice mostra o que as planilhas têm. Não clona o repositório agency-agents.
- Autônoma: quando a tarefa mexe no índice ou na página Erros.

### grill-mapa

- Arquivo: `.agents/skills/grill-mapa/SKILL.md`
- Função: o mapa fica no índice, abre com todo o período e os filtros já definidos. Não reabre essas escolhas sem pedido novo.
- Autônoma: quando a tarefa mexe no mapa.

### nexus-mapper

- Arquivo: `.agents/skills/nexus-mapper/SKILL.md`
- Fonte: [haaaiawd/nexus-skills](https://skills.sh/haaaiawd/nexus-skills/nexus-mapper)
- Função: protocolo PROBE e base `.nexus-map/` para cold start nas sessões.
- Mista: gera o mapa sozinha; commit dos artefatos espera o fluxo da tarefa.

### system-atlas

- Arquivo: `.agents/skills/system-atlas/SKILL.md`
- Fonte: [inkboard/system-atlas](https://skills.sh/inkboard/system-atlas/system-atlas)
- Função: um arquivo de dados vira mapa visual e `SYSTEM.md` (decisões, fluxos, perguntas).
- Mista: rascunha o atlas; revisão humana quando a decisão mudar.

### context-map

- Arquivo: `.agents/skills/context-map/SKILL.md`
- Fonte: [github/awesome-copilot](https://skills.sh/github/awesome-copilot/context-map)
- Função: mapa de contexto antes de implementar (arquivos, deps, testes, riscos).
- Autônoma: quando a tarefa for mudar código existente.

### ghost-repo-context

- Arquivo: `.agents/skills/ghost-repo-context/SKILL.md`
- Fonte: [ghostsecurity/skills](https://skills.sh/ghostsecurity/skills/ghost-repo-context)
- Função: detecta o projeto e escreve `repo.md` com arquitetura.
- Mista: gera o resumo; versionar `repo.md` faz parte da tarefa de mapa.

### codebase-onboarding

- Arquivo: `.agents/skills/codebase-onboarding/SKILL.md`
- Fonte: [affaan-m/ecc](https://skills.sh/affaan-m/ecc/codebase-onboarding)
- Função: onboarding estruturado alinhado a `AGENTS.md` e ao catálogo de páginas.
- Mista: prepara o guia; não sobrescreve `AGENTS.md` inteiro sem pedido.

### codebase-learner

- Arquivo: `.agents/skills/codebase-learner/SKILL.md`
- Fonte: [pahlevikun/levistack](https://skills.sh/pahlevikun/levistack) (skill `codebase-learner`; ex-super-codebase-learner)
- Função: estado atual do código; modo `site-ia` para hierarquia de páginas/URLs do produto.
- Mista: documenta o que existe; não inventa blueprint greenfield.

### d3-visualization

- Arquivo: `.agents/skills/d3-visualization/SKILL.md`
- Fonte: [lyndonkl/claude](https://skills.sh/lyndonkl/claude/d3-visualization)
- Função: viz D3 sob medida (force graph, hierarquia) no Mapa do Site.
- Autônoma: quando a tarefa pede mapa gráfico animado/interativo no atlas.

### cinematic-web

- Arquivo: `.agents/skills/cinematic-web/SKILL.md`
- Fonte: [anasdorbani/cinematic-web-skill](https://skills.sh/anasdorbani/cinematic-web-skill/cinematic-web)
- Função: direção de motion cinematográfica (sem Three nas dashboards).
- Mista: guia a apresentação; respeita `motion-performance` e reduced-motion.

### presentation-building

- Arquivo: `.agents/skills/presentation-building/SKILL.md`
- Fonte: [joao-aires/agent-skills-public](https://skills.sh/joao-aires/agent-skills-public/presentation-building)
- Função: estrutura de apresentação (seções, teclado). Substitui `ai-vibe-slides` (repo unclecatvn só tinha Odoo nesta instalação).
- Mista: quando montar `#/apresentacao`.

### design-taste-frontend

- Arquivo: `.agents/skills/design-taste-frontend/SKILL.md`
- Fonte: [Leonxlnx/taste-skill](https://skills.sh/leonxlnx/taste-skill/design-taste-frontend)
- Função: audit e redesign de telas existentes sem quebrar comportamento.
- Mista: quando pedir cara profissional / tirar look de app de IA.

### design-distinctive-ui

- Arquivo: `.agents/skills/design-distinctive-ui/SKILL.md`
- Fonte: [bugroo/design-distinctive-ui](https://skills.sh/bugroo/design-distinctive-ui/design-distinctive-ui)
- Função: modos Redesign/Polish anti-slop com direção visual específica.
- Mista: polir ou redesenhar uma superfície (ex. Apresentação).

## Quando algo novo chegar

Quem adicionar skill, rule, hook, MCP ou plugin atualiza este arquivo na mesma tarefa, com:

1. Nome, caminho e função em uma frase.
2. O que dispara sozinho.
3. O que você diz para usar na mão.
4. O que exige um sim (enviar, publicar, commit, push, fechar issue).
5. A data no topo desta página.

Skill que só lê, rascunha ou revisa dentro do projeto nasce autônoma. Skill que envia, publica, commita, faz push ou fecha issue nasce manual.
