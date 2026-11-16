# Contingência Groq

O catálogo autenticado consultado em 16/11/2026 retornou 11 modelos ativos, dos quais três eram de texto geral elegíveis: `openai/gpt-oss-20b`, `openai/gpt-oss-120b` e `qwen/qwen3.8-27b`. Não foram acrescentados modelos de áudio ou classificadores para preencher cinco posições.

- [Consulta autenticada](https://github.com/remidioviana/25app/actions/runs/43905713925), sem inferência; [relatório](evidence/groq-fallback-catalogue-audit.json).
- [Documentação do catálogo](https://console.groq.com/docs/models). Listagem ativa não comprova permissão de inferência para cada projeto.

`model_provider.py` mantém os papéis padrão e limita a lista a cinco entradas, com três configuradas. Após falha de todas as chaves por 429, conexão ou HTTP 500/502/503/504, consulta novamente o catálogo e tenta cada reserva elegível uma vez. O modelo originalmente solicitado é excluído das reservas. O contrato de ferramentas/JSON é preservado. Falha de autenticação ou de esquema no modelo primário interrompe a chamada; uma reserva que retorna 403 é registrada e ignorada. Falha na consulta de catálogo não autoriza tentar modelos sem confirmação.

Qwen continua Preview e exige `AGENT_ALLOW_PREVIEW_MODELS=1`. O modo de prova com três identidades distintas e chamadas com `allow_fallback=False` não substituem modelos. O padrão permanente continua usando dois IDs de produção para os três papéis.

O histórico registra IDs, status e códigos sanitizados, sem chaves ou corpos brutos. Os testes de contingência usam respostas HTTP controladas; não constituem evidência de recuperação durante uma indisponibilidade real. Esta alteração não comprova aceite primário dos apps, implantação permanente ou release.

Validação da implementação: [catálogo 43926348131](https://github.com/remidioviana/25app/actions/runs/43926348131), três entradas ativas, nenhuma indisponível e limite de cinco respeitado; [relatório](evidence/groq-fallback-catalogue-verified.json). A consulta não executou inferência. Os 206 testes Python passaram localmente.
