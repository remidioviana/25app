# API local

Todas as respostas são JSON, exceto arquivos estáticos. POST requer `Content-Type: application/json`. Quando `APP_TOKEN` está definido, envie `Authorization: Bearer <token>`. O Host precisa corresponder a localhost, 127.0.0.1 ou `APP_HOSTNAME`, com a porta configurada. Não há CORS permissivo.

| Método | Caminho | Uso |
|---|---|---|
| GET | `/api/config` | Disponibilidade do modelo e necessidade de token |
| GET | `/api/agents` | 25 manifestos, schemas e exemplos |
| POST | `/api/agents/{agent}/runs` | `{goal, input, mode: "local" ou "model", example: boolean}`; cabeçalho opcional `Idempotency-Key` |
| GET | `/api/agents/{agent}/runs` | 50 execuções mais recentes |
| GET | `/api/runs/{id}` | Estado, entrada, resultado, hash e eventos |
| POST | `/api/runs/{id}/cancel` | Corpo `{}`; cancelamento cooperativo |
| POST | `/api/runs/{id}/retry` | Corpo `{}`; reexecuta falha/cancelamento |
| POST | `/api/runs/{id}/review` | `{decision: "accepted" ou "rejected", artifact_hash}` |
| GET | `/api/runs/{id}/export` | Relatório completo JSON |
| GET | `/api/agents/{agent}/documents` | Documentos do agente |
| POST | `/api/agents/{agent}/documents` | `{title, text, source, as_of}`; data ISO ou string vazia |
| DELETE | `/api/agents/{agent}/documents/{id}` | Remove documento da busca futura |
| POST | `/api/agents/{agent}/search` | `{query}` retorna até 6 trechos com citações |

Não há endpoint para efetuar transações externas. Eventos contêm saídas de ferramentas e podem conter dados pessoais fornecidos. Proteja o diretório de dados e os relatórios exportados.

## Adições da versão 3

- `mode: "team"` em criação de execução: exige LangGraph instalado e modelo configurado.
- `GET /api/config`: informa `langgraph_available` e `embedding_configured`.
- `POST /api/agents/{agent}/index` com `{}`: indexação semântica explícita; envia textos ao provedor. Até 512 trechos por pedido.
- `POST /api/agents/{agent}/search`: aceita `semantic: true`; resposta inclui `method` e `warnings`.
- `GET /api/runs/{id}/export/markdown`: relatório UTF-8.
- `GET /api/runs/{id}/export/csv`: CSV UTF-8 com BOM e proteção contra interpretação de fórmulas.
- `GET /api/runs/{id}/export/ics?date=AAAA-MM-DD`: Rafiq/Sawm, horários flutuantes, sem sincronização externa.

O relatório do modo equipe inclui `plan`, `draft`, `critique` e `decision`. `requires_human_review` sinaliza pendências após o limite de revisões; não representa aprovação automática. `reviewed_by_model` significa apenas que o revisor de IA aceitou o rascunho.

## Adições da versão 4

Todas as rotas protegidas usam o bearer token para determinar a base de dados. `X-User` e IDs no corpo não mudam o escopo.

| Método | Caminho | Corpo/resultado |
|---|---|---|
| GET | `/api/me` | Identidade autenticada e modo multiusuário |
| POST | `/api/import/preview` | `{filename, base64}` → texto, formato, avisos; não ingere automaticamente |
| POST | `/api/agents/{agent}/intake` | `{request}` → perguntas ou proposta estruturada; não inicia run |
| GET | `/api/agents/{agent}/schedules` | Agendamentos do agente e usuário |
| POST | `/api/agents/{agent}/schedules` | `{goal,input,mode,example,first_at,every_seconds,max_runs}` |
| POST | `/api/schedules/{id}/disable` | `{}` → desativa ocorrências futuras |
| GET | `/api/agents/{agent}/connectors` | Conectores autorizados, sem URLs ou segredos |
| POST | `/api/agents/{agent}/connectors/{connector}/pull` | `{}` → fotografia validada e recibo local de leitura |

`first_at` é ISO 8601 com fuso; intervalo 0 é execução única. Recorrências aceitam 60–31536000 segundos e 1–100 execuções. Cancelamento do agendamento não cancela runs já criados. A preparação de dados por IA retorna `needs_information` ou `ready_for_review`; `run_started` permanece falso.
