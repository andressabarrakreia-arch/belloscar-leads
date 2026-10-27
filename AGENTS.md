# Instruções para agentes (BellosCar Analytics)

## Escopo

- Alterar somente o que foi pedido. Arquivo, refatoração, teste ou documentação fora do pedido exige pergunta e confirmação antes — `escopo-estrito.mdc`
- Essa regra prevalece sobre a atualização automática de documentação abaixo

## Mapa do produto (cold start)

Antes de criar dados, rotas ou páginas, ler nesta ordem:

1. `.nexus-map/INDEX.md` — rotas, JSON, storage, decisões fechadas
2. `SYSTEM.md` — atlas textual (fluxos e decisões)
3. `repo.md` — overview da arquitetura
4. Rule alwaysApply: `.cursor/rules/mapa-orientacao-dados.mdc`

Não recriar `public/data/*.json` com chaves inventadas. Campanhas/agendamentos/Erros usam `agendamentos-dataset.json`; negociações usam `negociacoes-dataset.json`; `dataset.json` é legado. Mapa geográfico de clientes fica no índice (`grill-mapa`). `#/mapa` é o atlas do site (produto), com o mesmo PIN de gate que `#/erros`.

## Documentação

Quando o pedido incluir documentação, ou depois de confirmação explícita, atualizar:

- `CHANGELOG.md`, `ROADMAP.md`
- `README.md` / `DEPLOY.md` quando URLs, módulos ou deploy mudarem
- `CATALOGO_DE_PAGINAS.md` no formato `nome=link` quando páginas/módulos mudarem
- `.env.example` só com placeholders (sem segredos reais)
- Regras em `.cursor/rules/` quando novas convenções forem definidas

## Antes de criar

- Analisar o existente e reutilizar padrões — `reuse-before-create.mdc` / skill `reuse-before-create`
- Stack tipada — `typescript-stack.mdc`
- Isolamento de storage por módulo — `module-storage-isolation.mdc`
- Agendamentos: dedupe só por `id` — `scheduling-dedupe.mdc`
- Negociações: merge por nº da Negociação — `negociacoes-dedupe.mdc`

## Segurança

- Nunca commit tokens/senhas/`.env` real — `.cursor/rules/no-secrets-in-repo.mdc`
- Token GitHub só em `localStorage` no Admin

## Módulos e links distintos

- Hub / título principal: **Análise de Resultados** (`index.html` + `document.title` por módulo)
- Registro: `src/modules/registry.ts`
- **Análise de Campanhas** → `#/campanhas`
- **Análise de Agendamentos** → `#/agendamentos` (Vendas Web · Andressa Barra)
  - Abas: Visão Geral · Pré-Vendas · Vendedores · Detalhe · Portais · Insucessos
- **Análise de Negociações** → `#/negociacoes` (loja)
  - Abas: Visão Geral · Lançamentos · Vendedores
- **Gestão do Índice** → `#/indice/gestao` (PIN) — único lugar de import e export; sem abas Gestão nos módulos
- Novos módulos: rota `#/<modulo>/...`, layout próprio, link de equipe separado
- Regras: `multi-module-pages.mdc`, `belloscar-product-prefs.mdc` (alwaysApply)
- Depois de task aprovada: pedir teste e perguntar se publica — `testar-e-perguntar-publicacao.mdc`
- Atualização e aprimoramento (sem apagar as regras anteriores): design system em `typescript-stack.mdc`; commit, publicação e qualidade em `testar-e-perguntar-publicacao.mdc`; comunicação com a usuária iniciante em `belloscar-product-prefs.mdc`

## Atualização e aprimoramento

As seções anteriores deste arquivo permanecem. O texto abaixo foi acrescentado por completo, sem resumo e sem corte.

### Regra de Design System / UI (Frontend)

**Padrão obrigatório de UI/UX:**

- Quando o frontend for **React 18+**, a stack padrão de layout e componentes **deve ser**:
  - **React**
  - **ShadCN/UI**
  - **Tailwind CSS**

- Caso o projeto **não** seja React 18+ (ou não permita o uso de ShadCN por qualquer motivo técnico), a ordem de preferência de fallback é:
  1. **Bootstrap** (preferencial)
  2. **Material UI (MUI)**

**Ao aplicar esta regra, o agent deve:**

1. Refatorar **gráficos, cards, tabelas, modais, formulários, listas e qualquer componente visual** existente para o novo design system escolhido.
2. Alterar o **conceito visual e a lógica de apresentação** dos componentes (não apenas “trocar a lib” superficialmente).
3. Manter **100% da funcionalidade atual** — nenhuma quebra de comportamento, fluxo, estado, validações ou integrações é aceitável.
4. Garantir que a refatoração seja **incremental e segura**, preservando a lógica de negócio existente.

Sempre que for criar ou alterar interface, o agent deve seguir esta hierarquia de decisão antes de começar a codificar.

---

### Regra de Commit e Entrega (obrigatória)

**Após finalizar qualquer task:**

