# Backlog → BPMN → instâncias → fila → TO-BE

Uma pequena empresa tem um backlog solto de histórias de usuário, cada uma com pequenas regras de negócio.
Você é o analista de negócio: desenha o processo (raias, fluxos, gateways), acha o caminho crítico e aponta
onde o processo pode melhorar (etapa 1); roda o processo para pedidos reais (etapa 2); simula a fila com as
pessoas e o expediente de cada raia (etapa 3); e mede quanto o processo otimizado economiza (etapa 4).
Cada etapa usa o resultado da anterior: um erro cedo se propaga.

## Entrada: `casos/<caso>/`

| Arquivo | Conteúdo | Etapa |
|---|---|---|
| `backlog.md` | as histórias (`## H<n> <título>`) e, opcionalmente, uma seção final `## Ajustes` | 1 |
| `papeis.json` | `{ "<raia>": ["<apelido>", ...] }` — cada raia e os nomes pelos quais ela aparece no backlog | 1 |
| `instancias.json` | as execuções reais do processo (ver etapa 2) | 2 e 3 |
| `fila.json` | pessoas e expediente por raia (ver etapa 3) | 3 |

## Saída: `out/<caso>.json`

Um objeto com uma chave por etapa:

```json
{ "processo": { ... }, "instancias": [ ... ], "fila": { ... }, "to_be": { ... } }
```

Ordem dos nós (usada em todas as etapas): `INICIO` primeiro, depois as histórias pelo **número** (`H2` antes de `H10`), `FIM` por último.

# Etapa 1 — `processo`

### Formato de uma história

```
## H4 Escolher fornecedor
Como compras, quero escolher o fornecedor com o melhor preço.
- papel: Compras
- duracao: 15
- depois de: H2, H3
- usa: cotações, orçamento validado
- gera: fornecedor escolhido
- aprova: compra
- se valor a partir de 5000 então H5 senão H6
- volta para: H3 no máximo 2 vezes
```

- A linha `## H<n> ...` abre a história; o id é `H<n>`. O resto do título e as frases que **não** começam com `- ` são só texto.
- `papel` e `duracao` (minutos, inteiro) sempre existem. As demais linhas são opcionais.
- `depois de`, `usa` e `gera` são listas separadas por vírgula.

## Regras da etapa 1

1. **Última versão vale.** Se o mesmo id aparece em dois blocos `## H<n>`, vale **só o bloco de baixo, por inteiro**: linha que ele não repete deixa de existir (não herda nada do bloco de cima).
2. **Raia.** O `papel` é comparado, sem diferença de maiúsculas/minúsculas, com o nome da raia e com seus apelidos em `papeis.json`; a história vai para essa raia.
3. **Ajustes.** As linhas da seção `## Ajustes` são aplicadas **depois** de todas as histórias, de cima para baixo, uma por vez:
   - `- Hx não depende mais de Hy` → tira `Hy` do `depois de` de `Hx`.
   - `- Hx passa a depender de Hy` → acrescenta `Hy` ao `depois de` de `Hx`.
   - `- Hx foi cancelada` → `Hx` deixa de existir. Toda história que tinha `Hx` no `depois de` passa a ter, no lugar dele, o `depois de` que `Hx` tinha naquele momento (sem repetir id).
     Os fluxos que saíam de `Hx` (decisão, retrabalho) somem com ela. Nenhuma história cancelada é alvo de `se` ou de `volta para`.
4. **A ordem no arquivo não cria dependência.** Só `depois de`, a decisão (`se ...`) e `volta para` criam fluxos.
5. **Fluxos de dependência.** Para cada `Hy` no `depois de` de `Hx`: fluxo `Hy → Hx`, `condicao: null`. Se `Hy` não existe (nunca foi escrita ou foi cancelada antes), o fluxo é ignorado e `Hx` gera o insight `dependencia_quebrada`.
6. **Decisão (gateway exclusivo).** `- se <campo> <comparação> <número> então Ha senão Hb` na história `Hx` cria um gateway `exclusivo` em `Hx` e dois fluxos: `Hx → Ha` com a condição e `Hx → Hb` com a condição contrária. Vocabulário fixo:

   | No backlog | `condicao` do `então` | `condicao` do `senão` |
   |---|---|---|
   | `acima de N` | `"<campo> > N"` | `"<campo> <= N"` |
   | `a partir de N` | `"<campo> >= N"` | `"<campo> < N"` |
   | `abaixo de N` | `"<campo> < N"` | `"<campo> >= N"` |
   | `até N` | `"<campo> <= N"` | `"<campo> > N"` |

   Ex.: `se valor acima de 1000 então H4 senão H5` → `"valor > 1000"` e `"valor <= 1000"` (um espaço de cada lado do operador). Se o mesmo par `Hx → Ha` também vem de um `depois de`, fica **um só** fluxo, o condicional.
