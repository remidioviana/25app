# Munagasah: primeiro diagnóstico RAG com grafo e provedor reais

A execução [43856663815](https://github.com/remidioviana/25app/actions/runs/43856663815) concluiu o grafo com Groq autenticado, exemplos sintéticos e fonte eSupply lida por HTTPS. Evidência sanitizada: `project/evidence/groq-munagasah-rag-verified.json`.

Foram recuperados dois trechos e ambos foram citados. Planner e specialist responderam como GPT-OSS20B; critic respondeu como GPT-OSS120B. A ferramenta local foi recomputada e o hash comparado à análise. Foram três chamadas de papel, com 6.094 tokens totais reportados. Não houve escrita externa.

As tentativas anteriores com o auditor usando a função de entrega falharam com HTTP400 `tool_use_failed`, mesmo após exigir explicitamente a função. O auditor passou a devolver somente dados por JSON schema estrito nos GPT-OSS, conforme a [documentação oficial](https://console.groq.com/docs/structured-outputs). O runtime ainda valida o objeto e rejeita JSON inválido, enum fora do contrato ou tool calls nesse caminho. Modelos customizados mantêm a função explícita. Planner/especialista preservam o caminho de tool calling. A execução de sucesso registrou `json_schema_strict` no auditor.

Isso demonstra o diagnóstico de integração. A página é informação do portal, não edital individual nem emenda. Os inputs são exemplos, não capacidades autenticadas de um fornecedor. A checagem de citações garante IDs recuperados, não veracidade da interpretação. O parecer de um modelo não certifica fatos. O fluxo primário de procurar e analisar um edital autêntico, a submissão e os testes nativos em aparelho permanecem incompletos. O portfólio ganhou um contador separado de diagnósticos sintéticos ao vivo, sem promover `agent_verified` ou `integration_verified`.

## Lote seguinte e recuperação

A execução [43856855111](https://github.com/remidioviana/25app/actions/runs/43856855111), com snapshot jurídico explicitamente selecionado, não concluiu o lote. Himayah importou o snapshot, mas o draft continha afirmação de evidência sem citação e foi rejeitado. Iqamah completou o planner e encontrou HTTP429 com Retry-After de 12 segundos. Os outros três apps não foram tentados após quota. Registro: `project/evidence/groq-first-five-snapshot-run.json`.

A recuperação determinística passa a devolver esse erro de citação ao especialista, sem inventar, preencher ou aceitar a referência. Revisões de citação e revisões pedidas pelo auditor compartilham o máximo de três respostas de especialista; três respostas inválidas falham. Os recibos persistidos também impedem reiniciar o orçamento ao reencaminhar o mesmo run. O limite de 30.000 tokens reportados continua aplicado antes de cada papel. Logs guardam rejeição, motivo e hash do draft. Esse comportamento foi testado com respostas controladas; seu sucesso com Himayah real requer outra prova.

O diagnóstico adiciona intervalo padrão de 15 segundos entre respostas de papéis, limitado/configurável em 0–60 segundos. Esse espaçamento se aplica somente ao processo de diagnóstico e é removido ao terminar; não muda latência padrão da produção nem faz retry automático de quota. O lote ainda para após HTTP429. Espaçamento reduz rajadas, mas não garante quota suficiente. A conta e o plano continuam determinantes.

O catálogo documental também apresenta Muse Spark Open como Preview/Enterprise, não um terceiro modelo de produção geral demonstrado. Foi incluído na guarda explícita de Preview; nenhum acesso ou inferência desse ID foi testado. A verificação de modelos continua baseada nos IDs realmente devolvidos pelo provedor.

A consolidação desta frente passou **178 testes Python**, além dos 48 testes mobile já executados após a correção dos dossiês. O validador de portfólio exige prova RAG bem-sucedida no app correto e rejeita usar um probe de transporte ou resultado de outro app como prova integrada.

## Lote com espaçamento: dois grafos concluídos

O run [43857824132](https://github.com/remidioviana/25app/actions/runs/43857824132) concluiu Munagasah novamente e Sahil. Sahil teve três rodadas e terminou com `requires_human_review`; o diagnóstico RAG passou, mas o modelo não aprovou a conclusão de domínio. O relatório registra 29.105 tokens de resultados de papel aceitos pelo runtime. Não houve HTTP429 nesse run, o que demonstra apenas essa execução espaçada, sem garantir a quota futura.

Himayah falhou no planner; Iqamah e Istithmar concluíram somente o planner. Os três encontraram HTTP400 `tool_use_failed`. Evidência: `project/evidence/groq-first-five-paced-run.json`. A saída de sucesso anterior do auditor em JSON estrito motivou aplicar o mesmo formato de mensagem aos demais papéis nos modelos documentados. Isso não substitui ferramentas: o grafo executa as decisões do plano, busca, leitores e análise de domínio, mantendo recomputação. A função de entrega continua apenas no caminho de modelos customizados sem suporte declarado.

Para schemas estritos, o campo source_ids é obrigatório e o planejador informa [] quando não solicita atualização; a cópia de schema não modifica o contrato legado. Dois testes novos verificam essa exigência e o caminho JSON do planner/especialista. Total local: 181 testes Python aprovados. O contador sintético do portfólio passou a dois; nenhum fluxo primário ou release foi promovido.

## Schema estrito em todos os papéis: nova evidência e falhas restantes

O run [43858874377](https://github.com/remidioviana/25app/actions/runs/43858874377) concluiu Himayah e Iqamah, cada um com uma correção de citação rejeitada pelo validador. Sahil concluiu novamente, com `requires_human_review`. Istithmar chegou ao auditor e falhou com HTTP400; Munagasah falhou no planner nessa repetição, apesar do sucesso histórico. Registro integral sanitizado: `project/evidence/groq-first-five-strict-json-run.json`. Uso reportado dos resultados de papel: 47.995 tokens. Não ocorreu quota nesse run.

O portfólio diferencia quatro sucessos sintéticos históricos de três sucessos na última tentativa por app. O último estado falho do Munagasah permanece visível, sem ser substituído pelo sucesso anterior. Esses contadores não são aceite do código atual, de caso autêntico, de fluxo primário ou de release.

O classificador de erros passou a reconhecer também códigos fixos de JSON/schema e a conservar tipos seguros mesmo quando o código é desconhecido. A leitura do corpo de erro permanece limitada, agora a 64 KiB: um campo failed_generation maior que 8 KiB truncava o JSON antes de extrair o código. O conteúdo é descartado e nunca aparece no relatório. Testes controlados cobrem essa situação; a causa específica do último HTTP400 depende de outra observação segura.

## Código do erro confirmado e recuperação limitada de geração

O [run isolado 43860552993](https://github.com/remidioviana/25app/actions/runs/43860552993) identificou `json_validate_failed` e `invalid_request_error` no Istithmar. O planner respondeu; o especialista falhou na geração do JSON. Esse código não prova que a regra de negócio, uma taxa oficial ou o conteúdo de uma conclusão estivesse incorreto. Evidência: `project/evidence/groq-istithmar-classified-run.json`.

Somente `HTTP400 + json_validate_failed` pode gerar uma segunda requisição do mesmo papel/modelo/schema, com teto explícito de saída ampliado de 2.200 para 4.096 tokens. A resposta de erro e seu failed_generation nunca são usados como resultado. A segunda resposta precisa passar no mesmo schema, enum e verificação de citações. Não existe terceira tentativa desse mecanismo. HTTP401/403/429 e erro de schema inválido não recebem essa regeneração; fallback de modelo é desabilitado na segunda requisição. A ampliação de saída é uma tentativa de recuperação, não uma conclusão demonstrada sobre a causa do JSON inválido.

Os metadados informam quantidade de regenerações, teto usado e ausência de contagem de tokens da tentativa falha. Tokens reportados não representam necessariamente todo consumo cobrado. O limite de três respostas do especialista e o orçamento de tokens reportados continuam sendo limites lógicos do grafo; cada papel pode realizar uma regeneração adicional somente nesse erro específico.

Três regressões novas verificam recuperação controlada, ausência de repetição para quota/auth/schema e interrupção após segunda falha. A suíte completa passou com **187 testes Python**. O funcionamento real da regeneração exige evidência posterior; estes testes usam respostas controladas.
