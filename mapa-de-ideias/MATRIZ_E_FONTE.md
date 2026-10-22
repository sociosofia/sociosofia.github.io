# Matriz didática e fontes — versão 2 (revisada em 22/10/2026)

## Natureza do material
Instrumento **novo e exploratório** a partir de perguntas de pesquisas reais, muitas **adaptadas**. Não é uma versão oficial do LAPOP, Datafolha, Ipsos nem DataSenado, tampouco uma escala psicométrica já validada. Os itens de análise econômica foram inspirados em posições sobre Estado, mercado e distribuição de recursos; os socioculturais, em questões sobre gênero, família, sexualidade e autonomia.

**Em nenhum momento interpretar a classificação como a identidade ideológica verdadeira do aluno.** Não inferir posicionamento político de estudantes individuais no painel docente.

## Cálculo do quadrante
- Resposta a cada afirmação em 1–7: `normal = (resposta-4)/3`, intervalo [-1,1].
- Cada pergunta principal tem `pol = -1` ou `+1` para orientar o sinal do eixo.
- Economia, horizontal: -1 = mais redistribuição/Estado; +1 = mais pró-mercado.
- Sociocultural, vertical: -1 = mais conservador nesses cinco temas; +1 = mais progressista nesses cinco temas.
- A pontuação de cada eixo é a **média** dos itens válidos, sem pesos extras. Exigimos no mínimo 5 de 7 econômicos e 4 de 5 socioculturais para calcular um par de coordenadas.
- Ausências não contam como posições centrais. O zero é média aritmética, não diagnóstico de centrismo. Médias próximas de zero podem esconder opiniões discordantes fortes.
- O professor visualiza apenas **células agregadas 9×9**, não pontos individuais. Não há quadrante para os 11 indicadores temáticos nem para a questão de autodeclaração.

## Histórico e comparabilidade
- A versão 1 continua preservada em `/mapa-de-ideias/legado/`, com a redação original e pontuação anterior. No banco D1, as sessões existentes são marcadas `instrument_version = 1`.
- A versão 2 inverteu a direção das afirmações E2 (redução de impostos) e E4 (liderança privada do investimento). O eixo econômico passou a quatro itens orientados para redistribuição/Estado (E1,E3,E5,E6) e três orientados para mercado (E2,E4,E7).
- E6 passou a perguntar tributação progressiva; S5 passou a perguntar explicitamente ampliação das hipóteses legais de interrupção voluntária da gravidez; T11 passou a explicitar a redução de seis para cinco dias.
- Os dados das versões 1 e 2 não devem ser agrupados em uma mesma distribuição de quadrante nem comparados diretamente como se os itens fossem idênticos. Novas sessões usam `instrument_version = 2`.
- Escala 1–7 mantida; o ponto 4 significa "nem concordo, nem discordo", inclusive quando o respondente não sabe se posicionar. Não foi acrescentada alternativa "não sei". O direito de preferir não responder a um item é preservado.
- O instrumento continua exploratório e didático, sem evidência de validação psicométrica.

## Original x adaptação
- ROS4 e BRAPRIV1A têm aproximação temática com o LAPOP 2019. E6 (inspirada em tributação progressiva) foi reformulada na versão 2; não reproduz literalmente REDIST2A. ING4 é indicador complementar de democracia. Conferir as redações originais antes de comparar percentuais.
- L1: escala 1–10 do LAPOP, sem mudança essencial.
- VB50, D6, VB58, D2, JC15A, ENV1C1, IMMIG1XB: temas dos respectivos questionários LAPOP com redação e/ou formato de resposta alterados para didática. **Não comparar percentuais nacionais diretamente.**
- Itens originados do Datafolha e Ipsos e o de direitos reprodutivos: versões didáticas e não transcrições. O relatório Datafolha de 2026 deve ser revisado antes da aprovação final, sobretudo as perguntas de economia.
- Questão sobre redução do número máximo de dias trabalhados: aproximada da formulação publicada pelo Datafolha em março de 2026. Nacional de referência = 71% em março de 2026, **a comparação é descritiva e depende de confirmação da redação idêntica e do universo pesquisado**.

## Referências de origem
- LAPOP, Barômetro das Américas — Questionário Brasil 2017: https://www.vanderbilt.edu/center-for-global-democracy/data/?lp_download=2184
- LAPOP, Barômetro das Américas — Questionário Brasil 2019: https://www.vanderbilt.edu/lapop/ABBra18-v11.2.7.1-Por-190322_W.pdf
- LAPOP, Barômetro das Américas — Questionário Brasil 2023: https://www.vanderbilt.edu/center-for-global-democracy/data/?lp_download=2441
- Datafolha, março 2026 (fim da escala 6×1): https://www1.folha.uol.com.br/mercado/2026/03/datafolha-apoio-ao-fim-da-escala-6x1-cresce-e-chega-a-71-dos-brasileiros.shtml
- Datafolha, relatório de matriz ideológica, julho 2026: https://media.folha.uol.com.br/datafolha/2026/07/10/v2wz4su0coqx6yqoxy93jy7zs8omcuwywo2bwf3ufws.pdf (URL relatada, mas inacessível para verificação nesta execução)
- Ipsos, LGBT+ Pride 2024: consultar relatório e subamostras brasileiras antes da aplicação.
- DataSenado, interrupção da gravidez: consultar redação específica antes da aplicação.

## Casos de teste de pontuação
- Discordar de todos os itens econômicos (índice e1..e7 invertidos conforme polaridade) pode gerar sinais diferentes: isso é esperado; um perfil com respostas aparentemente conflitantes não deve ser corrigido manualmente.
- Responder com o ponto intermediário em todos os 12 itens principais gera (0,0).
- Pular mais de 2 econômicos ou mais de 1 sociocultural impede a posição individual no quadrante, mas não o registro das opiniões temáticas respondidas.
- Autodeclaração política nunca altera o quadrante.