7. **Retrabalho.** `- volta para: Hy` na história `Hx` cria o fluxo `Hx → Hy` com `condicao: "retrabalho"`. Sem `no máximo N vezes`, gera o insight `loop_sem_limite`. Fluxo de retrabalho **não conta** para mais nada: nem INICIO/FIM, nem gateways, nem caminho crítico, nem ancestrais.
8. **INICIO e FIM.** Considere só os fluxos das regras 5 e 6. História sem fluxo de entrada recebe `INICIO → Hx`; história sem fluxo de saída recebe `Hx → FIM` (ambos `condicao: null`).
9. **Gateways** (sem contar retrabalho), em INICIO, nas histórias e em FIM:
   - `exclusivo` — a história tem uma linha `se ...` (regra 6).
   - `paralelo` — o nó tem **2 ou mais** fluxos de saída com `condicao: null` (fluxos condicionais não contam).
   - `juncao` — o nó tem **2 ou mais** fluxos de entrada (de qualquer tipo, menos retrabalho).
   Um mesmo nó pode ter mais de um gateway.
10. **Caminho crítico.** Entre todos os caminhos de INICIO até FIM (fluxos das regras 5, 6 e 8, incluindo os dois lados de toda decisão), o de **maior soma de `duracao`**. Empate: vence o caminho cuja sequência de ids é menor, comparando posição a posição pelo número (`H2` < `H10`).

## Insights (catálogo fechado)

Cada insight é `{ "tipo", "alvo" }`. Só existem estes 6 tipos:

| tipo | Quando | `alvo` |
|---|---|---|
| `paralelizar` | um fluxo `Ha → Hb` com `condicao: null` entre duas histórias em que **nenhum** item do `gera` de `Ha` aparece no `usa` de `Hb` (vale só o `gera` da própria `Ha`, não de histórias anteriores; comparação sem diferença de maiúsculas/minúsculas). Um por fluxo. | `[Ha, Hb]` |
| `aprovacao_redundante` | duas histórias com o mesmo `aprova`, na **mesma raia**, e uma é ancestral da outra (existe caminho de fluxos não-retrabalho de uma até a outra). Histórias em lados diferentes de uma decisão, sem caminho entre elas, **não** contam. Um por par. | `[Ha, Hb]` |
| `gargalo` | uma raia cuja soma de `duracao` das histórias do caminho crítico é **maior que** metade dos minutos do caminho crítico (exatamente a metade não conta). | `[<raia>]` |
| `handoff_excessivo` | o caminho crítico troca de raia **3 ou mais** vezes entre histórias seguidas. | as histórias do caminho crítico que **recebem** a troca (a de depois, em cada troca) |
| `loop_sem_limite` | um `volta para` sem `no máximo N vezes` (regra 7). | as 2 histórias do laço (quem volta e para onde), **em ordem de nó** — ex.: "H9 volta para H8" → `["H8", "H9"]` |
| `dependencia_quebrada` | a história cita no `depois de` um id que não existe (regra 5). Um por história, mesmo com vários ids quebrados. | `[Hx]` |

## Saída da etapa 1: chave `processo`

```json
"processo": {
  "raias": { "compras": ["H2", "H4"], "financeiro": ["H3"], "vendas": [] },
  "fluxos": [
    { "de": "INICIO", "para": "H1", "condicao": null },
    { "de": "H4", "para": "H5", "condicao": "valor >= 5000" },
    { "de": "H9", "para": "H8", "condicao": "retrabalho" },
    { "de": "H10", "para": "FIM", "condicao": null }
  ],
  "gateways": [ { "tipo": "paralelo", "no": "INICIO" }, { "tipo": "exclusivo", "no": "H4" } ],
  "caminho_critico": { "tarefas": ["H1", "H2", "H4"], "minutos": 85 },
  "insights": [ { "tipo": "gargalo", "alvo": ["compras"] }, { "tipo": "paralelizar", "alvo": ["H3", "H4"] } ]
}
```

