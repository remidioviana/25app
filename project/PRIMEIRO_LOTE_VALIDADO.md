# Primeiro lote: RAG e três modelos em avaliação

Os cinco apps abaixo concluíram ao menos um diagnóstico integrado com inferência Groq real, ferramentas locais, recuperação BM25 e três IDs distintos informados pelo provedor. Os inputs eram exemplos sintéticos do repositório; as fontes eram oficiais ou snapshot oficial explicitamente selecionado. Todos os resultados do perfil de três modelos terminaram com `requires_human_review`.

| App | Fonte | Prova de grafo com três modelos |
|---|---|---|
| Himayah | PDPL: snapshot revisado, sem alegação de leitura nova no runner | [43864001094](https://github.com/remidioviana/25app/actions/runs/43864001094) |
| Iqamah | ICP Golden Residency: leitura HTTPS | [43867467664](https://github.com/remidioviana/25app/actions/runs/43867467664) |
| Istithmar | DMCC Schedule of Charges: leitura HTTPS | [43864001094](https://github.com/remidioviana/25app/actions/runs/43864001094) |
| Munagasah | eSupply: página informativa, não edital individual | [43862903821](https://github.com/remidioviana/25app/actions/runs/43862903821) |
| Sahil | DEWA Move-in: leitura HTTPS | [43867467664](https://github.com/remidioviana/25app/actions/runs/43867467664) |

Roteamento observado no perfil `three-model-evaluation`: planner `openai/gpt-oss-20b`; specialist `openai/gpt-oss-120b`; critic `qwen/qwen3.8-27b`. O Qwen é **Preview**. O padrão permanente do código continua com dois IDs de produção. O perfil de avaliação exige opt-in e três identidades efetivas distintas; não substitui secret/configuração no servidor de hospedagem.

O probe [43862526716](https://github.com/remidioviana/25app/actions/runs/43862526716) verificou separadamente funções e reconhecimento de resultado real nos três modelos. O [CI 43867183779](https://github.com/remidioviana/25app/actions/runs/43867183779), no commit 41e661e, passou **193 testes Python, 48 mobile, typecheck, lint e configurações das 25 variantes**. São provas de escopos diferentes: transporte, grafo sintético e regressões/configuração.

## O que permanece pendente

- Aceitação do fluxo primário com documentos autênticos e contexto suficiente por app.
- Verificação factual/jurídica dos achados, requisitos, valores, datas de publicação e aplicabilidade.
- Fluxo nativo principal completo em dispositivos iOS/Android e acessibilidade da interação real.
- Backend permanente com segredo protegido, orçamento e limites de uso definidos; GitHub Actions é ambiente de verificação.
- Assinatura, distribuição e submissão às lojas/competição.

Nenhuma escrita governamental, submissão de proposta, aprovação, instalação assinada ou release foi executada. O portfólio mantém esses portões falsos. Os vinte apps restantes não recebem selo de três modelos por compartilharem o motor.

## Continuidade autorizada

Priorizar fonte/trecho exato e documento original nas análises dos cinco; avançar nos fluxos nativos e testes de entrada ausente/falha; preparar implantação do backend sem expor chave; então repetir aceitação com um caso autêntico por domínio. Preservar o design. Não repetir inferência já aprovada sem mudança relevante ou falha nova. Os alertas recorrentes devem usar o commit, CI e evidências mais recentes, separando fatos históricos da última tentativa.

## Rastreabilidade do relatório exportado

O Markdown exportado inclui um índice de afirmações e seus trechos registrados, com texto exato, fonte, data fornecida e data de recuperação quando disponíveis. Referências sem passagem registrada aparecem explicitamente como ausentes. Esse vínculo não verifica suporte factual, autenticidade do documento, aplicabilidade jurídica ou atualização da fonte. Afirmações baseadas na entrada ou em cálculo mantêm a classificação original do modelo.

A contingência de modelos foi publicada separadamente e validada por consulta autenticada, sem nova inferência: [relatório](evidence/groq-fallback-catalogue-verified.json). Ela preserva os papéis padrão; Qwen continua Preview com opt-in.

O índice exportado preserva `doc` e `chunk` quando registrados e inclui SHA-256 do texto UTF-8 exato de cada passagem. O hash identifica o trecho exportado; não certifica o documento original nem sua autenticidade. O registro [de CI](evidence/github-code-checks.json) foi atualizado para a execução 43935644962, no commit 3500354 (207 testes Python), anterior a esta ampliação.
