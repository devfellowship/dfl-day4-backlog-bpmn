import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Format only: field names and value types of out/<caso>.json. The values are graded by the hidden tests.
type Schema = { types: string[]; required?: boolean; keys?: Record<string, Schema>; values?: Schema; items?: Schema };

const kind = (v: unknown) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);

function check(value: unknown, s: Schema, path: string, errors: string[]) {
  const k = kind(value);
  if (!s.types.includes("any") && !s.types.includes(k)) return void errors.push(`${path}: esperado ${s.types.join(" | ")}, veio ${k}`);
  if (k === "object" && s.values) for (const [key, val] of Object.entries(value as object)) check(val, s.values, `${path}.${key}`, errors);
  if (k === "object" && s.keys) {
    const obj = value as Record<string, unknown>;
    for (const [key, sub] of Object.entries(s.keys)) {
      if (key in obj) check(obj[key], sub, `${path}.${key}`, errors);
      else if (sub.required) errors.push(`${path}.${key}: campo faltando`);
    }
    for (const key of Object.keys(obj)) if (!(key in s.keys)) errors.push(`${path}.${key}: campo que não existe no formato`);
  }
  if (k === "array" && s.items) (value as unknown[]).forEach((item, i) => check(item, s.items!, `${path}[${i}]`, errors));
}

const STAGES: Record<string, Schema> = {
  "processo": {
    "types": [
      "object"
    ],
    "keys": {
      "raias": {
        "required": true,
        "types": [
          "object"
        ],
        "values": {
          "types": [
            "array"
          ],
          "items": {
            "types": [
              "string"
            ]
          }
        }
      },
      "fluxos": {
        "required": true,
        "types": [
          "array"
        ],
        "items": {
          "types": [
            "object"
          ],
          "keys": {
            "de": {
              "required": true,
              "types": [
                "string"
              ]
            },
            "para": {
              "required": true,
              "types": [
                "string"
              ]
            },
            "condicao": {
              "required": true,
              "types": [
                "null",
                "string"
              ]
            }
          }
        }
      },
      "gateways": {
        "required": true,
        "types": [
          "array"
        ],
        "items": {
          "types": [
            "object"
          ],
          "keys": {
            "tipo": {
              "required": true,
              "types": [
                "string"
              ]
            },
            "no": {
              "required": true,
              "types": [
                "string"
              ]
            }
          }
        }
      },
      "caminho_critico": {
        "required": true,
        "types": [
          "object"
        ],
        "keys": {
          "tarefas": {
            "required": true,
            "types": [
              "array"
            ],
            "items": {
              "types": [
                "string"
              ]
            }
          },
          "minutos": {
            "required": true,
            "types": [
              "number"
            ]
          }
        }
      },
      "insights": {
        "required": true,
        "types": [
          "array"
        ],
        "items": {
          "types": [
            "object"
          ],
          "keys": {
            "tipo": {
              "required": true,
              "types": [
                "string"
              ]
            },
            "alvo": {
              "required": true,
              "types": [
                "array"
              ],
              "items": {
                "types": [
                  "string"
                ]
              }
            }
          }
        }
      }
    }
  },
  "instancias": {
    "types": [
      "array"
    ],
    "items": {
      "types": [
        "object"
      ],
      "keys": {
        "id": {
          "required": true,
          "types": [
            "string"
          ]
        },
        "tarefas": {
          "required": true,
          "types": [
            "array"
          ],
          "items": {
            "types": [
              "string"
            ]
          }
        },
        "esforco": {
          "required": true,
          "types": [
            "number"
          ]
        },
        "minutos": {
          "required": true,
          "types": [
            "number"
          ]
        }
      }
    }
  },
  "fila": {
    "types": [
      "object"
    ],
    "keys": {
      "instancias": {
        "required": true,
        "types": [
          "array"
        ],
        "items": {
          "types": [
            "object"
          ],
          "keys": {
            "id": {
              "required": true,
              "types": [
                "string"
              ]
            },
            "termino": {
              "required": true,
              "types": [
                "string"
              ]
            }
          }
        }
      },
      "raias": {
        "required": true,
        "types": [
          "object"
        ],
        "values": {
          "types": [
            "object"
          ],
          "keys": {
            "espera": {
              "required": true,
              "types": [
                "number"
              ]
            },
            "fila_maxima": {
              "required": true,
              "types": [
                "number"
              ]
            }
          }
        }
      },
      "gargalo": {
        "required": true,
        "types": [
          "string"
        ]
      }
    }
  },
  "to_be": {
    "types": [
      "object"
    ],
    "keys": {
      "removidas": {
        "required": true,
        "types": [
          "array"
        ],
        "items": {
          "types": [
            "string"
          ]
        }
      },
      "caminho_critico": {
        "required": true,
        "types": [
          "object"
        ],
        "keys": {
          "tarefas": {
            "required": true,
            "types": [
              "array"
            ],
            "items": {
              "types": [
                "string"
              ]
            }
          },
          "minutos": {
            "required": true,
            "types": [
              "number"
            ]
          }
        }
      },
      "instancias": {
        "required": true,
        "types": [
          "array"
        ],
        "items": {
          "types": [
            "object"
          ],
          "keys": {
            "id": {
              "required": true,
              "types": [
                "string"
              ]
            },
            "minutos": {
              "required": true,
              "types": [
                "number"
              ]
            },
            "economia": {
              "required": true,
              "types": [
                "number"
              ]
            }
          }
        }
      }
    }
  }
};

const CASOS = ["exemplo-1","exemplo-2","exemplo-3","exemplo-4","exemplo-5"];

describe("formato da saída", () => {
  for (const caso of CASOS) {
    for (const [etapa, schema] of Object.entries(STAGES)) {
      it(`${caso} · ${etapa}`, () => {
        const file = `out/${caso}.json`;
        expect(existsSync(file), `${file} não existe`).toBe(true);
        const out = JSON.parse(readFileSync(file, "utf8"));
        expect(out, `${file} sem a chave "${etapa}"`).toHaveProperty(etapa);
        const errors: string[] = [];
        check(out[etapa], schema, etapa, errors);
        expect(errors).toEqual([]);
      });
    }
  }
});
