# Revisão integrada — auditoria, fontes reais, motor e UI

Este incremento foi coordenado por três agentes reais de desenvolvimento. Não é uma afirmação de que três modelos distintos estejam conectados ao runtime dos 25 aplicativos.

## Resultado verificável

- Os 25 produtos foram auditados contra as novas missões. O registro preserva identidade/ordem, diferencia capacidades locais de funções previstas e não declara nenhum fluxo primário autêntico completo.
- A frente de fontes auditou 30 registros de fontes/documentação e acessos. Há cinco componentes de leitura pública exercitados no caminho do aplicativo, não 30 integrações de produção.
- As telas operacionais deixam de iniciar/resetar com exemplos fictícios. Valores não preenchidos permanecem desconhecidos. Um rascunho editado é fornecido, não autenticado.
- `list_sources`/`refresh_source` entraram no registro de ferramentas do modo model; o planejador do modo team pode selecionar IDs permitidos. O input original continua imutável; não há URL arbitrária nem escrita externa.
- PDFs/HTML públicos podem ser buscados, extraídos, persistidos, versionados e recuperados com citações e horários reais. Fontes substituídas ficam no histórico, mas saem da busca corrente lexical/semântica e da indexação nova.
- O painel Evidence nativo lista disponibilidade, permite leitura explícita e mostra recibo, falha, hash e horário. Cancelar a espera não é apresentado como desfazer uma leitura já iniciada; a reconciliação usa o histórico real.

## Execução externa realmente observada

Metadados em [public-source-reads.json](evidence/public-source-reads.json):

| Produto/componente | Conteúdo obtido | Escopo que a prova NÃO cobre |
|---|---|---|
| Himayah / PDPL | PDF oficial, 194.597 bytes e 44.406 caracteres extraídos | Auditoria de contrato real, aplicabilidade ou conclusão jurídica |
| Iqamah / ICP | 18.640 caracteres de guia oficial | Categoria/elegibilidade de pessoa real ou submissão |
| Istithmar / DMCC | 68.139 caracteres da publicação de encargos | Normalização de todas as taxas/permissões ou tributação do negócio |
| Munagasah / eSupply | 3.083 caracteres da página do portal | Descoberta de uma oportunidade, pack, emendas ou envio de proposta |
| Sahil / DEWA Move-in | 25.488 caracteres do procedimento publicado | Seleção de todos os ramos para pessoa real ou transação de serviço |

A prova [HTTP local → PDF oficial → recuperação](evidence/public-reader-http.json) registra resposta 201 e seis trechos do documento atual, todos com horário de leitura. Isso usa a API local real e uma fonte externa real, sem modelo simulado nesse caminho. Não há chamada de inferência nesse teste e o objetivo primário de auditoria permanece não verificado.

Erros iniciais de extração ICP e DNS DEWA foram diagnosticados, corrigidos e retestados; não foram convertidos em sucesso fictício. O transporte usa HTTPS verificado e o proxy configurado do ambiente, com essa fronteira de confiança explícita. Redirecionamentos e destinos arbitrários são rejeitados. Um 200 com desafio de acesso ou conteúdo incompatível não vale como prova.

## Testes executados

| Verificação | Resultado | Limite |
|---|---|---|
| Python, suíte final | **130 testes passaram**, 8,478 s | Inclui fixtures controladas de modelo/transporte; não prova inferência ao vivo |
| Mobile, suíte final | **46 testes passaram** | Inclui contrato de API, estado vazio e cliente de fontes; dados de testes identificados |
| TypeScript / ESLint | Passaram | Não substituem comportamento em aparelho |
| Configuração das variantes | 25 passaram | Não equivale a 25 instalações assinadas |
| Painel de fontes | Testes comportamentais passaram | Adaptadores DOM/API controlada: falha, recibo, cancelamento, escopo, resposta antiga |
| Biblioteca de documentos | Passou | Atualizar fonte preserva rascunho e identifica versão substituída |
| Estados iniciais | 25 variantes e console web passaram | Sem calculador/resultados fictícios antes de dados fornecidos |
| Sessão/conexão | Passou | Reset, escopo e corrida de resposta; sem autenticar a verdade do rascunho |
| DOM smoke / API local | Passou | Testes aplicam explicitamente fixtures de demonstração; não é serviço externo real |
| Bundles Himayah iOS/Android | Exportados após a integração final | Não são builds assinados ou prova de dispositivo |
| Contraste dos novos protótipos 03–05 | 20 pares intencionais por produto passaram | Não é auditoria completa de acessibilidade nativa |
| Registro/manifesto e whitespace | Passaram | Consistência de artefatos não comprova a função primária |

Saída da suíte Python: [python-tests.txt](evidence/python-tests.txt). A frente UI documenta os comandos e limites em [AUDITORIA_UX_OPERACIONAL.md](AUDITORIA_UX_OPERACIONAL.md). A frente de fontes documenta as provas e dependências em [INTEGRACOES_REAIS.md](INTEGRACOES_REAIS.md).

## Revisão cruzada e correções concretas

A frente de fontes identificou que um HTML longo poderia ser apenas uma página de acesso e que versões antigas continuariam recuperáveis. O motor acrescentou âncoras específicas/validação de conteúdo, histórico de versões e exclusão de fontes substituídas na busca. Também corrigiu a persistência de falhas DNS. Regressões cobrem esses casos.

A frente UI identificou que valores iniciais zero/falso e reset para exemplos criavam uma representação operacional incorreta. Agora há estado desconhecido e procedência explícita. O painel tem fronteira por conexão/app, suprime respostas antigas e preserva rascunhos. O coordenador revisou a separação entre leitura, modificação externa e data da fonte; relatórios web/Markdown passaram a apresentar essas diferenças.

A coleta independente e o leitor do aplicativo obtiveram o mesmo hash do PDF PDPL. As três frentes não trataram isso como prova de interpretação jurídica ou de conclusão da função principal.

## O que continua incompleto

Os 25 fluxos primários com entrada autêntica e resultado final verificado; inferência com provedor real; prova de três modelos distintos conectados; dados concretos suficientes do usuário por domínio; integrações privadas/transacionais autorizadas; sessão de produção sem cadastro; adaptação nativa integral das novas telas; Arabic/RTL; acessibilidade/desempenho nos aparelhos; builds assinados e distribuição. Nenhuma escrita externa ou inscrição na competição foi executada.

RAG foi preservado e ampliado na recuperação real. O padrão atual tem três papéis e dois IDs distintos de modelo; as credenciais necessárias à validação de inferência não estavam ativas neste ambiente. A próxima prova é um fluxo específico completo com documentos/fatos reais suficientes e um provedor legitimamente configurado, mantendo as fontes e recibos agora disponíveis.

O plano dos 25, os lotes de cinco e as dependências estão em [PLANO_ESTRUTURAL.md](../PLANO_ESTRUTURAL.md). A meta diária não autoriza promover capacidades parciais a produtos concluídos.
