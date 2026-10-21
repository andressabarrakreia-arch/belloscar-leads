---
name: identificar-padroes
description: >-
  Identifica padrões repetidos no desenvolvimento BellosCar e pergunta a
  Andressa antes de virar isso em regra ou skill. Use em toda task de
  interface, filtro, página, botão ou convenção, e sempre que o mesmo
  comportamento aparecer mais de uma vez.
---

# Identificar padrões

Durante o desenvolvimento, observe o que se repete ou está prestes a se repetir: filtro, botão, borda, card, página nova, tom de cor, texto de interface.

## Quando perguntar

Pergunte a Andressa antes de criar regra ou skill quando:

- o mesmo comportamento já existe em duas páginas ou barras
- a task pede algo que páginas futuras também vão precisar
- uma escolha dela (tamanho, cor, alinhamento, texto) serve como padrão

Não crie a regra nem a skill nessa hora. Espere o sim.

## Como perguntar

Uma frase, no fim da resposta, junto do pedido de teste:

"Isso de [padrão] se repetiu. Quer que eu transforme em regra ou em skill?"

Se ela disser que não, não insista nessa task. Se disser que sim, crie só o que ela escolheu.

## Onde gravar

- Regra: `.cursor/rules/*.mdc`, curta, `alwaysApply: true` só se valer em toda conversa.
- Skill: `.cursor/skills/<nome>/SKILL.md`, com `name` e `description` que digam o que faz e quando usar.