- `raias`: **todas** as raias de `papeis.json` (inclusive as vazias), cada uma com os ids de suas histórias em ordem de nó. Histórias canceladas não aparecem.
- `fluxos`: todos (regras 5 a 8), ordenados por `de` e depois por `para`, na ordem de nó.
- `gateways`: ordenados por `no` (ordem de nó) e depois por `tipo` em ordem alfabética.
- `caminho_critico.tarefas`: ids **na ordem do caminho**, sem `INICIO`/`FIM`; `minutos` = soma das durações.
- `insights`: ordenados por `tipo` (alfabética) e depois por `alvo` (comparando posição a posição, ids pela ordem de nó). Dentro de cada `alvo`, ids em ordem de nó. Sem insight → `[]`.

# Etapa 2 — `instancias`

O processo da etapa 1 roda para cada caso real de `instancias.json`, com gente de sobra e sem relógio de expediente.

```json
{ "instancias": [
  { "id": "PC-101", "chegada": "D1 08:00", "dados": { "valor": 5000 }, "retrabalhos": { "H9": 2 } }
] }
```

- `dados`: o valor de cada campo usado nas decisões (`se <campo> ...`). Campo que nenhuma decisão usa é ignorado.
- `retrabalhos`: `{ "Hx": n }` = quantas vezes `Hx` mandou voltar nessa instância. Ausente = 0.
- `chegada`: só é usada na etapa 3.

11. **Quem é executado.** Use os fluxos das regras 5 e 6 (retrabalho fica à parte, regra 13). `INICIO` é executado. Um fluxo é **percorrido** quando a origem foi executada e a condição é verdadeira para os `dados` da instância (`condicao: null` é sempre verdadeira; `"valor >= 5000"` com valor 5000 é verdadeira). Uma história é executada se **pelo menos um** fluxo que entra nela é percorrido. História não executada não aparece e ninguém espera por ela.
12. **Quando começa.** Uma história que sai do `INICIO` começa no minuto 0. As demais começam quando **todas** as histórias de onde vem um fluxo percorrido até ela já terminaram. Cada execução dura a `duracao` da história.
13. **Retrabalho.** `retrabalhos: { "Hx": n }` só vale se `Hx` tem `volta para: Hy` (regra 7) **e** `Hx` e `Hy` foram executadas; senão é ignorado. O número de voltas é `n`, mas no máximo `N` quando a linha diz `no máximo N vezes` (sem limite, vale `n`).
    - O **trecho** do retrabalho são as histórias executadas que estão em algum caminho de fluxos percorridos de `Hy` até `Hx` (`Hy` e `Hx` incluídas).
    - Assim que `Hx` termina pela primeira vez, o trecho inteiro é refeito em sequência (uma história por vez, na ordem de nó), e isso se repete uma vez por volta.
    - Só depois da última repetição `Hx` conta como terminada para quem vem depois dela. Quem depende de outra história do trecho (que não seja `Hx`) usa o término da primeira execução dela; histórias fora do trecho não se repetem.
    - O retrabalho só dispara na primeira execução de `Hx`; as repetições não disparam outro.
14. **Fim.** A instância termina quando a sua última execução termina.

## Saída da etapa 2: chave `instancias`

Um item por instância, na ordem de `instancias.json`:

```json
"instancias": [ { "id": "PC-101", "tarefas": ["H1", "H3", "H2", "H4", "H5", "H6", "H7", "H8", "H9", "H8", "H9", "H8", "H9", "H10"], "esforco": 210, "minutos": 175 } ]
```

- `tarefas`: todas as execuções (repetições do retrabalho inclusive) ordenadas pelo minuto em que começam; empate → ordem de nó.
- `esforco`: soma das durações de todas as execuções.
- `minutos`: minuto em que a instância termina (regra 14), contando do minuto 0.

# Etapa 3 — `fila`

Agora as mesmas execuções da etapa 2 disputam pessoas de verdade, dentro do expediente.

```json
{
  "expediente": ["08:00-12:00", "13:00-17:00"],
  "raias": {
    "Compras": { "pessoas": 1 },
    "gerente": { "pessoas": 1, "expediente": ["14:00-17:00"] }
  }
}
```

