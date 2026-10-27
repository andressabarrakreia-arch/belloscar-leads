# Site IA — BellosCar Análise de Resultados

Modo `site-ia` (codebase-learner). Hierarquia **do produto** como está (HashRouter).

## Audiência

- Equipe (somente leitura): links públicos dos módulos
- Andressa / gestão: PIN admin (`#/indice/gestao`) + gate Erros/Mapa/Apresentação

## Árvore

```
/ (Índice Geral)
├── campanhas/
│   ├── (dashboard)
│   ├── atendentes
│   ├── comparar
│   └── formularios
├── agendamentos/
│   ├── (visão geral)
│   ├── pre-vendas
│   ├── vendedores
│   ├── detalhe
│   ├── portais
│   └── insucessos
├── negociacoes/
│   ├── (visão geral)
│   ├── lancamentos
│   └── vendedores
├── perfil/
├── erros/             [PIN gate]
├── mapa/              [PIN gate]  ← Mapa do Site (atlas + grafo)
├── apresentacao/      [PIN gate]  ← sala de resultados + WhatsApp (texto/PNG)
└── indice/gestao/     [PIN gestão]  ← importar planilhas + exportar clientes
```

Rotas antigas `…/admin` redirecionam para `indice/gestao`.

## Nav do hub (portas)

Campanhas · Agendamentos · Negociações · Perfil · Erros · Mapa do Site · Apresentação  
(Gestão no rodapé, não na grade de portas.)

## URL pattern

`https://andressacarmetrics.com.br/#/<rota>`
