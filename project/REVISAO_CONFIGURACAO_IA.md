# Revisão de configuração de IA — frente 03

Escopo: distinguir configuração, validação e execução na experiência mobile; separar papéis de orquestração de modelos distintos; revisar como credenciais e resultados são apresentados. Alterações desta frente permanecem locais até a consolidação do responsável. Nenhuma credencial recebida em conversa foi utilizada, copiada para arquivos, reproduzida neste relatório ou usada em chamada externa por esta frente.

## 1. Constatações na implementação inspecionada

Antes desta iteração, `configured()` indicava apenas a presença de valores no ambiente do servidor. Não provava que a credencial era válida, que o endpoint funcionava, que o modelo existia ou que uma chamada com ferramentas tinha terminado corretamente. A home/missão não pode converter esse booleano em “IA validada”.

A orquestração tem os papéis planner, specialist e critic/auditor. A configuração padrão inspecionada compartilhava o mesmo identificador entre planner e specialist, com outro para auditor: três papéis e dois identificadores, não três modelos distintos comprovados. Tornar os modelos configuráveis por papel resolve a rigidez da configuração, mas não comprova disponibilidade nem execução.

`AgentReview` usa os registros de uso devolvidos pela tarefa e chama o aceite de “Model reviewer accepted”. Também avisa que revisão do modelo não é certificação factual. Esse comportamento deve ser preservado: papéis sem execução não devem aparecer como atividades concluídas, e o parecer do auditor não transforma uma hipótese em fato verificado.

No adaptador anterior, `usage.model` representava o identificador enviado no payload após eventual fallback. Isso não era necessariamente uma declaração independente do provedor sobre o modelo efetivamente servido. A verificação deve distinguir modelo solicitado, modelo informado na resposta, fallback e papel. Mesmo três identificadores diferentes não são uma prova independente da arquitetura física do provedor.

## 2. Níveis que a interface deve distinguir

| Nível | Evidência mínima | O que não permite afirmar |
|---|---|---|
| Não configurado | Ausência de configuração utilizável no servidor | Que uma tentativa de inferência possa funcionar |
| Configuração presente | Valores e contratos de configuração presentes | Credencial válida, modelo disponível ou conexão testada |
| Configuração sintaticamente válida | Endpoint/identificadores aceitos pela validação local | Sucesso de uma requisição ao provedor |
| Modelo respondeu | Uma chamada de inferência bem-sucedida, modelo solicitado/informado, horário e resultado limitado | Tool-calling, três papéis ou tarefa completa funcionando |
| Ferramenta executada | Chamada de ferramenta autorizada, resultado e retorno ao modelo | Correção jurídica/profissional ou sucesso de uma escrita externa |
| Fluxo principal comprovado | Objetivo, fontes reais, passos, resultado e recuperação verificados em conjunto | Publicação, aceitação das lojas ou garantia de prêmio |

Consultar um catálogo de modelos, receber HTTP 200 de uma página ou encontrar uma variável não comprova o nível seguinte. Um teste com transporte controlado deve continuar identificado como teste, nunca como verificação ao vivo.

## 3. Ajustes nativos feitos nesta frente

Na missão, o estado baseado em `model_configured` passou a dizer que **o servidor informa configuração**, sem afirmar uma chamada bem-sucedida. Sem conexão, o estado do provedor é desconhecido; sem configuração reportada, os recursos de IA não são anunciados como disponíveis. A diferença entre ferramentas determinísticas e processamento no provedor continua visível.

A descrição do modo com modelos informa que planner, specialist e auditor são papéis e podem compartilhar um modelo. Metadados de uma execução listam identificadores, sem certificar agentes independentes ou precisão factual.

Na conexão existente, o campo passou a se identificar explicitamente como token de acesso emitido pelo próprio servidor, **não uma API key do provedor**. A copy diz que conectar o workspace não valida o provedor e que chaves de modelo pertencem à configuração do servidor. Não foi criado campo novo para chaves, cadastro obrigatório ou fluxo de envio de credenciais pelo chat.

Foi adicionado ao tipo Config o campo opcional `provider`, compatível com servidores anteriores. O helper `providerStatus` bloqueia tentativas de IA quando os metadados informam configuração inválida ou credencial ausente, mesmo que o booleano legado indique presença de chave; ferramentas locais não são bloqueadas por isso. Para configurações válidas, mostra a quantidade de identificadores configurados com a indicação explícita de que inferência não está validada. Servidores antigos continuam com mensagem conservadora de configuração não verificada. Não há selo “conectado” apenas porque existem valores para três papéis.

