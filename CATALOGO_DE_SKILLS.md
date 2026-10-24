# Catálogo de skills

Atualizado em 2026-10-24.

Este arquivo lista todas as skills do BellosCar Analytics: para que servem aqui e se o agente as usa sozinho ou só quando você pede.

A regra `.cursor/rules/skills-catalogo.mdc` vale em toda conversa. Ela manda o agente consultar este arquivo e atualizá-lo no mesmo dia em que uma skill entrar, sair ou mudar.

## Como ler

| Modo | O que significa |
| --- | --- |
| Autônoma | O agente lê a skill e age quando a situação combina. Você não precisa citar o nome. |
| Manual | Você pede, ou o agente para e espera um sim antes de enviar, publicar, salvar no histórico (commit), enviar ao GitHub (push) ou fechar um issue. |
| Mista | A preparação é autônoma. O passo que sai do seu computador é manual. |

Limite deste projeto: as seis skills vindas do Ant Design foram escritas para o repositório da biblioteca, não para este painel. O agente segue o espírito delas e troca o alvo pelos arquivos daqui. Não publica o pacote `antd` e não cria changelog em inglês e chinês. A skill Graphify é da ferramenta de mapa do código: a leitura do código fica neste computador. A skill Humanizer reescreve texto para parecer escrito por uma pessoa, sem mudar o que o texto afirma.

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

---

## Quando uma skill nova chegar

Quem adicionar a skill atualiza este arquivo na mesma tarefa, com:

1. Nome, caminho do `SKILL.md` e função em uma frase.
2. O que dispara sozinho.
3. O que você diz para usar na mão.
4. O que exige um sim (enviar, publicar, commit, push, fechar issue).
5. A data no topo desta página.

Skill que só lê, rascunha ou revisa dentro do projeto nasce autônoma. Skill que envia, publica, commita, faz push ou fecha issue nasce manual.