1. O Cursor (e todos os seus agents) **deve** lembrar o usuário de:
   - Testar a alteração localmente
   - Confirmar que está tudo funcionando corretamente
   - Avisar quando estiver **ok para commit e publicação**

2. Só depois da **aprovação explícita do usuário** o agent deve:
   - Sugerir a mensagem de commit
   - Preparar o commit
   - Orientar a publicação (se aplicável)

**Frase padrão que o agent deve usar ao finalizar uma task:**

> “Task finalizada e testada por mim.  
> Por favor, valide no seu ambiente e me avise quando estiver **ok para eu fazer o commit e publicar**.”

Esta regra se aplica a **toda** task concluída (feature, bugfix, refatoração, ajuste visual, etc.).

**[ADICIONADO PELO GROK]**  
Além disso, o agent **deve se certificar** de que a task realmente foi commitada e publicada. Não basta apenas lembrar: após a aprovação do usuário, o agent deve:

- Executar ou guiar o commit
- Confirmar que o commit foi realizado com sucesso
- Orientar ou executar a publicação (deploy)
- Informar claramente ao usuário o status final: “Commit realizado e publicado com sucesso” ou “Commit realizado. Falta apenas o deploy (me avise se quiser que eu te guie)”

Nunca deixar a task “no ar” sem confirmação de commit e publicação.

---

### **[ADICIONADO PELO GROK]** Regra de Comunicação com Usuário Iniciante (Vibe Coder)

A usuária principal deste projeto é uma **vibe coder**: pessoa sem experiência formal em programação, criação de sites, portais ou desenvolvimento técnico. Ela cria soluções para o trabalho de gestão e depende totalmente do Cursor e dos agents.

**Por isso, todos os agents (incluindo o Grok) devem:**

1. **Tratar a usuária como iniciante absoluto**
   - Nunca assumir que ela sabe termos técnicos básicos (ex: commit, deploy, branch, prop, state, componente, etc.).
   - Sempre explicar de forma simples, clara e paciente o que está sendo feito e por quê.

2. **Explicar tudo de forma acessível**
   - Usar linguagem simples e exemplos do dia a dia sempre que possível.
   - Evitar jargões. Se precisar usar um termo técnico, explicar imediatamente o que ele significa.
   - Exemplo: em vez de só dizer “vou fazer o commit”, dizer “vou salvar permanentemente essas alterações no histórico do projeto (isso se chama commit)”.

3. **Sempre entregar um resumo claro ao final de cada task**
   O agent deve, obrigatoriamente, finalizar toda task com um bloco no seguinte formato:

   ---
   **Resumo do que foi feito:**
   - [lista simples do que o agent implementou]

   **O que você precisa fazer manualmente agora:**
   - [lista bem curta e clara do que a usuária precisa fazer]
   - Se não houver nada manual, escrever: “Nada. Está tudo pronto por aqui.”

   **Próximo passo sugerido:**
   - [o que ela deve fazer em seguida, se houver]
   ---

4. **Minimizar ao máximo as ações manuais da usuária**
   - Sempre que possível, o agent deve fazer ele mesmo (ou guiar passo a passo de forma extremamente detalhada).
   - Só deixar para a usuária as coisas que realmente precisam de decisão ou ação dela (ex: testar visualmente, aprovar, informar senha, etc.).
   - Preferir soluções “prontas para usar” em vez de deixar configurações incompletas.

5. **Nunca deixar a usuária “perdida”**
   - Se algo der errado, explicar o problema de forma simples e já oferecer a solução.
   - Se precisar de alguma informação dela, perguntar de forma clara e objetiva, sem termos técnicos desnecessários.

---

### **[ADICIONADO PELO GROK]** Regra de Qualidade e Segurança de Entrega

1. Antes de considerar qualquer task finalizada, o agent deve:
   - Testar o máximo possível do que foi implementado
   - Verificar se não quebrou nada que já existia
   - Confirmar que a interface ficou consistente com o design system definido

2. Nunca entregar código “pela metade” ou com avisos de erro aparentes.

3. Se a task envolver mudanças visuais, o agent deve deixar a interface o mais polida e profissional possível, considerando que o público final são pessoas de gestão (não desenvolvedores).

4. Sempre que houver dúvida sobre prioridade (beleza vs funcionamento), **funcionamento vem primeiro**. Depois melhora o visual.

---

### Observação final para o Cursor e todos os agents

Você (Cursor + agents) é o **responsável técnico** deste projeto.  
Estas regras são de cumprimento obrigatório.

A usuária confia em vocês para entregar soluções funcionais, bonitas e com o mínimo de esforço possível da parte dela.  
Sempre priorize clareza, paciência e redução de atrito.

Sempre que iniciar uma nova task relacionada a frontend, entrega de código ou qualquer alteração, verifique e aplique estas orientações antes de começar a implementação.
- Spec abas: [`docs/REESTRUTURACAO_ABAS.md`](docs/REESTRUTURACAO_ABAS.md) — abas **dentro** de Agendamentos; Campanhas e Negociações são módulos separados
