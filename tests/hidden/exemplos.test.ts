import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const out = (caso: string) => JSON.parse(readFileSync(`out/${caso}.json`, 'utf8'));

describe('casos exemplo', () => {
  it("exemplo-1 (simples)", () => {
    expect(out("exemplo-1")).toEqual({
      "raias": {
        "colaborador": [
          "H1",
          "H2"
        ],
        "financeiro": [
          "H3",
          "H5",
          "H6",
          "H7"
        ],
        "gestor": [
          "H4"
        ]
      },
      "fluxos": [
        {
          "de": "INICIO",
          "para": "H1",
          "condicao": null
        },
        {
          "de": "H1",
          "para": "H2",
          "condicao": null
        },
        {
          "de": "H2",
          "para": "H3",
          "condicao": null
        },
        {
          "de": "H2",
          "para": "H7",
          "condicao": null
        },
        {
          "de": "H3",
          "para": "H4",
          "condicao": "valor > 1000"
        },
        {
          "de": "H3",
          "para": "H5",
          "condicao": "valor <= 1000"
        },
        {
          "de": "H4",
          "para": "H5",
          "condicao": null
        },
        {
          "de": "H5",
          "para": "H6",
          "condicao": null
        },
        {
          "de": "H6",
          "para": "FIM",
          "condicao": null
        },
        {
          "de": "H7",
          "para": "FIM",
          "condicao": null
        }
      ],
      "gateways": [
        {
          "tipo": "paralelo",
          "no": "H2"
        },
        {
          "tipo": "exclusivo",
          "no": "H3"
        },
        {
          "tipo": "juncao",
          "no": "H5"
        },
        {
          "tipo": "juncao",
          "no": "FIM"
        }
      ],
      "caminho_critico": {
        "tarefas": [
          "H1",
          "H2",
          "H3",
          "H4",
          "H5",
          "H6"
        ],
        "minutos": 90
      },
      "insights": [
        {
          "tipo": "handoff_excessivo",
          "alvo": [
            "H3",
            "H4",
            "H5"
          ]
        },
        {
          "tipo": "paralelizar",
          "alvo": [
            "H5",
            "H6"
          ]
        }
      ]
    });
  });

  it("exemplo-2 (brabo: apelido, história refinada, ajuste, a partir de, retrabalho)", () => {
    expect(out("exemplo-2")).toEqual({
      "raias": {
        "compras": [
          "H2",
          "H4",
          "H6"
        ],
        "financeiro": [
          "H3",
          "H9",
          "H10"
        ],
        "gerencia": [
          "H5",
          "H7"
        ],
        "solicitante": [
          "H1",
          "H8"
        ]
      },
      "fluxos": [
        {
          "de": "INICIO",
          "para": "H1",
          "condicao": null
        },
        {
          "de": "INICIO",
          "para": "H3",
          "condicao": null
        },
        {
          "de": "H1",
          "para": "H2",
          "condicao": null
        },
        {
          "de": "H2",
          "para": "H4",
          "condicao": null
        },
        {
          "de": "H3",
          "para": "H4",
          "condicao": null
        },
        {
          "de": "H4",
          "para": "H5",
          "condicao": "valor >= 5000"
        },
        {
          "de": "H4",
          "para": "H6",
          "condicao": "valor < 5000"
        },
        {
          "de": "H5",
          "para": "H6",
          "condicao": null
        },
        {
          "de": "H6",
          "para": "H7",
          "condicao": null
        },
        {
          "de": "H6",
          "para": "H8",
          "condicao": null
        },
        {
          "de": "H7",
          "para": "H10",
          "condicao": null
        },
        {
          "de": "H8",
          "para": "H9",
          "condicao": null
        },
        {
          "de": "H9",
          "para": "H8",
          "condicao": "retrabalho"
        },
        {
          "de": "H9",
          "para": "H10",
          "condicao": null
        },
        {
          "de": "H10",
          "para": "FIM",
          "condicao": null
        }
      ],
      "gateways": [
        {
          "tipo": "paralelo",
          "no": "INICIO"
        },
        {
          "tipo": "exclusivo",
          "no": "H4"
        },
        {
          "tipo": "juncao",
          "no": "H4"
        },
        {
          "tipo": "juncao",
          "no": "H6"
        },
        {
          "tipo": "paralelo",
          "no": "H6"
        },
        {
          "tipo": "juncao",
          "no": "H10"
        }
      ],
      "caminho_critico": {
        "tarefas": [
          "H3",
          "H4",
          "H5",
          "H6",
          "H8",
          "H9",
          "H10"
        ],
        "minutos": 115
      },
      "insights": [
        {
          "tipo": "aprovacao_redundante",
          "alvo": [
            "H5",
            "H7"
          ]
        },
        {
          "tipo": "handoff_excessivo",
          "alvo": [
            "H4",
            "H5",
            "H6",
            "H8",
            "H9"
          ]
        },
        {
          "tipo": "loop_sem_limite",
          "alvo": [
            "H8",
            "H9"
          ]
        }
      ]
    });
  });

  it("exemplo-3 (brabo: até, retrabalho com limite, aprovações em lados da decisão, metade exata)", () => {
    expect(out("exemplo-3")).toEqual({
      "raias": {
        "credito": [
          "H2",
          "H4",
          "H5",
          "H6",
          "H7"
        ],
        "diretoria": [
          "H8"
        ],
        "logistica": [
          "H11"
        ],
        "vendas": [
          "H1",
          "H3",
          "H9",
          "H10"
        ]
      },
      "fluxos": [
        {
          "de": "INICIO",
          "para": "H1",
          "condicao": null
        },
        {
          "de": "H1",
          "para": "H2",
          "condicao": null
        },
        {
          "de": "H1",
          "para": "H3",
          "condicao": null
        },
        {
          "de": "H2",
          "para": "H4",
          "condicao": null
        },
        {
          "de": "H3",
          "para": "H4",
          "condicao": null
        },
        {
          "de": "H4",
          "para": "H3",
          "condicao": "retrabalho"
        },
        {
          "de": "H4",
          "para": "H5",
          "condicao": "limite <= 20000"
        },
        {
          "de": "H4",
          "para": "H6",
          "condicao": "limite > 20000"
        },
        {
          "de": "H5",
          "para": "H7",
          "condicao": null
        },
        {
          "de": "H6",
          "para": "H7",
          "condicao": null
        },
        {
          "de": "H7",
          "para": "H8",
          "condicao": null
        },
        {
          "de": "H7",
          "para": "H10",
          "condicao": null
        },
        {
          "de": "H8",
          "para": "H9",
          "condicao": null
        },
        {
          "de": "H9",
          "para": "H11",
          "condicao": null
        },
        {
          "de": "H10",
          "para": "FIM",
          "condicao": null
        },
        {
          "de": "H11",
          "para": "FIM",
          "condicao": null
        }
      ],
      "gateways": [
        {
          "tipo": "paralelo",
          "no": "H1"
        },
        {
          "tipo": "exclusivo",
          "no": "H4"
        },
        {
          "tipo": "juncao",
          "no": "H4"
        },
        {
          "tipo": "juncao",
          "no": "H7"
        },
        {
          "tipo": "paralelo",
          "no": "H7"
        },
        {
          "tipo": "juncao",
          "no": "FIM"
        }
      ],
      "caminho_critico": {
        "tarefas": [
          "H1",
          "H3",
          "H4",
          "H6",
          "H7",
          "H8",
          "H9",
          "H11"
        ],
        "minutos": 210
      },
      "insights": [
        {
          "tipo": "handoff_excessivo",
          "alvo": [
            "H4",
            "H8",
            "H9",
            "H11"
          ]
        },
        {
          "tipo": "paralelizar",
          "alvo": [
            "H7",
            "H10"
          ]
        }
      ]
    });
  });

  it("exemplo-4 (brabo: dependência quebrada, refinada sem gera, passa a depender, abaixo de)", () => {
    expect(out("exemplo-4")).toEqual({
      "raias": {
        "atendimento": [
          "H1",
          "H2",
          "H7"
        ],
        "estoque": [
          "H3",
          "H8"
        ],
        "financeiro": [
          "H5"
        ],
        "qualidade": [
          "H4",
          "H6"
        ]
      },
      "fluxos": [
        {
          "de": "INICIO",
          "para": "H1",
          "condicao": null
        },
        {
          "de": "H1",
          "para": "H2",
          "condicao": null
        },
        {
          "de": "H2",
          "para": "H3",
          "condicao": null
        },
        {
          "de": "H3",
          "para": "H4",
          "condicao": null
        },
        {
          "de": "H3",
          "para": "H8",
          "condicao": null
        },
        {
          "de": "H4",
          "para": "H5",
          "condicao": "dias < 8"
        },
        {
          "de": "H4",
          "para": "H6",
          "condicao": "dias >= 8"
        },
        {
          "de": "H4",
          "para": "H8",
          "condicao": null
        },
        {
          "de": "H5",
          "para": "H7",
          "condicao": null
        },
        {
          "de": "H6",
          "para": "H7",
          "condicao": null
        },
        {
          "de": "H7",
          "para": "FIM",
          "condicao": null
        },
        {
          "de": "H8",
          "para": "FIM",
          "condicao": null
        }
      ],
      "gateways": [
        {
          "tipo": "paralelo",
          "no": "H3"
        },
        {
          "tipo": "exclusivo",
          "no": "H4"
        },
        {
          "tipo": "juncao",
          "no": "H7"
        },
        {
          "tipo": "juncao",
          "no": "H8"
        },
        {
          "tipo": "juncao",
          "no": "FIM"
        }
      ],
      "caminho_critico": {
        "tarefas": [
          "H1",
          "H2",
          "H3",
          "H4",
          "H6",
          "H7"
        ],
        "minutos": 140
      },
      "insights": [
        {
          "tipo": "dependencia_quebrada",
          "alvo": [
            "H8"
          ]
        },
        {
          "tipo": "gargalo",
          "alvo": [
            "qualidade"
          ]
        },
        {
          "tipo": "handoff_excessivo",
          "alvo": [
            "H3",
            "H4",
            "H7"
          ]
        },
        {
          "tipo": "paralelizar",
          "alvo": [
            "H2",
            "H3"
          ]
        }
      ]
    });
  });

  it("exemplo-5 (super pica: cancelamento, empate no caminho, tudo junto)", () => {
    expect(out("exemplo-5")).toEqual({
      "raias": {
        "comercial": [
          "H1",
          "H6",
          "H7",
          "H20"
        ],
        "compras": [
          "H9"
        ],
        "diretoria": [
          "H5",
          "H8"
        ],
        "engenharia": [
          "H2",
          "H4",
          "H10",
          "H15",
          "H17"
        ],
        "financeiro": [
          "H11",
          "H18",
          "H19"
        ],
        "obra": [
          "H12",
          "H13",
          "H14",
          "H16"
        ]
      },
      "fluxos": [
        {
          "de": "INICIO",
          "para": "H1",
          "condicao": null
        },
        {
          "de": "H1",
          "para": "H2",
          "condicao": null
        },
        {
          "de": "H1",
          "para": "H4",
          "condicao": null
        },
        {
          "de": "H2",
          "para": "H4",
          "condicao": null
        },
        {
          "de": "H4",
          "para": "H5",
          "condicao": "valor > 50000"
        },
        {
          "de": "H4",
          "para": "H6",
          "condicao": "valor <= 50000"
        },
        {
          "de": "H4",
          "para": "H10",
          "condicao": null
        },
        {
          "de": "H5",
          "para": "H6",
          "condicao": null
        },
        {
          "de": "H6",
          "para": "H7",
          "condicao": null
        },
        {
          "de": "H7",
          "para": "H8",
          "condicao": null
        },
        {
          "de": "H8",
          "para": "H4",
          "condicao": "retrabalho"
        },
        {
          "de": "H8",
          "para": "H9",
          "condicao": null
        },
        {
          "de": "H8",
          "para": "H12",
          "condicao": null
        },
        {
          "de": "H9",
          "para": "H11",
          "condicao": null
        },
        {
          "de": "H10",
          "para": "H9",
          "condicao": null
        },
        {
          "de": "H11",
          "para": "FIM",
          "condicao": null
        },
        {
          "de": "H12",
          "para": "H13",
          "condicao": null
        },
        {
          "de": "H13",
          "para": "H14",
          "condicao": null
        },
        {
          "de": "H14",
          "para": "H15",
          "condicao": null
        },
        {
          "de": "H15",
          "para": "H16",
          "condicao": "pendencias > 0"
        },
        {
          "de": "H15",
          "para": "H17",
          "condicao": "pendencias <= 0"
        },
        {
          "de": "H16",
          "para": "H15",
          "condicao": "retrabalho"
        },
        {
          "de": "H16",
          "para": "H17",
          "condicao": null
        },
        {
          "de": "H17",
          "para": "H18",
          "condicao": null
        },
        {
          "de": "H17",
          "para": "H20",
          "condicao": null
        },
        {
          "de": "H18",
          "para": "H19",
          "condicao": null
        },
        {
          "de": "H19",
          "para": "FIM",
          "condicao": null
        },
        {
          "de": "H20",
          "para": "FIM",
          "condicao": null
        }
      ],
      "gateways": [
        {
          "tipo": "paralelo",
          "no": "H1"
        },
        {
          "tipo": "exclusivo",
          "no": "H4"
        },
        {
          "tipo": "juncao",
          "no": "H4"
        },
        {
          "tipo": "juncao",
          "no": "H6"
        },
        {
          "tipo": "paralelo",
          "no": "H8"
        },
        {
          "tipo": "juncao",
          "no": "H9"
        },
        {
          "tipo": "exclusivo",
          "no": "H15"
        },
        {
          "tipo": "juncao",
          "no": "H17"
        },
        {
          "tipo": "paralelo",
          "no": "H17"
        },
        {
          "tipo": "juncao",
          "no": "FIM"
        }
      ],
      "caminho_critico": {
        "tarefas": [
          "H1",
          "H2",
          "H4",
          "H5",
          "H6",
          "H7",
          "H8",
          "H12",
          "H13",
          "H14",
          "H15",
          "H16",
          "H17",
          "H18",
          "H19"
        ],
        "minutos": 1275
      },
      "insights": [
        {
          "tipo": "aprovacao_redundante",
          "alvo": [
            "H5",
            "H8"
          ]
        },
        {
          "tipo": "dependencia_quebrada",
          "alvo": [
            "H12"
          ]
        },
        {
          "tipo": "gargalo",
          "alvo": [
            "obra"
          ]
        },
        {
          "tipo": "handoff_excessivo",
          "alvo": [
            "H2",
            "H5",
            "H6",
            "H8",
            "H12",
            "H15",
            "H16",
            "H17",
            "H18"
          ]
        },
        {
          "tipo": "loop_sem_limite",
          "alvo": [
            "H4",
            "H8"
          ]
        },
        {
          "tipo": "paralelizar",
          "alvo": [
            "H1",
            "H4"
          ]
        }
      ]
    });
  });
});