15. **Relógio.** O tempo é contado em minutos corridos: `D1 00:00` é o minuto 0, `D1 08:00` é o minuto 480, `D2 00:00` é o minuto 1440. Todo dia tem o mesmo expediente (não há fim de semana nem feriado). Um intervalo `"HH:MM-HH:MM"` inclui o início e exclui o fim (`08:00-12:00` = do minuto 08:00 até o minuto 11:59); `24:00` é a meia-noite do fim do dia.
16. **Raias.** As chaves de `fila.json` são nomes ou apelidos de raia (como na regra 2). Cada raia usa o `expediente` dela, se tiver; senão, o `expediente` geral.
17. **Pessoas.** Cada execução da etapa 2 (repetições inclusive) precisa de uma pessoa da raia da história. Uma pessoa faz uma execução por vez. Ela só **começa** em minuto de expediente da raia e, depois que começa, vai até o fim: trabalha só nos minutos de expediente da raia, para fora dele e continua de onde parou. Ex.: 20 min começando às 11:50 trabalham 11:50–12:00, param no almoço e terminam às 13:10.
18. **Pronta.** As histórias que saem do `INICIO` ficam prontas na `chegada` da instância. As demais ficam prontas quando termina o que as regras 12 e 13 mandam esperar (as mesmas dependências da etapa 2, agora com o relógio real). Retrabalho: a primeira repetição fica pronta quando `Hx` termina; cada repetição seguinte, quando a anterior termina.
19. **Fila (FIFO por raia).** Em cada minuto de expediente da raia, as pessoas livres pegam as execuções prontas nesta ordem: a que ficou pronta **antes**; empate → a instância que vem antes em `instancias.json`; empate → ordem de nó. Uma execução que termina no momento `t` libera a pessoa e deixa prontas as próximas nesse mesmo `t`.

## Saída da etapa 3: chave `fila`

```json
"fila": {
  "instancias": [ { "id": "PC-101", "termino": "D1 16:35" } ],
  "raias": { "compras": { "espera": 5, "fila_maxima": 1 }, "gerencia": { "espera": 250, "fila_maxima": 3 } },
  "gargalo": "gerencia"
}
```

- `instancias`: na ordem de `instancias.json`; `termino` = momento em que termina a última execução da instância, no formato `D<dia> HH:MM` (hora com dois dígitos). Terminar no fim do minuto 11:59 é `12:00`.
- `raias`: **todas** as raias de `papeis.json` (chave = nome da raia, nunca o apelido):
  - `espera` = soma, sobre as execuções da raia, dos minutos **de expediente da raia** entre ficar pronta e começar (noite e almoço não contam).
  - `fila_maxima` = o maior número de execuções prontas e ainda não começadas na raia, num mesmo minuto de expediente da raia, depois que as pessoas livres pegaram as suas.
- `gargalo`: a raia de maior `espera`; empate → ordem alfabética; se toda `espera` é 0 → `null`.

# Etapa 4 — `to_be`

O processo otimizado: os insights da etapa 1 viram mudanças no desenho.

20. **Mudanças.** Parta dos fluxos entre histórias da etapa 1 (regras 5 e 6) e dos `volta para`. Aplique os insights **na ordem da lista `insights`**, um por vez, sempre sobre o desenho já mudado:
    - `aprovacao_redundante [Ha, Hb]`: sai a história que é **descendente** da outra (a que vem depois no fluxo). Para cada fluxo `X → D` que entrava nela e cada história `S` em que ela desembocava (`D → S`), cria `X → S` com a condição de `X → D` (se já existe um fluxo `X → S`, fica o que existe). Somem todos os fluxos dela e o `volta para` dela. Se uma das duas já saiu, nada muda.
    - `loop_sem_limite`: o `volta para` sem limite passa a valer `no máximo 1 vezes`.
    - `paralelizar [Ha, Hb]`: seja `X → Y` o fluxo sem condição entre as duas (no sentido do fluxo). Ele some, e `Y` ganha uma cópia de cada fluxo que entra em `X` vindo de outra história (mesma condição; se já existe, fica o que existe). Se uma das duas saiu, ou o fluxo já não existe, nada muda.
    - `gargalo`, `handoff_excessivo` e `dependencia_quebrada` não mudam o desenho.
    Depois de tudo, refaça `INICIO` e `FIM` pela regra 8. Nenhum insight novo é calculado.
21. **Medidas.** O caminho crítico do processo novo segue a regra 10. Cada instância roda de novo pela etapa 2 no processo novo, com os mesmos `dados` e `retrabalhos` (retrabalho de história que saiu é ignorado).

## Saída da etapa 4: chave `to_be`

```json
"to_be": {
  "removidas": ["H7"],
  "caminho_critico": { "tarefas": ["H3", "H4", "H5", "H6", "H8", "H9", "H10"], "minutos": 115 },
  "instancias": [ { "id": "PC-101", "minutos": 145, "economia": 30 } ]
}
```

- `removidas`: ids que saíram, em ordem de nó (`[]` se nenhum).
- `caminho_critico`: mesmo formato da etapa 1.
- `instancias`: na ordem de `instancias.json`; `minutos` como na etapa 2 (no processo novo) e `economia` = `minutos` da etapa 2 − `minutos` novos.
