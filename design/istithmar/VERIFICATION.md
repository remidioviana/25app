# Istithmar — verificação local da unidade de design/overview

Esta unidade não comprova um agente de implantação/tributação plenamente operacional. O novo leitor de fonte pública e a auditoria agêntica são registrados separadamente em `project/`.

- Typecheck e lint mobile passaram na rodada do novo overview.
- 42 testes mobile passaram antes da alteração posterior de estados iniciais; incluem seis regressões novas de custo exato, atividade, entrada inválida, zero e cenário tributário. O relatório operacional posterior deve registrar a nova contagem global.
- Render de 25 componentes em três cenários passou nessa rodada.
- Metro exportou os bundles Android e iOS da variante Istithmar; não são APK/IPA assinado ou teste em aparelho.
- Protótipo: 288 verificações de layout (36 telas × quatro larguras × duas combinações plataforma/tema), 36 verificações de texto a 200%, sem erros de página ou pedidos HTTP(S) externos.
- Fluxo de exemplo explicitamente fictício→cálculo→componentes→cenário independente→pacote passou. Inputs inválidos preservam rascunho; editar invalida resultado; zero tributário é respeitado; markup não é executado; exclusão limpa estado.
- 12 casos suportados de decimais/horizonte coincidiram com os totais e associação de atividade da ferramenta Python.
- 20 pares de contraste intencionais passaram; mínimo 5,69:1. Isso não é auditoria completa de acessibilidade.

Reprodução: `node design/istithmar/build-engine.cjs --check`; `python design/istithmar/verify.py`; `python design/istithmar/verify-parity.py`; `python scripts/check_design_contrast.py`.

Pendente: todos os fluxos nativos, dados reais do negócio, fontes adequadas a cada jurisdição, análise tributária fundamentada, inferência com provedor real, conexão de licenciamento, Arabic/RTL, VoiceOver/TalkBack e dispositivos. A existência de um protótipo visual e de cálculos corretos não resolve essas pendências.
