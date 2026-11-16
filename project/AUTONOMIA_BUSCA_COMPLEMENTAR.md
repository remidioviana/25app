# Busca complementar que chega ao especialista

Foi corrigido um gargalo do ciclo de recuperação: resultados de uma busca nova eram adicionados depois dos trechos antigos e o limite de contexto cortava a lista pelo início. Quando o contexto estava cheio, o especialista podia receber novamente os mesmos trechos, mesmo após o auditor pedir uma busca específica.

As buscas complementares agora priorizam resultados novos. O grafo mantém um histórico limitado a 24 trechos e um contexto ativo configurável de 1–24. O especialista recebe o contexto ativo; o auditor recebe também os trechos efetivamente citados pelo draft. Documentos apagados, de outro app ou substituídos são excluídos antes desses envios. A mudança não executa ferramentas adicionais arbitrárias nem aumenta o limite de respostas por papel.

Um teste de regressão executa LangGraph e busca FTS reais com dois documentos controlados e contexto ativo de um trecho. O primeiro trecho não resolve a tarefa; o auditor pede uma busca específica; o segundo chega ao especialista e o auditor aceita. Foram cinco respostas de papel e nenhuma intervenção humana. Os modelos foram simulados nesse teste: ele prova a correção do encadeamento, não a qualidade de uma interpretação por Groq ou conclusão de produção.

A suíte Python completa passou com **195 testes**. Os diagnósticos históricos dos cinco apps permanecem registrados com seus estados originais; não foram convertidos retroativamente em aprovações automáticas.

O próximo portão é observar conclusão autônoma em tarefa real delimitada, com fontes suficientes e resultado verificável. Falta de dados deve gerar pergunta específica ou limitação identificada, em vez de transferir genericamente ao usuário a revisão dos modelos. Autorizações de ações externas continuam separadas da revisão interna.