## 4. Critérios de revisão da mudança do motor

- Resolver configuração por papel no momento correto de execução, em vez de congelar valores na importação do módulo.
- Preservar o papel do auditor na política de fallback; não permitir que um specialist herde permissão só por compartilhar um identificador.
- Validar formatos/limites de identificadores e endpoint sem imprimir a credencial ou o conteúdo do ambiente.
- Calcular a quantidade de identificadores distintos a partir da configuração real, sem preencher “3” por ser a quantidade de papéis.
- Informar explicitamente quando nenhum teste ao vivo foi realizado.
- Se houver verificação, registrar operação, modelo solicitado, modelo informado pela resposta, horário e limite do teste; não usar dados pessoais para um teste de conexão.
- Não exibir chaves, cabeçalhos de autorização, dumps de request ou corpos de erro do provedor em logs/relatórios/UI.
- Uma falha de autenticação, quota, rede ou resposta inválida deve continuar falha, sem fallback fictício ou “validado” por padrão.

Os testes de regressão do motor e o verificador pertencem à frente 02 e devem trazer seu próprio resultado executado. O parecer desta frente é complementar, não substitui esses testes.

## 5. Verificação desta frente

`npm run typecheck`, `npm test` e `npm run lint` passaram após a ligação dos metadados opcionais. A suíte mobile executou **48 testes**, incluindo dois novos testes de política: presença de chave não supera configuração rejeitada/ausente; três papéis com dois identificadores não se tornam inferência validada ou três modelos comprovados. Os testes usam metadados e transportes controlados; não usaram credencial real nem provedor externo.

Não foi criada uma prova de inferência ou colaboração entre modelos a partir desses resultados. A implementação de `configuration_status()` inspecionada declara deliberadamente `inference_verified: false`; qualquer verificador separado precisa registrar sua própria operação e resultado, sem mudar esse indicador por presença de configuração.

A revisão independente identificou duas regressões a prevenir: fallback inferido por um identificador compartilhado em vez do papel, e preparação de inputs herdando o caminho legado sem papel explícito. A implementação revisada passou a informar o papel na orquestração, no especialista e no intake. Um teste independente com transporte controlado confirmou que specialist não recebe fallback de auditor mesmo quando todos os papéis compartilham o ID do auditor; confirmou também que configuração não implica inferência e que IDs solicitado/informado pelo provedor ficam separados. Os quatro testes de intake passaram, incluindo propostas dos 25 domínios sem início de run. Nenhuma chamada de provedor foi feita para isso.

O verificador `scripts/verify_groq.py` foi revisado: offline é o padrão; catálogo autenticado depende de `--live`; loops mínimos dependem adicionalmente de `--probe-models`; o modo diagnóstico de papéis compartilhados não declara três modelos distintos. Cada prova exige identidade informada na resposta e retorno do resultado da ferramenta. O campo `primary_application_workflow_verified` permanece falso nesses diagnósticos.

O relatório offline em `project/evidence/groq-readiness.json` registra ausência de credencial protegida, dois IDs configurados por padrão e nenhuma validação de catálogo/inferência/três modelos. Isso é um resultado de prontidão, não uma conexão Groq comprovada. Uma saída de processo bem-sucedida no modo offline significa que o relatório foi produzido; seus indicadores precisam ser lidos antes de concluir disponibilidade.

Foi sinalizado para correção um limite de redação de erro: exceções brutas de parsing de URL/porta não devem copiar valores potencialmente sensíveis para relatórios. O motor passou a normalizar essas falhas sem copiar o valor; o teste `test_invalid_url_parser_values_are_sanitized` cobre porta inválida, IPv6 inválido e quebra de linha.

## 6. Limites que permanecem

O controle de token do workspace é uma conexão de desenvolvimento já existente; não é a arquitetura final de sessão de consumidor sem cadastro. Uma conta de assinatura de chat não equivale automaticamente a uma conta/API com faturamento, modelos e permissões adequados.

Uma configuração de três papéis não resolve sozinha a interpretação dos 25 domínios, a atualização das fontes, as ferramentas específicas, os checkpoints, as autorizações ou a verificação final. Também não autoriza despesas, publicação, escrita em conta externa ou submissão de dados profissionais. A conclusão agêntica deve continuar vinculada às evidências de tarefa real por produto.
