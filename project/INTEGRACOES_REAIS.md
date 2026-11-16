# Auditoria de fontes e integrações reais — 25 aplicativos

Escopo: pesquisa independente de fontes, leituras HTTPS reais e revisão cruzada do leitor de publicações criado pelo coordenador. Não houve submissão ao GitHub, contato com órgãos, autenticação em contas de terceiros, reserva, reembolso, pagamento ou alteração de calendário nesta frente.

Fonte estruturada completa: [`integrations.json`](integrations.json). Cada produto tem os dados necessários, permissões de leitura/escrita, atualização proposta, retenção, fallback e próxima dependência. As datas de coleta são timestamps reais em UTC, não datas de vigência das normas.

## O que foi efetivamente verificado

- 30 registros de fontes/provas, incluindo documentação de fornecedores e uma resposta JSON pública real do Aladhan. Não são 30 integrações operacionais de produto.
- As páginas/PDFs dos cinco primeiros domínios foram pesquisadas em fontes oficiais e submetidas a GETs reais, com tipo, quantidade de bytes, hash e momento de coleta quando houve resposta.
- O novo leitor de publicações do coordenador produziu recibos reais de PDPL, guia ICP, tabela de encargos DMCC, página institucional eSupply e guia DEWA Move-in. Esses cinco componentes de leitura estão classificados como conectados, com escopo restrito.
- As falhas iniciais de extração ICP e resolução DNS DEWA foram corrigidas e preservadas como histórico. Os cinco recibos atuais estão em `evidence/public-source-reads.json`. A prova `evidence/public-reader-http.json` registra HTTP 201 pelo servidor, ingestão PDPL e seis passagens BM25 atuais com timestamps; isso verifica o leitor e a recuperação, não um fluxo jurídico completo.
- Nenhum dos 25 fluxos primários teve uma execução completa comprovada com entrada autêntica do usuário, fontes pertinentes, inferência real, interação nativa e resultado final verificado. O status dos 25 permanece `INCOMPLETE` para esse critério.

Uma consulta feita pela ferramenta de pesquisa, um GET de auditoria e uma chamada através de uma ferramenta registrada no aplicativo são provas diferentes. Apenas a última, com recibo e armazenamento/recuperação verificados, sustenta o componente de aplicação conectado. Mesmo ela não valida interpretação jurídica, preço adequado ao caso, oportunidade de licitação atual ou transação oficial.

## Taxonomia aplicada ao componente, não ao aplicativo inteiro

| Status | Critério usado |
|---|---|
| VERIFIED & CONNECTED | Leitor de publicação implementado e exercitado com recibo real; escopo explícito. |
| VERIFIED BUT NOT CONNECTED | Serviço/contrato documentado existe, mas o app não o executou. |
| AUTHORIZATION REQUIRED | Dados privados ou operação precisam de autoridade legítima específica. Não implica que a API já foi escolhida. |
| SOURCE AVAILABLE, API UNCONFIRMED | Informação/página identificada; não há contrato programático de domínio confirmado. |
| UNAVAILABLE | O caminho/conector necessário não está disponível neste projeto ou a tentativa específica não foi utilizável. Não significa que não exista solução no mundo. |

## Primeiro lote — prova e bloqueio exatos

