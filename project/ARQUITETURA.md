# Arquitetura de execução — atual e alvo

## Estado atual inspecionado

- `mobile/` contém 25 variantes independentes de identidade/ativos sobre Expo 58, React Native e Expo Router; o default permanece Mizan.
- O shell oferece entradas por domínio, missão, evidências, atividade e conexão de desenvolvimento. Não há 25 aplicações publicadas.
- `server.py` usa `ThreadingHTTPServer`; identidade é token de operador opcional/usuários provisionados, não sessão de consumidor pronta.
- `agent_runtime.py` limita execução, usa workers/leases locais, ContextVar por escopo, ferramentas registradas e recomputação verificável. Modos local/model/team são distintos.
- `advanced.py` usa LangGraph e checkpoints SQLite. Existir checkpoint não comprova durabilidade distribuída ou sucesso de um provedor real.
- `storage.py` persiste dados por escopo; `retrieval.py` recupera fontes fornecidas, não a internet inteira nem leis atuais automaticamente.
- `connectors.py` permite leitura de endpoints fixos configurados pelo operador. Não existe um conector universal de escrita/submissão.
- `exports.py` prepara artefatos locais. “Exportado” não significa enviado, recebido ou aceito.

## Decisões e justificativas

| Decisão | Motivo | Condição para reconsiderar |
|---|---|---|
| Preservar Expo/React Native/Router | Base já existe, 25 identidades e contratos podem ser testados; refazer não resolve falta de fontes/integração | Limitação nativa específica reproduzida e sem módulo/configuração viável |
| Preservar ferramentas Python e adaptadores de provedor | Separa aritmética de narrativa; mantém testes e rastreabilidade | Uma tarefa comprovadamente exige execução no aparelho ou outro runtime |
| Compartilhar contratos e primitivas, não a composição de todas as telas | Evita 25 implementações incoerentes sem uniformizar produtos diferentes | Caso de uso/padrão nativo exige especialização |
| Preferir módulos pequenos por domínio | Alterações e defeitos permanecem localizáveis | Complexidade medida justifica extração adicional |
| SQLite/instância única no desenvolvimento | Já suportado e testável; baixo custo operacional | Concorrência, disponibilidade e recuperação da beta exigem armazenamento/coordenação de produção |
| Não introduzir microserviços agora | Não há carga medida ou equipe para justificar operação distribuída | Gargalo ou requisito de isolamento demonstrado |
| Sem segredo no cliente | Credenciais do provedor e autorização externa exigem escopo/revogação | Não há exceção proposta para chaves permanentes |
| Artefato e recibo separados | Evita “envio concluído” com base em texto do modelo | Sempre preservar a distinção |

## Interfaces alvo, ainda não implementadas

1. **Sessão de instalação sem cadastro.** Capacidade opaca, escopo por instalação/app, expiração, revogação e limites. Entrega sobre TLS, armazenamento nativo apropriado. Não confundir ausência de cadastro com anonimato garantido. Recuperação em outro aparelho/sincronização exige uma decisão explícita; não será prometida sem mecanismo.
2. **API de produção.** Contratos versionados para tarefa, cancelamento, artefato, fonte e autorização. Adaptar a API existente atrás de uma camada de servidor de produção, timeouts e limites; validar compatibilidade pelo cliente/testes antes de trocar. O servidor HTTP atual permanece ferramenta de desenvolvimento.
3. **Worker durável.** Tarefa com `id`, `app`, escopo do titular, revisão, estado, limite de tentativas/custo e checkpoints. Uma única operação não pode estar ativa em dois workers sem coordenação. O lease/lock atual é local; a beta precisa de teste de reinício, expiração e concorrência antes de escala.
4. **Envelope de evidência.** Origem, versão/hash, jurisdição/contexto, datas de publicação/obtenção, trecho, método e estado de verificação. Fonte fornecida, fonte recuperada e fonte autenticada são estados diferentes.
5. **Aprovação de ação.** Operação/destino, campos e anexos, hash da revisão, validade e decisão. Revisar entrada invalida autorizações dependentes. O servidor deve aplicar isso, não apenas esconder um botão.
6. **Conector específico.** Autoridade mínima, contrato do serviço, idempotência se suportada, consulta de estado/recibo, limites de repetição e caminho humano alternativo. Timeout após envio produz estado desconhecido até reconciliação.
7. **Telemetria mínima.** Metadados de erro, latência, custo e eventos operacionais; não gravar documentos ou raciocínio interno por padrão. Retenção, exclusão e acesso precisam ser definidos antes de dados reais.

## Contratos de dados

Propostas, não novas APIs existentes:

- `Task`: ID, produto, escopo, objetivo, revisão/entrada imutável, estado, orçamento, sequência de eventos.
- `Evidence`: ID, origem, versão/hash, data/contexto, conteúdo autorizado, estado de verificação.
- `Artifact`: tarefa/revisão, saídas calculadas, narrativa separada, referências, limitações e hash.
- `ActionProposal`: ferramenta/destino, payload, revisão, consequência, permissões e aprovação necessária.
- `Approval`: titular, proposta/hash, decisão, tempo e escopo.
- `Receipt`: ID externo confirmado ou estado desconhecido, tentativas, chave de idempotência e última reconciliação.

Máquina de estados alvo: proposta → aguardando dados/aprovação → em execução → concluída/parcial/falha/cancelada. A API atual tem um subconjunto; migração requer adaptar e testar consumidores. Não renomear campos existentes silenciosamente. Uma tarefa pode concluir o preparo de um rascunho sem concluir a ação externa; esses resultados devem permanecer separados.

## Organização de interfaces e cálculos

Os novos módulos puros `mobile/src/dossier.ts` e `mobile/src/setupComparison.ts` alimentam os respectivos componentes. Geradores explícitos produzem a versão dos cálculos usada nos protótipos. A origem e a verificação de sincronização ficam no pacote de cada app. Python mantém seu contrato independente; testes de paridade cobrem o subconjunto suportado, com diferenças de validação documentadas.

Para valores monetários do Istithmar, operações usam decimais inteiros escalados a partir da representação numérica recebida e arredondamento final half-up. O código não recupera precisão já perdida na entrada JSON/Number. O modelo atual usa duas casas finais e não se apresenta como motor fiscal multimoeda completo.

Tokens e componentes acessíveis podem ser compartilhados. Navegação, hierarquia, densidade, visualização e interação surgem do domínio: contrato/trechos; dossiê/documentos; implantação/opções; edital/prazos; mobilidade/segmentos. Protótipos no navegador são artefatos de design; implementar a experiência nativa é uma tarefa separada.

## Dependências para produção

| Dependência | Decisão necessária | Prova de aceitação |
|---|---|---|
| Provedor IA | Modelo, termos, região, limites e orçamento | Uma tarefa real, tratamento de recusa/limite/falha e custo observado |
| Fontes | Direito de uso, versão, aplicabilidade e atualização | Trechos rastreáveis e caso de fonte ausente/desatualizada |
| Conta externa | Escopo contextual, revogação e armazenamento | Operação autorizada e acesso indevido recusado |
| Armazenamento | Escopo por titular/app e retenção | Isolamento, backup/restauração e exclusão demonstrados |
| Hospedagem | TLS, capacidade, limites, execução durável | Smoke test, recuperação e carga representativa |
| Mobile | Aparelhos, versões mínimas e assinatura | Fluxo completo nos dois sistemas e artefatos instaláveis |
| Distribuição | Conta de desenvolvedor, metadados e política | Aceite/instalação real, sem confundir com bundle exportado |

Nenhuma dessas dependências é declarada resolvida por este documento.
