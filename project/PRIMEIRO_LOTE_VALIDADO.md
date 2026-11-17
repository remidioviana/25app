# Primeiro lote: RAG e três modelos em avaliação

Os cinco apps abaixo concluíram ao menos um diagnóstico integrado com inferência Groq real, ferramentas locais, recuperação BM25 e três IDs distintos informados pelo provedor. Os inputs eram exemplos sintéticos do repositório; as fontes eram oficiais ou snapshot oficial explicitamente selecionado. Os resultados históricos da ordem anterior terminaram com `requires_human_review`; o novo diagnóstico do Munagasah descrito ao final terminou com `reviewed_by_model`.

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

A prévia de importação também retorna hashes SHA-256 separados dos bytes recebidos e do texto extraído, tamanho original e autenticidade não verificada. O endpoint de prévia não guarda o arquivo original. Ao salvar pelo cliente mobile, o servidor agora recalcula o recibo e o anexa ao documento, conforme o incremento descrito abaixo. Não constitui aceite com documento autêntico.

## Nova ordem verificada no Munagasah

O [run 44007989450](https://github.com/remidioviana/25app/actions/runs/44007989450), commit 2ccd295, concluiu o diagnóstico sintético com planner GPT-OSS20B, specialist Qwen3.8-27B Preview e critic GPT-OSS120B, todos identificados pelo provedor. Foram três chamadas, 6.304 tokens reportados, quatro passagens recuperadas e uma citada; cálculo recomputado e nenhuma escrita externa. O resultado foi `reviewed_by_model`, sem `requires_human_review`. [Evidência](evidence/groq-120b-last-munagasah-verified.json).

A resposta foi aceita pelo 120B na primeira auditoria; o ramo adicional de resolução de pendências foi testado com transporte/modelos controlados, não exercitado neste run live. Os outros quatro apps ainda têm evidências da ordem anterior. O caso é sintético e usa a página informativa eSupply, sem demonstrar aceite de edital autêntico, dispositivo, implantação ou release. A tentativa 44007434045 com 401/400 continua preservada como falha anterior.

## Importação salva e exportação: incremento comum aos cinco

O cliente mobile conserva o arquivo selecionado até salvar e o servidor reextrai os bytes recebidos para calcular o recibo, sem confiar em hashes declarados pelo cliente. O documento salvo registra hashes do arquivo, texto extraído e texto salvo, além de indicar edição após extração. O recibo acompanha buscas BM25/semânticas e relatórios Markdown; é removido com o documento e isolado por identidade. Os bytes originais não são guardados.

O teste do cliente mobile contra o backend autenticado percorre importação, salvamento, recuperação, execução local e exportação separadamente para Himayah, Iqamah, Istithmar, Munagasah e Sahil. São documentos controlados e execução local, sem nova inferência; isso não equivale a validação em aparelho, documento autêntico ou aceite primário. A UI foi mantida, acrescentando apenas a indicação de edição/importação. O objetivo de entrega continua sendo esses cinco apps, não cinco modelos adicionais.

## Artefatos de execução do lote

`npm run export:first-five`, em `mobile/`, gera bundles Hermes e assets Android/iOS para os cinco apps em `mobile/dist/first-five`, incluindo identidade da variante e hashes. [Verificação local](evidence/first-five-native-exports.json). O workflow manual `Export first-five mobile bundles` disponibiliza esse diretório como artefato, sem credenciais de provedor e sem carregar `.env`. São dez bundles de plataforma, não APKs/IPAs assinados ou prova de instalação.

O backend também passou no contêiner com os cinco fluxos locais, autenticação, execução sem root e dados preservados após recriação. [Verificação](evidence/backend-container-check.json). Para chegar a versões instaláveis e serviço público, faltam projeto Expo/EAS/assinatura, destino de hospedagem/TLS e verificação de dispositivo e casos autênticos. Esses portões permanecem pendentes no portfólio.
