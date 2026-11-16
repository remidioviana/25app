# Groq: configuração segura e três modelos distintos

Verificação documental: 2026-11-16T06:07:03+00:00. Pesquisa em documentação oficial pública, sem usar credencial, chamar endpoint autenticado, coletar segredo ou publicar alterações. A ferramenta de pesquisa conseguiu ler as páginas; GETs diretos dessas páginas no ambiente retornaram HTTP403. Isso não prova falha da API Groq nem conexão do aplicativo com ela.

## Contrato e disponibilidade

A [referência oficial](https://console.groq.com/docs/api-reference#models-list) documenta `GET https://api.groq.com/openai/v1/models`, com `Authorization: Bearer` fornecido pelo backend, e lista JSON de modelos. A inferência usa `POST https://api.groq.com/openai/v1/chat/completions`. Exemplos antigos da referência não são catálogo vigente.

Um GET bem-sucedido valida a requisição autenticada e o catálogo retornado naquele instante. Não demonstra inferência, tool calling ou permissão efetiva de cada modelo. [Permissões de organização/projeto](https://console.groq.com/docs/model-permissions) podem bloquear um modelo com HTTP403; as restrições da organização prevalecem. A disponibilidade real depende também de plano, quotas e condições da conta. Nenhuma delas foi inspecionada nesta pesquisa.

## Roteamento proposto, configurável no servidor

| Papel | ID candidato distinto | Estado documental | Preço indicativo USD por milhão de tokens de entrada / saída |
|---|---|---|---|
| planner | `openai/gpt-oss-20b` | Production | 0,075 / 0,30 |
| specialist | `openai/gpt-oss-120b` | Production | 0,15 / 0,60 |
| critic | `qwen/qwen3.8-27b` | Preview; avaliação apenas | 0,80 / 4,00 |

Fontes: [catálogo](https://console.groq.com/docs/models) e [card Qwen](https://console.groq.com/docs/model/qwen/qwen3.8-27b). Os GPT-OSS têm contexto documentado de 131.072 tokens e saída máxima de 65.536; Qwen tem saída máxima de 16.384. O card e a tabela divergem ligeiramente no contexto Qwen (131.042 / 131.072): usar limite conservador, sem depender da borda. Preços e limites precisam ser reconferidos no momento da execução.

Não há prova de três modelos gerais de texto **Production** acessíveis à conta. O terceiro candidato acima é Preview e não deve receber selo de produção. Se a implantação exigir três IDs de produção, manter configuração incompleta até encontrar e testar um terceiro elegível, eventualmente sob contrato enterprise. Não substituir silenciosamente o terceiro por um ID já usado, nem declarar três modelos porque existem três papéis.

A configuração deve aceitar um ID por papel, exigir os três valores distintos no modo estrito e registrar modelo solicitado e modelo efetivamente retornado. As variáveis são `AGENT_PLANNER_MODEL`, `AGENT_SPECIALIST_MODEL` e `AGENT_AUDITOR_MODEL` (papel critic). `AGENT_REQUIRE_DISTINCT_MODELS=1` ativa exigência estrita no runtime; `AGENT_ALLOW_PREVIEW_MODELS=1` é necessário ao escolher o Qwen Preview conhecido. Os padrões atualizados usam GPT-OSS20B em planner e specialist e GPT-OSS120B em critic: continuam sendo somente dois IDs únicos, sem alegação de três modelos distintos. A revisão inicial encontrou três papéis usando somente dois IDs, com `llama-3.3-70b-versatile` compartilhado: esse é o problema a corrigir, não uma execução autenticada comprovada. Fallback que colapse os três IDs precisa interromper o modo estrito ou declarar degradação explícita.

## Deprecações relevantes

A [página oficial de deprecações](https://console.groq.com/docs/deprecations) informa:

- `llama-3.1-8b-instant` e `llama-3.3-70b-versatile`: encerramento para free/developer em 16/08/2026; exceção enterprise com compromisso contratual. A tabela atual ainda os mostra como Enterprise.
- `qwen/qwen3-32b` e Llama 4 Scout: encerramento free/developer em 17/07/2026.
- `qwen/qwen3.6-27b`: encerramento free/developer em 14/09/2026; sucessor indicado `qwen/qwen3.8-27b`.
- `groq/compound` e `groq/compound-mini`: encerramento em 21/09/2026.

Portanto, não usar uma recomendação antiga de migração para Qwen 3.6 sem seguir também sua deprecação posterior. Checar catálogo, card, histórico e resposta autenticada conjuntamente.

## Ferramentas e prova exigida

A [visão de tool use](https://console.groq.com/docs/tool-use/overview) e o [guia local](https://console.groq.com/docs/tool-use/local-tool-calling) documentam definições `tools`, retorno `tool_calls` e continuação com resultado. O código da aplicação executa e valida a função; o modelo não ganha permissão de executar Python ou transações arbitrárias. Suporte documentado não é prova de que o runtime atual o exercitou com cada ID.

Verificação incremental proposta:

1. **Offline:** validar configuração, IDs distintos, endpoint fixo, parsing de modelos, redirecionamentos bloqueados, limites de resposta/tempo e mensagens sem segredos. Usar testes com transportes controlados; custo de inferência externa zero. Não chamar esse resultado de conexão Groq.
2. **Catálogo, somente com `--live`:** ler exclusivamente a nova credencial do ambiente protegido do backend e fazer um GET do catálogo oficial. Não enviar contratos ou dados pessoais. Guardar timestamp UTC, status normalizado, IDs e verificações; nunca cabeçalho de autorização, chave ou corpo bruto de erro. Esse GET não gera completion nem prova permissão de inferência. Não há preço de geração a estimar para ele; não prometer ausência de qualquer contabilização de serviço.
3. **Inferência opcional e explícita:** uma chamada limitada para cada papel, com conteúdo sintético mínimo, timeout e orçamento. Registrar sucesso individual e `usage`, sem credenciais. Listing sozinho não autoriza declarar esse teste executado. Três chamadas simples não provam colaboração.
4. **Loop de ferramenta opcional:** solicitar uma função inofensiva registrada, validar argumentos, executar localmente e devolver resultado. Uma ida e continuação podem exigir duas chamadas por modelo, ou mais conforme o loop; limitar etapas e tokens. Nenhuma ferramenta de escrita externa nesse teste.
5. **Equipe:** tarefa sintética comum com plano, especialidade e crítica independentes, IDs efetivos distintos e artefatos/decisões rastreáveis. Isso verifica a orquestração; os 25 fluxos reais continuam sujeitos a suas provas de domínio.

HTTP401 indica falha de autenticação; HTTP403 pode indicar restrição; HTTP429 exige espera limitada e respeito a quota. Não girar credenciais para contornar rate limits. Falha não pode gerar relatório de sucesso fictício.

## Comandos do verificador

Executar da raiz do repositório, com Python e dependências do projeto disponíveis:

```sh
python scripts/verify_groq.py
python scripts/verify_groq.py --live
python scripts/verify_groq.py --live --probe-models
```

Sem flags, imprime configuração sanitizada e não acessa a rede. `--live` consulta somente o catálogo autenticado. `--probe-models` requer `--live`, faz rodadas mínimas de ferramenta e texto e pode gerar cobrança. O verificador exige três IDs distintos por padrão; `--allow-shared-models` é diagnóstico explícito e não comprova três modelos. Não há argumento CLI para segredo nem carregamento automático de `.env`. A credencial nova deve chegar ao processo como `OPENAI_API_KEY`, protegida pelo ambiente; os IDs de modelo não são segredos.

Exemplo de configuração **sem credencial**, para avaliar o terceiro Preview:

```sh
export AGENT_PLANNER_MODEL=openai/gpt-oss-20b
export AGENT_SPECIALIST_MODEL=openai/gpt-oss-120b
export AGENT_AUDITOR_MODEL=qwen/qwen3.8-27b
export AGENT_REQUIRE_DISTINCT_MODELS=1
export AGENT_ALLOW_PREVIEW_MODELS=1
```

O relatório deve separar ID solicitado no payload e ID informado pelo fornecedor. Se o retorno não identifica inequivocamente o modelo, registrar a limitação; não inferir identidade apenas do papel.

## Entrada protegida pelo GitHub Actions

Passos aplicáveis **depois** que o workflow manual revisado estiver publicado na branch padrão; a criação local não o disponibiliza no GitHub. A documentação oficial confirma o [caminho de secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets) e a [execução manual](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow):

1. Revogar a chave exposta e gerar substituta no Groq. No repositório `remidioviana/25app`, abrir **Settings → Secrets and variables → Actions → Secrets → New repository secret**. Nome: `GROQ_API_KEY`; valor: somente a chave substituta. Clicar **Add secret**. Não usar variável pública nem input do workflow para esse valor.
2. Abrir **Actions**, escolher o workflow manual de verificação Groq e **Run workflow**. Usar a branch revisada. Manter o teste de inferência desativado na primeira execução: o padrão consulta apenas catálogo. Inspecionar resultado sanitizado e disponibilidade dos modelos.
3. Habilitar explicitamente o input de probe apenas quando aceitar o teste de inferência e, se escolhido, o uso do terceiro modelo Preview. O probe dos três papéis faz seis requisições lógicas curtas de completion (ferramenta e continuação por papel), além do catálogo; políticas de repetição podem produzir tentativas adicionais. Não executa transações de domínio nem comprova os 25 produtos.

O workflow recebe o segredo por mapeamento explícito `OPENAI_API_KEY: ${{ secrets.GROQ_API_KEY }}` no ambiente da etapa. Isso **não configura automaticamente** o segredo no servidor do aplicativo, hospedagem cloud ou sessão local. Cada ambiente de execução precisa de provisionamento protegido próprio. `GITHUB_TOKEN` não substitui uma credencial Groq.

O disparo manual exige acesso de escrita e workflow com `workflow_dispatch` na branch padrão. Criar secrets exige permissão adequada no repositório; políticas da organização podem restringir Actions, modelos ou secrets. Sem secret configurado, a expressão retorna vazio e a verificação deve falhar com mensagem sanitizada. Secrets de ambientes e workflows reutilizáveis têm regras adicionais. Não disparar esse teste por PR externo, nem executar código de branch não revisada com a credencial. Máscara automática de logs não dispensa evitar qualquer impressão do segredo.

Os exemplos oficiais consultados divergem em versões maiores de Actions: o README de setup-python apresenta v7, enquanto exemplos gerais de secrets ainda usam checkout v6. Resolver e verificar tags reais dos repositórios oficiais antes de definir a versão; não deduzir que um exemplo antigo representa o último lançamento.

## Segredo e dados

A credencial exposta deve ser revogada no console pelo responsável. Criar substituta somente no ambiente protegido de execução, com escopo de projeto e acesso mínimo; não colar em chat, frontend, arquivo versionado, argumento CLI ou log. O verificador lê a variável protegida, sem solicitar seu valor. Manter endpoint Groq fixo e HTTPS verificado; não aceitar base URL arbitrária junto de uma credencial real nem reenviá-la por redirecionamento. Revisar `.gitignore`, bundle, logs e histórico antes de publicar; ignorar um arquivo não remove um segredo já versionado.

Os [controles de dados](https://console.groq.com/docs/your-data) distinguem metadados de uso, retidos, e conteúdo de inferência, normalmente não retido, com exceções para confiabilidade/abuso e recursos com estado. Não prometer retenção zero universal. Não enviar documentos pessoais, jurídicos, financeiros ou de saúde até definir autorização, minimização, controles de conta e política adequada; os testes iniciais podem usar texto sintético.

## Recursos e custo

O servidor local mantém orquestração, armazenamento, extração e ferramentas. A inferência ocorre na infraestrutura Groq; nenhum GPU local ou download de pesos é necessário para essa integração. Três papéis não significam três processos locais ou execução paralela automática. Limitar concorrência, contexto recuperado, número de ferramentas, tokens de saída e tentativas.

Estimativa de geração: `Σ(tokens_entrada × tarifa_entrada + tokens_saída × tarifa_saída) / 1.000.000`, usando a tarifa específica do ID e plano, incluindo todas as chamadas e repetições. Com 1.000 tokens de entrada e 200 de saída por modelo, uma rodada dos três candidatos teria estimativa indicativa de USD 0,002005, antes de particularidades de faturamento, cache, raciocínio, ferramentas e mudanças de preço. Usar `usage` e cobrança real para reconciliar; o limite de saída não limita sozinho tokens de entrada, total de requisições ou custo global. [Rate limits](https://console.groq.com/docs/rate-limits) dependem do plano e da conta.

Esta frente entregou documentação e desenho verificável. Não realizou conexão autenticada, inferência, teste com a chave exposta, revogação ou publicação.

## Entrega consolidada desta iteração

Implementados roteamento configurável, validação estrita de identidade no grafo, metadados conservadores no mobile e `.github/workflows/verify-groq.yml`. O workflow é exclusivamente manual, com versões de Actions fixadas por SHA verificado nos repositórios oficiais. Não foi disparado sem segredo. Relatórios de catálogo incluem somente contagem e disponibilidade dos IDs configurados, sem listar modelos privados alheios ao teste.

Verificações locais: 144 testes Python e 48 testes mobile aprovados; typecheck, lint, consistência do portfólio e parsing do YAML aprovados. Dois testes de integração executam o grafo real com transporte HTTP simulado: um confirma três identidades retornadas distintas; outro rejeita três aliases que retornem uma única identidade. Esses testes não são chamadas Groq reais. O relatório offline registra ausência de credencial protegida e zero inferências verificadas.

## Primeira prova autenticada de ferramentas

O run [43852202823](https://github.com/remidioviana/25app/actions/runs/43852202823) concluiu seis chamadas lógicas de geração em 16/11/2026: duas por papel, com função local e reconhecimento do resultado. O provedor informou GPT-OSS20B em planner/specialist e GPT-OSS120B em critic. Uso reportado: 1.895 tokens. Evidência sanitizada: `project/evidence/groq-live-tool-probes.json`. Isso comprova inferência e tool roundtrips desses dois modelos naquele ambiente; não três modelos distintos nem o fluxo principal dos aplicativos.

O workflow ganhou o input manual `team_first_five`, desativado por padrão. Quando habilitado, instala as dependências fixadas e executa `scripts/verify_team.py --live`: fontes oficiais novas, indexação BM25 local, grafo real, planner/specialist/critic e recomputação da ferramenta dos primeiros cinco apps. Usa somente exemplos sintéticos do repositório, em banco temporário removido ao terminar. Exige citações pertencentes aos trechos recuperados e identidade retornada em todos os papéis. Um parecer do auditor não certifica a verdade da interpretação. Cada app pode executar até sete chamadas de papel; o job tem timeout de 12 minutos. A execução pode consumir quotas/créditos. Relatórios incluem recibos e hashes, sem chave, texto integral dos documentos ou respostas brutas.

Esse diagnóstico integrado permanece separado da aceitação do fluxo principal com documentos autênticos e dos testes nativos em dispositivo. `agent_verified`, `integration_verified` e releases do portfólio não são promovidos por esse smoke test. O modo sem `--live` não consulta fontes nem inferência. O workflow não configura hospedagem permanente do backend.

## Falhas observadas e contenção

A primeira tentativa integrada do lote está preservada em `project/evidence/groq-team-first-five-attempt.json` (run 43852570949). O runner recebeu HTTP403 na fonte jurídica; outras quatro páginas foram lidas. Nenhum grafo completou: houve HTTP400 e depois HTTP429. Não houve bypass da fonte nem promoção do portfólio. O total de tokens desse relatório antigo mede apenas resultados finais aprovados pelo diagnóstico, não toda requisição eventualmente cobrada antes de falhar.

O diagnóstico passou a parar o lote após quota, permitir seleção `team_app`, registrar papéis concluídos antes da falha e usar dois trechos RAG. O runtime aceita `AGENT_MAX_EVIDENCE_PASSAGES` entre 1 e 24 (padrão seis); a redução pode diminuir cobertura e não substitui recuperação adequada. Erros do provedor registram somente códigos de uma lista fixa e Retry-After numérico; nunca mensagem bruta nem `failed_generation`. Não há repetição automática do lote nem troca de credencial para contornar quota. Regressões locais: 151 testes Python aprovados.

## Última tentativa menor e próximo desbloqueio

O run [43852967314](https://github.com/remidioviana/25app/actions/runs/43852967314), limitado ao Munagasah, parou no preflight: `missing_credentials`. A etapa recebeu valor vazio para `secrets.GROQ_API_KEY`. Não houve requisição ao Groq, instalação do grafo nem nova tentativa de fonte. Evidência: `project/evidence/groq-single-app-preflight.json`. O sucesso anterior continua documentado, mas não prova que o segredo permaneceu disponível. A integração não tem permissão para inspecionar a lista de secrets; não é possível afirmar se foi removido, renomeado ou restringido.

Para retomar, o responsável deve conferir **Repository secrets**, nome exato `GROQ_API_KEY`, no repositório `remidioviana/25app`. Um segredo colocado somente em Environment não chega a este job sem vínculo explícito ao environment. Variável pública não substitui secret. Usar exclusivamente uma chave substituta válida e protegida. Depois executar catálogo e, se aprovado, somente um app por vez.

Tratamento por bloqueio:

- **403 da fonte:** o código preserva a falha. Usar o backend em infraestrutura permitida pela autoridade ou importar o PDF oficial por meio da ingestão já existente, mantendo origem, data de obtenção e hash. Não reenviar credencial Groq à fonte nem trocar User-Agent/IP para contornar restrições. Um snapshot importado não comprova atualização contínua. O diagnóstico atual exige leitura nova e não faz fallback silencioso para snapshot.
- **400 de inferência:** causa ainda não identificada. Capturar apenas código seguro para distinguir `tool_use_failed`, `invalid_request_error` ou outro caso permitido; reproduzir uma chamada pequena e corrigir payload/schema conforme a causa. Contexto menor sozinho não comprova correção do 400. Mensagens e geração bruta do erro continuam fora do relatório.
- **429:** interromper lote, observar Retry-After e limites da conta/modelo; reduzir cadência/contexto e manter fila sequencial. Se a carga necessária exceder a quota contratada, ajustar o plano/limite na conta. Não girar chaves para contornar quota. Não foi realizada mudança de faturamento.

## Credencial restabelecida e contrato de revisão corrigido

O run [43853313100](https://github.com/remidioviana/25app/actions/runs/43853313100) voltou a receber a credencial protegida e leu o eSupply (HTTP200). Planner, specialist e critic responderam; uma segunda resposta de specialist foi registrada, mas a tarefa falhou ao validar `basis` de uma afirmação. Uso reportado dos resultados de papel: 11.253 tokens; falhas podem consumir quota adicional. Isso não comprova sucesso do grafo completo nem que o HTTP400 anterior tinha a mesma causa.

A implementação tinha uma diferença entre schema (`basis` como string livre) e runtime (somente input/calculation/evidence). O schema agora declara enum e a validação local aplica enum; `critic.verdict` também foi limitado a accept/revise/needs_evidence. Valores inválidos continuam falha, sem conversão silenciosa. Duas regressões novas verificam a aceitação dos valores corretos e a rejeição através do adaptador real. Total: 153 testes Python aprovados. Evidência da tentativa: `project/evidence/groq-munagasah-diagnostic.json`.

## Alternativa explícita para a fonte jurídica

O mesmo leitor autorizado conseguiu obter novamente o PDF oficial no ambiente local, preservando HTTPS e o catálogo fixo. A cópia revisável está em `project/evidence/source-snapshots/uae-pdpl.json`, com texto extraído, URL, recibo original e hashes. A obtenção não passou pelo runner bloqueado e não contornou sua resposta HTTP403. O texto tem 44.406 caracteres; o hash SHA256 é `c6c3d55526589aa2d7313dcc7b787282373d0cdc1d894e2ca142aa3b4c49739c`. A data exata de obtenção permanece no recibo.

O input manual `reviewed_himayah_snapshot` ou a flag `--reviewed-himayah-snapshot` seleciona essa cópia **explicitamente**, somente para Himayah. O padrão continua leitura HTTP. Não existe fallback silencioso. O importador é exclusivo do diagnóstico em banco descartável e rejeita apps com evidência já existente; valida fonte/URL, hash do texto e timestamp com fuso não futuro. Preserva a aquisição original nos trechos e deixa `fresh_source_fetch_verified`, verificação de publicação e aplicabilidade jurídica como falsos. Hash detecta alteração; a revisão do repositório é a fronteira de confiança e não uma autenticação criptográfica da autoridade.

A cópia permite testar RAG/geração quando o runner não consegue baixar a fonte, sem certificar lei vigente, interpretação ou caso autêntico. Testes controlados cobrem alteração do texto, origem/escopo incorretos, data futura/sem fuso, tentativa de substituir documentos e o grafo real consumindo a cópia com papéis simulados. Nenhuma chamada Groq foi feita por esses testes. A execução live corrigida 43853517507 ainda estava na fila, sem job iniciado, durante essa frente; não recebeu marca de sucesso por isso.

## Perfil manual para avaliar três modelos distintos

O workflow oferece `model_profile=three-model-evaluation`, sem alterar os padrões do runtime ou a configuração permanente de hospedagem. O perfil escolhe planner GPT-OSS20B, specialist GPT-OSS120B e critic Qwen3.8-27B. Exige `allow_preview=true`; sem esse opt-in a validação rejeita o modelo Preview. Exige três IDs distintos configurados e devolvidos pelo provedor. A configuração padrão do menu continua `production-default`, com dois IDs.

Antes de inferência, o verificador consulta o catálogo e rejeita modelo ausente. O relatório publica apenas disponibilidade dos IDs configurados e de candidatos Preview públicos documentados, não a lista completa de modelos privados da conta. `probe_models=true` continua uma escolha independente e potencialmente cobrada: testa funções inofensivas e retorno de resultado, sem dados pessoais ou operação externa. Catálogo sozinho não comprova permissão de inferência.

Qwen aparece com suporte documental a JSON schema estrito; a implementação do auditor aplica o mesmo caminho de dados estruturados para esse ID. Isso é suporte de código e documentação, **não** teste ao vivo ou promoção a Production. Muse Spark Open também consta como Preview/Enterprise no card oficial e foi incluído na guarda de Preview; não é selecionado por esse perfil. O padrão de dois modelos permanece até haver evidência suficiente para uma decisão de implantação.

Validação local deste perfil: 179 testes Python e parsing do YAML aprovados. Um teste novo confirma que Qwen é bloqueado sem a flag de Preview e usa schema estrito quando a avaliação está explicitamente habilitada. Nenhuma credencial é aceita como input do perfil.

## Resultado da avaliação com três IDs

A avaliação de ferramentas 43862526716 e o piloto RAG Munagasah 43862903821 comprovaram respostas de GPT-OSS20B, GPT-OSS120B e Qwen3.8-27B. Arquivos de prova e limites estão em `project/MUNAGASAH_DIAGNOSTICO.md`. O terceiro modelo é Preview; o padrão permanente do código continua com dois IDs de produção. Somente o Munagasah tem, nesta consolidação, prova de grafo por app com os três IDs. A presença de segredo no GitHub e essas execuções não configuram o backend de hospedagem nem publicam aplicativos.