| App | Fonte oficial localizada | Observação do runtime | O que continua sem prova |
|---|---|---|---|
| Himayah | [PDPL no portal legislativo](https://www.uaelegislation.gov.ae/en/legislations/1972/download) | PDF lido, extraído e persistido pelo novo leitor; hash bruto coincide com leitura independente. | Contrato real, jurisdição/aplicabilidade, interpretação/cláusulas e conclusão de conformidade. |
| Iqamah | [Guia de residência ICP](https://icp.gov.ae/en/services/uae-golden-residency/) | Guia ingerido pelo leitor após correção do extrator: 18.640 caracteres. | Categoria aplicável, perfil/documentos reais e canal de submissão. |
| Istithmar | [Encargos DMCC](https://dmcc.ae/members/support/schedule-charges) e [guias FTA](https://www.tax.gov.ae/en/taxes/corporate.tax/corporate.tax.guides.references.aspx) | Publicação DMCC ingerida pelo leitor; FTA somente pesquisada/probada nesta auditoria. | Normalização de pacotes/condições, atividades permitidas e tributação aplicável ao negócio. |
| Munagasah | [Portal eSupply](https://esupply.dubai.gov.ae/web/) | Página institucional ingerida, não uma oportunidade ou edital específico. | Descoberta de licitação real, acesso ao pack/emendas, prazo com fuso e qualificação/documentos da empresa. |
| Sahil | [Guia DEWA Move-in](https://dewa.gov.ae/en/about-us/service-guide/consumer-services/move-in) e [DubaiNow](https://www.digitaldubai.ae/en/apps-services/dubai-now) | Guia DEWA ingerido após correção do transporte: 25.488 caracteres; DubaiNow continua somente fonte pesquisada. | Contexto real, serviço escolhido e autorização de operação. |

### Proveniência e atualidade

O PDF PDPL retornou `application/pdf`, 194.597 bytes e hash `d5d5f9e93bd6c0dc2afe79776f3101bcd599e4400a67309bc0b378b2812bcf3a`. A coleta independente ocorreu em `2026-11-16T01:57:20.859018+00:00`; o cabeçalho Last-Modified indicou 24/01/2024. Isso não certifica que a versão é a mais recente nem resolve o regime aplicável ao contrato.

A tabela DMCC teve cabeçalho Last-Modified de 12/11/2026; seus próprios termos exigem atenção a pacote e condições. O cabeçalho da homepage eSupply indicou 2023, mas não data nenhum edital. A página FTA contém datas de seção/documento diferentes de rodapés gerais. Cada afirmação operacional precisa da publicação/versão pertinente, não da data visual mais conveniente.

## Matriz de comportamento existente e próxima prova — todos os 25

As funções abaixo são locais sobre dados fornecidos. A existência do runtime compartilhado de modelo/grafo não comprova que cada produto já tenha sua cadeia de fontes e ferramentas de domínio conectada.

| # / produto | Comportamento local auditado | Próxima dependência concreta |
|---|---|---|
| 01 — Himayah AI | Literal clause-phrase flags and quotes from supplied text; no legal applicability/semantic audit. | Ingest official legal publication with receipt/hash/passages, then require a real user document and legal-applicability facts; no violations can be concluded from absent inputs. |
| 02 — Iqamah AI | Exact document-name and recorded-date checklist; not visa eligibility. | Parse official criteria by category/version and cite them; request missing actual profile evidence; official submission needs a verified authority integration and authorization. |
| 03 — Istithmar AI | Supplied fee/activity comparison; exact local arithmetic in new overview; no current fee/permit/tax verification. | Normalize a real authority schedule without mixing package and recurring charges; add current tax applicability evidence before recommendations. |
| 04 — Munagasah AI | Supplied requirement/capability names and date difference; no live opportunity discovery or qualification verification. | Obtain an actual opportunity and permitted document retrieval contract; record deadline with timezone and revisions; submission remains off. |
| 05 — Sahil AI | Supplied checklist/record dates and guide prototype; no live service procedure selection or official execution. | Use a real selected service and its branched official procedure; map only supported requirements with dated evidence; confirm official action contract separately. |
| 06 — Tawteen AI | Workforce arithmetic against user-selected target; not organization-specific Emiratisation compliance. | Find current primary MoHRE rule/version for organization class, validate roster denominator/exemptions and then compute exposure; HR API selection requires authorization. |
| 07 — Adl AI | User-event chronology and claimed-amount arithmetic; not legal entitlement or case filing. | Connect a permitted case-specific index/procedure lookup; DLD page alone is insufficient; verify current RDC route because services have migrated. |
| 08 — Tawassul B2B | Proposal from supplied product facts/account needs; no live partner research, CRM or outreach. | Choose authorized company/CRM data; verify counterparties and communication integration; public directory does not grant outreach permission. |
| 09 — Adab AI | Supplied-claim/term and length checks; no verified bilingual cultural/legal review or publishing connector. | Retrieve relevant actual content standards and local review criteria; connect publishing only under a selected account with approval. |
| 10 — Khidmah AI | Policy screening of supplied order fields; no authenticated merchant orders, shipment feed or refunds. | Select merchant/platform and grant legitimate access; implement versioned GraphQL order/refund workflow, idempotency and receipt reconciliation; no refund probe executed. |
| 11 — Jomrok AI | Supplied shipment-record gap screening; no actual HS/tariff, duty or certification retrieval. | Extract real invoice attributes, retrieve current official tariff and validate candidate codes; MoIAT registry does not establish product certification. |
| 12 — Khibrat AI | Supplied candidate-evidence/rubric comparison; no CV provenance verification or hiring-system integration. | Select an authorized applicant/ATS source and actual evidence extraction; credentials/references need separate verification, and a human owns decisions. |
| 13 — Majlis AI | Dependency planning over assigned milestones; no sourced regional-learning or corporate handbook connector. | Connect approved handbook and relevant source collection; directory is context only, not evidence of a universal cultural practice. |
| 14 — Rafiq | Planning over supplied calendar blocks/travel estimates; no live calendar or traffic connection. | OAuth calendar read first, then authorized change/reconciliation; enable billed routing only after selection; Aladhan method16 is experimental, not authoritative Dubai timing. |
| 15 — Sawm AI | Supplied routine rescheduling; no live fasting/prayer/context or biometric data. | Connect opted-in schedule/context using explicit method; resolve competition content constraints separately; no medical recommendation engine claimed. |
| 16 — Mizan AI | Arithmetic/categorization over supplied transactions and selected criteria; no bank, market or religious certification integration. | Choose licensed/authorized Open Finance path and methodology access rights; retrieve product evidence; do not equate standards access with certification. |
| 17 — Thawg AI | Filtering supplied dining availability/disclosures; no actual restaurant discovery, certification or booking. | Obtain actual venue/channel contract and evidence; verify certification scope beyond certifier registration; no availability endpoint is invented. |
| 18 — Manzil AI | Ledger/duplicate arithmetic over supplied receipt records; no camera/OCR/imported-bank live pipeline or VAT validity decision. | Implement real camera/OCR and correction chain, retrieve applicable VAT evidence, preserve original receipt lineage; no payment initiation exists. |
| 19 — Gurbah AI | Dependency/expiry planning over supplied milestones; no real school vacancies or service activations. | Choose actual family move scenario; handle KHDA anti-bot challenge without bypass; obtain direct admissions evidence and authorized service channels. |
| 20 — Amanah Eco | Supplied utility-period comparison; no actual bill camera/OCR, meter feed, incentive eligibility or verified carbon calculation. | Implement authentic bill extraction and period normalization; separate measured consumption from hypothetical savings; official emissions factor needed for carbon claims. |
| 21 — Nafas AI | User-selected routine support/breathing UI; no actual clinical assessment, adaptive evidence retrieval or clinician system. | Connect reviewed guidance resources and adapt to actual user intent; implement support/escalation boundaries without pretending to be clinical care. |
| 22 — Tadweer AI | Supplied item/rules routing; no actual photo classifier, current facility acceptance or map route. | Implement real photo uncertainty, retrieve current local acceptance and actual routing under selected terms; verify hazardous handling separately. |
| 23 — Turath AI | Supplied lesson/source milestones; no current source-grounded tutoring or reviewed learner adaptation. | Retrieve/extract actual museum/heritage sources; current brochure503 requires permitted alternative or retry, not invented facts. |
| 24 — Himam AI | Supplied route-segment/access-need screening; no real-time accessibility navigation or live elevator feed. | Validate a real routing dataset and accessibility coverage; obtain status contract for lifts/barriers or mark segments unverified; generic Routes output is not proof of access. |
| 25 — Hisad AI | Supplied-lot/allergen/expiry/capacity screening; no authentic partner match, acceptance or custody receipt. | Obtain partner agreement/data contract and actual lot inputs; implement acceptance/handoff receipts before impact reporting. |

## Fontes e contratos encontrados — sem presumir autorização

| Fonte | Autoridade / escopo | Estado de acesso observado |
|---|---|---|
| [UAE legislation — Personal Data Protection Law](https://www.uaelegislation.gov.ae/en/legislations/1972/download) | UAE federal legislation portal / official_publication | HTTP 200; recibo de ingestão no leitor do app |
| [ICP Golden Residency Guide](https://icp.gov.ae/en/services/uae-golden-residency/) | Federal Authority for Identity, Citizenship, Customs & Port Security / official_guidance | HTTP 200; recibo de ingestão no leitor do app |
| [DMCC Schedule of Charges](https://dmcc.ae/members/support/schedule-charges) | DMCC Authority / official_fee_publication | HTTP 200; recibo de ingestão no leitor do app |
| [FTA Corporate Tax guides and public clarifications](https://www.tax.gov.ae/en/taxes/corporate.tax/corporate.tax.guides.references.aspx) | Federal Tax Authority / official_guidance | HTTP 200 |
| [eSupply Dubai procurement portal](https://esupply.dubai.gov.ae/web/) | Government of Dubai / eSupply / official_portal | HTTP 200; recibo de ingestão no leitor do app |
| [DEWA Activation of Electricity/Water (Move-in)](https://dewa.gov.ae/en/about-us/service-guide/consumer-services/move-in) | Dubai Electricity & Water Authority / official_procedure | HTTP 200; recibo de ingestão no leitor do app |
| [DubaiNow service overview](https://www.digitaldubai.ae/en/apps-services/dubai-now) | Digital Dubai / official_service_overview | HTTP 200 |
| [MoHRE institutional entry point](https://www.mohre.gov.ae/en/home.aspx) | Ministry of Human Resources and Emiratisation / candidate_authority_page | HTTP Error 503: Service Unavailable |
| [Dubai Land Department Rental Index](https://dubailand.gov.ae/en/eservices/rental-index-overview/rental-index/?lang=en) | Dubai Land Department / official_interactive_service | HTTP 200 |
| [DMCC business directory](https://dmcc.ae/business-directory) | DMCC Authority / official_directory | HTTP 200 |
| [Advertiser Permit guidance](https://www.nma.gov.ae/en/initiatives/advertiser-permit-1) | National Media Authority / official_guidance | HTTP 200 |
| [Shopify GraphQL refundCreate API reference](https://shopify.dev/docs/api/admin-graphql/latest/mutations/refundCreate) | Shopify / vendor_api_documentation | HTTP 200 |
| [Dubai Customs integrated tariff reference](https://www.dubaicustoms.gov.ae/en/CustomsInformation/Pages/IntegratedCustomsTariff.aspx) | Dubai Customs / official_tariff_publication | HTTP 200 |
| [Google Calendar Events list](https://developers.google.com/workspace/calendar/api/v3/reference/events/list) | Google / vendor_api_documentation | HTTP 200 |
| [Google Calendar Events patch](https://developers.google.com/workspace/calendar/api/v3/reference/events/patch) | Google / vendor_api_documentation | HTTP 200 |
| [Aladhan Prayer Times API documentation](https://aladhan.com/prayer-times-api) | Islamic Network / Aladhan / third_party_api_documentation | HTTP 200 |
| [Aladhan Dubai date-specific calculation probe](https://api.aladhan.com/v1/timingsByCity/16-11-2026?city=Dubai&country=AE&method=16&timezonestring=Asia%2FDubai&iso8601=true) | Islamic Network / Aladhan / third_party_public_api | HTTP 200 |
| [Google Routes computeRoutes reference](https://developers.google.com/maps/documentation/routes/reference/rest/v2/TopLevel/computeRoutes) | Google Maps Platform / vendor_api_documentation | HTTP 200 |
| [DEWA Smart Living](https://www.dewa.gov.ae/en/smartliving) | Dubai Electricity & Water Authority / official_customer_service | HTTP 200 |
| [KHDA school directory](https://web.khda.gov.ae/en/Education-Directory/Schools) | Knowledge and Human Development Authority / official_directory | HTTP 200; intersticial Incapsula, não dados escolares |
| [CBUAE Open Finance Regulation](https://rulebook.centralbank.ae/en/rulebook/open-finance-regulation) | Central Bank of the UAE / official_regulation | HTTP Error 403: Forbidden |
| [AAOIFI Sharia standards entry](https://aaoifi.com/shariah-standards-2/?lang=en) | AAOIFI / standards_body | HTTP 200 |
| [MoIAT registered Halal certification bodies](https://moiat.gov.ae/en/programs/halal/registered-halal-certification-bodies) | Ministry of Industry and Advanced Technology / official_certification_registry | HTTP Error 503: Service Unavailable |
| [SevenRooms API documentation entry](https://api-docs.sevenrooms.com/) | SevenRooms / vendor_documentation_portal | HTTP 200 |
| [Dubai mental-health information](https://www.dubai.ae/web/dubai.ae/living/healthcare/mental-health) | Government of Dubai / official_public_health_information | HTTP 200 |
| [Dubai Municipality Waste Department](https://www.dm.gov.ae/municipality-business/waste-dept/) | Dubai Municipality / official_municipal_guidance | HTTP 200 |
| [Al Shindagha Museum English brochure](https://alshindagha.dubaiculture.gov.ae/Documents/ASM-Brochure-English.pdf) | Dubai Culture / official_cultural_publication | HTTP Error 503: Service Unavailable |
| [RTA About Metro / accessibility information](https://www.rta.ae/wps/portal/rta/ae/public-transport/metro/about-metro) | Roads & Transport Authority / official_transport_guidance | HTTP 200 |
| [RTA Open Data](https://rta.ae/wps/portal/rta/ae/home/open-data?lang=en) | Roads & Transport Authority / official_data_catalogue | HTTP 200 |
| [UAE Food Bank](https://www.dm.gov.ae/foodbank/) | Dubai Municipality / UAE Food Bank / official_partner_information | HTTP 200 |

## Pontos que impedem afirmações de tempo real/autonomia

1. **UAE PASS e portais oficiais:** a apresentação pública de um serviço não concede permissão de executar sua transação ou expõe uma API de terceiros. Não automatizar login, contornar CAPTCHA ou inventar endpoints.
2. **Calendário, comércio e rotas:** documentação primária de Google Calendar, Shopify refundCreate e Google Routes foi verificada. Calendários privados, pedidos/reembolsos e rotas autenticadas dependem de contas, escopos e termos reais. Nenhuma dessas operações foi feita.
3. **Aladhan:** a resposta pública de 16/11/2026 para Dubai/Asia-Dubai retornou JSON real. O método 16 é explicitamente experimental e não oficial segundo o fornecedor. Não é correto convertê-lo em horário oficial de uma autoridade de Dubai. O teste isolado não conecta Rafiq/Sawm ao calendário/trânsito.
4. **Acessibilidade:** o RTA descreve serviços de acessibilidade, mas não foi encontrado/validado um feed de elevadores e barreiras em tempo real. Uma rota genérica do Maps não garante acesso físico.
5. **DEWA/KHDA:** Smart Living não comprova API aberta de medidores. KHDA retornou HTTP 200 com desafio Incapsula; não foi obtido dataset escolar utilizável, muito menos vagas atuais.
6. **Halal/finanças:** registro de certificadores não comprova um restaurante/produto específico. Acesso a padrões AAOIFI não concede autoridade de certificação; licenças e metodologia precisam ser definidas. O marco de Open Finance não é acesso irrestrito a contas bancárias.
7. **Food Bank:** instituição e informação pública existem, mas não são autorização de parceria, capacidade atual de recebedores ou confirmação de entrega.
8. **Disponibilidade:** falhas HTTP403/503 foram registradas para fontes específicas. Elas não autorizam fabricar conteúdo nem concluir que todo o serviço deixou de existir.

## Revisão cruzada do leitor e ações corretivas

A revisão independente leu `source_tools.py` e o recibo real de PDPL. Catálogo fixo, HTTPS validado, redirecionamentos recusados, limites de tipo/tamanho e recibos com hashes são apropriados ao escopo de leitura. O uso do proxy da plataforma é parte explícita da fronteira de confiança; não é pinagem do IP de destino.

Foram entregues ao coordenador três correções específicas:

- Validar âncoras de conteúdo por fonte para não aceitar uma página de login/desafio longa com HTTP200 como publicação legítima.
- Normalizar falhas DNS/transporte no caminho de erro registrado, preservando recibo verdadeiro de falha, sem liberar destinos privados ou contornar autenticação.
- Manter histórico de versões, mas impedir que chunks de uma fonte substituída sejam usados como versão atual na busca lexical/semântica.

A revisão do código atual confirmou âncoras específicas, normalização de falhas DNS com fallback explicitamente registrado para proxy HTTPS confiável, e exclusão de versões substituídas da recuperação atual. O coordenador informou 129 testes Python aprovados; os cinco recibos reais e a prova HTTP foram inspecionados nesta frente. As âncoras não verificam autenticidade jurídica ou aplicabilidade. Os testes de falha controlada comprovam tratamento do erro, não disponibilidade de um serviço ao vivo.

## Política de dados e atualização

Os campos `refresh_design` e `retention_design` do JSON são requisitos propostos por produto. Não há um sincronizador contínuo ou TTL de produção aplicado aos 25 apps. A persistência SQLite auditada mantém tarefas/documentos até as operações de remoção disponíveis; essa existência não é uma política completa de retenção. Dados de contrato, candidato, finanças, saúde, família, calendário e localização exigem escopos e decisões diferentes.

Em qualquer produto: sem entrada real, mostrar estado vazio; sem fonte pertinente, explicitar lacuna; sem autorização, não executar a ação; sem recibo, não mostrar operação concluída. A classificação de cada conexão deve mudar apenas com nova evidência do caminho real da aplicação.

## Situação de revisão/publicação

Os arquivos desta frente foram entregues ao coordenador para revisão e publicação incremental; o agente de pesquisa não realizou envio ao GitHub. O estado conectado descrito é apenas o componente de leitura pública confirmado durante a colaboração. Nenhum produto está declarado production-ready ou com seu fluxo primário autêntico completo.
