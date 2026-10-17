# Backlog → BPMN com insights de otimização

Uma pequena empresa tem um backlog solto de histórias de usuário, cada uma com pequenas regras de negócio.
Você desenha o processo (raias, fluxos, gateways), acha o caminho crítico e aponta onde o processo pode melhorar.

## Entrada: `casos/<caso>/`

| Arquivo | Conteúdo |
|---|---|
| `backlog.md` | as histórias (`## H<n> <título>`) e, opcionalmente, uma seção final `## Ajustes` |
| `papeis.json` | `{ "<raia>": ["<apelido>", ...] }` — cada raia e os nomes pelos quais ela aparece no backlog |

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

## Regras

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
| `loop_sem_limite` | um `volta para` sem `no máximo N vezes` (regra 7). | `[Hx, Hy]` (quem volta e para onde) |
| `dependencia_quebrada` | a história cita no `depois de` um id que não existe (regra 5). Um por história, mesmo com vários ids quebrados. | `[Hx]` |

## Saída: `out/<caso>.json`

```json
{
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

Ordem dos nós: `INICIO` primeiro, depois as histórias pelo **número** (`H2` antes de `H10`), `FIM` por último.

- `raias`: **todas** as raias de `papeis.json` (inclusive as vazias), cada uma com os ids de suas histórias em ordem de nó. Histórias canceladas não aparecem.
- `fluxos`: todos (regras 5 a 8), ordenados por `de` e depois por `para`, na ordem de nó.
- `gateways`: ordenados por `no` (ordem de nó) e depois por `tipo` em ordem alfabética.
- `caminho_critico.tarefas`: ids **na ordem do caminho**, sem `INICIO`/`FIM`; `minutos` = soma das durações.
- `insights`: ordenados por `tipo` (alfabética) e depois por `alvo` (comparando posição a posição, ids pela ordem de nó). Dentro de cada `alvo`, ids em ordem de nó. Sem insight → `[]`.
