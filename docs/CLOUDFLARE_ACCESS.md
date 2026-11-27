# Cloudflare Access — proteção grátis do site

Trava `https://andressacarmetrics.com.br` **antes** de carregar páginas e JSON.  
Quem acessa: digita o **e-mail** → recebe **código** → entra. Sem entregar o código-fonte.

Plano: **Cloudflare Zero Trust Free** (até 50 usuários autenticados).

> **Atenção (GitHub Free):** tornar o repo `belloscar-leads` **privado** **desliga** o GitHub Pages.  
> Por isso a proteção do site (Access) e esconder o código são passos separados — ver [Fase B](#fase-b--esconder-o-código-opcional-grátis).

---

## O que a pessoa vê

1. Abre o link do site  
2. Tela da Cloudflare pede o e-mail  
3. Recebe PIN em ~1 minuto (`noreply@notify.cloudflare.com`)  
4. Digita o PIN e acessa normalmente (Campanhas, Agendamentos, etc.)

Só entram e-mails que você listar na política.

---

## Fase A — Proteger o site (obrigatória)

### Pré-requisitos

- [ ] Conta Cloudflare (grátis): https://dash.cloudflare.com/sign-up  
- [ ] Acesso ao DNS do domínio na HostGator (para trocar nameservers)  
- [ ] Lista de e-mails autorizados (equipe + quem for receber resultados)

### A1. Colocar o domínio na Cloudflare

1. No dashboard Cloudflare → **Add a site** → `andressacarmetrics.com.br`  
2. Escolha o plano **Free**  
3. Cloudflare vai escanear os DNS atuais (A / AAAA / CNAME do GitHub Pages). Confira se ficam parecidos com o que a HostGator já tem, por exemplo:
   - apex (`@`) → registros **A** do GitHub Pages  
   - `www` → **CNAME** → `andressabarrakreia-arch.github.io`  
4. Cloudflare mostra **2 nameservers** (ex.: `xxx.ns.cloudflare.com`). Anote.

### A2. Trocar nameservers na HostGator

1. Painel HostGator → domínio `andressacarmetrics.com.br` → DNS / Nameservers  
2. Troque de “HostGator” para **custom** e cole os 2 nameservers da Cloudflare  
3. Salve. Propagação: minutos a algumas horas. Na Cloudflare o status vira **Active**.

Enquanto isso o site continua no ar na maior parte do tempo; não mexa no `public/CNAME` do repo.

### A3. Ativar login por e-mail (One-time PIN)

1. Cloudflare dashboard → **Zero Trust** (pode pedir criar org Zero Trust — plano **Free**)  
2. **Integrations** → **Identity providers** → **Add new** → **One-time PIN**  
3. Salve

### A4. Criar a aplicação Access

1. Zero Trust → **Access controls** → **Applications** → **Add an application**  
2. Tipo: **Self-hosted**  
3. Nome: `BellosCar Resultados`  
4. Public hostname:
   - Domain: `andressacarmetrics.com.br`  
   - Path: `/` (protege o site inteiro)  
5. Se quiser cobrir `www` também, adicione outro hostname `www.andressacarmetrics.com.br` na mesma app (ou app separada com a mesma política).

### A5. Política Allow (quem pode entrar)

Crie policy **Allow**:

| Campo | Valor |
|--------|--------|
| Action | Allow |
| Include | **Emails** — um a um, ou **Emails ending in** `@empresa.com` se quiser domínio inteiro |
| Login methods | One-time PIN |

Exemplos de Include:

- `Emails` → `andressa@…`, `diretor@…`, `cliente@…`  
- ou `Emails ending in` → `@belloscar.com.br` (só se todos usarem esse domínio)

**Importante:** se deixar “qualquer e-mail”, a tela de login aparece, mas qualquer um pode pedir código. Sempre restrinja a lista.

Session duration sugerida: **24 hours** ou **7 days** (equipe interna).

Salve a application.

### A6. Testar

1. Abra uma janela anônima → `https://andressacarmetrics.com.br`  
2. Deve pedir e-mail Cloudflare Access  
3. Com e-mail **autorizado**: recebe PIN → entra no hub  
4. Com e-mail **não autorizado**: não recebe PIN útil / acesso negado  
5. Confirme que JSON direto também trava, ex.:  
   `https://andressacarmetrics.com.br/data/agendamentos-dataset.json`

### A7. Como enviar para outras pessoas

Mensagem típica:

> Link: https://andressacarmetrics.com.br/#/campanhas  
> Na tela da Cloudflare, use este e-mail: fulano@empresa.com  
> Você recebe um código no e-mail — não precisa de senha fixa nem do GitHub.

Para liberar alguém novo: edite a policy → adicione o e-mail → Save.  
Para revogar: remova o e-mail da policy (não precisa trocar senha de todo mundo).

---

## Fase B — Esconder o código (opcional, grátis)

No **GitHub Free**, Pages só publica de repo **público**. Opções:

| Opção | Custo | Esconde código? | Site protegido? |
|--------|-------|-----------------|-----------------|
| Só Fase A (Access) | Grátis | Não (repo público) | Sim |
| Repo privado + GitHub Pro + Access | Pago (Pro) | Sim | Sim |
| **Migrar para Cloudflare Pages** + repo privado + Access | Grátis | Sim | Sim |

Recomendado se precisar esconder o código sem pagar GitHub Pro: **Cloudflare Pages** apontando para o mesmo domínio, repo privado, Access já na frente.

Passos resumidos (fazer depois da Fase A estável):

1. GitHub → Settings do repo → **Change visibility** → Private (só depois do Pages novo no ar)  
2. Cloudflare → **Workers & Pages** → Create → Connect to Git → `belloscar-leads`  
3. Build: `npm run build` · Output: `dist` (conforme Vite)  
4. Custom domain: `andressacarmetrics.com.br` (DNS já na Cloudflare)  
5. Desligar GitHub Pages no repo para não haver dois origins  
6. Manter a mesma Access application no hostname

---

## Checklist rápido

- [ ] Domínio Active na Cloudflare  
- [ ] Nameservers HostGator → Cloudflare  
- [ ] Identity provider One-time PIN  
- [ ] Application Self-hosted no apex (+ www se usar)  
- [ ] Policy Allow só com e-mails da lista  
- [ ] Teste anônimo + teste JSON  
- [ ] (Opcional) Fase B — Cloudflare Pages + repo privado  

---

## Problemas comuns

| Sintoma | O que checar |
|---------|----------------|
| Site não abre / DNS error | Nameservers ainda não propagaram; status da zona na Cloudflare |
| Login pede e-mail mas ninguém recebe PIN | E-mail fora da policy; pasta spam; allowlist `notify.cloudflare.com` |
| “PIN already used” | Antivírus/link scanner abriu o e-mail — pedir código novo |
| Ainda dá para ver o código no GitHub | Esperado na Fase A; fazer Fase B |
| Repo privado e site sumiu | GitHub Free + Pages: publicar de novo via Cloudflare Pages (Fase B) |

---

## Relação com o PIN do app (`GateLogin` / `adminAuth`)

O Access é a trava **externa** (forte). O PIN interno do React continua útil só para Gestão (`#/indice/gestao`) como segunda camada na máquina de quem já passou no Access.  
Não substitui o Access para compartilhar resultados com segurança.
