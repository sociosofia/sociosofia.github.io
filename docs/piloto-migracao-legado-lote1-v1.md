# Piloto de migração editorial do acervo legado — lote 1 v1

**Status:** proposta em revisão  
**Escopo:** `DAD-0004`, `DAD-0007` e `CUL-0003`  
**Publicação:** bloqueada até nova aprovação explícita de Luiz

## 1. Situação do portão público

O estado transitório `publicado_legado` já foi integrado separadamente. Ele preserva os 33 itens historicamente visíveis sem transformar os estados antigos `rascunho` e `aguardando revisão` em aprovação editorial plena.

Este documento não altera o portão, o carregador, a interface ou os cards vigentes. Ele registra apenas três propostas editoriais.

## 2. Preservações do piloto

- os IDs e endereços permanecem os mesmos;
- os três cards continuam exibindo seus textos antigos enquanto esta proposta estiver em revisão;
- nenhuma REL, ficha de conceito, ficha de autor ou Elo é criada;
- associações autorais antigas são tratadas como hipóteses a validar;
- o card de salário digno continua fora da base pública e deste escopo;
- a aprovação de um card não implica aprovação dos demais.

## 3. DAD-0004 — antes e depois

### Diagnóstico do legado

O card já apresentava corretamente a ressalva de que o estudo é norte-americano. Faltavam, porém:

- separar contextualização e interpretação;
- registrar amostra, período de coleta e classes de transtornos analisadas;
- evitar a formulação ampla “transtornos mentais” sem indicar o recorte DSM-IV;
- retirar autores sugeridos por aproximação automática;
- explicitar o risco de medicalização.

### Proposta

**Título:** Metade dos casos analisados teve início até os 14 anos

**Dado:** No National Comorbidity Survey Replication, metade de todos os casos ao longo da vida começou até os 14 anos e três quartos até os 24 anos.

**Contextualização:** O estudo entrevistou presencialmente 9.282 adultos de língua inglesa, com 18 anos ou mais, nos Estados Unidos, entre 2001 e 2003. Foram analisados transtornos de ansiedade, humor, controle de impulsos e uso de substâncias classificados pelo DSM-IV. As idades de início foram reconstruídas retrospectivamente; o resultado não é uma estimativa direta para o Brasil nem para todas as formas de sofrimento psíquico.

**Interpretação Sociosofia:** A concentração de primeiros episódios na infância, adolescência e juventude ajuda a discutir por que prevenção, acolhimento e acesso ao cuidado não podem começar apenas na vida adulta. Ao mesmo tempo, políticas de cuidado precisam evitar a medicalização automática de conflitos, tristezas e experiências próprias da vida juvenil.

**Pergunta:** Como escola e serviços de saúde podem agir precocemente sem transformar toda experiência juvenil em diagnóstico?

**Temas propostos:** `saude`, `educacao`

**Relações pendentes:** o estudo não mobiliza Durkheim, Foucault, Byung-Chul Han ou Paulo Freire. Qualquer aproximação teórica exige REL separada.

## 4. DAD-0007 — antes e depois

### Diagnóstico do legado

O número principal estava correto, mas o texto atribuía de modo impreciso a base ao Censo Escolar. A pesquisa original foi construída pelo DEEP/Faculdade de Educação da USP por levantamento documental e mais de 600 pedidos de acesso à informação. Também era necessário distinguir dado, interpretação e posição institucional da entidade que divulgou o estudo.

### Proposta

**Título:** Brasil tinha 1.578 escolas militarizadas em maio de 2026

**Dado:** A base identificou 1.578 escolas militarizadas em funcionamento no Brasil até maio de 2026, um crescimento de 595% em relação a 2019.

**Contextualização:** O levantamento foi produzido pelo Grupo de Estudos e Pesquisas em Direito à Educação, Economia e Políticas Educacionais (DEEP), da Faculdade de Educação da USP. A base foi construída por pesquisa documental e mais de 600 pedidos de acesso à informação e alcançou 862 municípios. A categoria reúne diferentes arranjos de atuação cotidiana de militares; o próprio estudo observa que não existe acompanhamento nacional oficial do MEC sobre o fenômeno.

**Interpretação Sociosofia:** O crescimento do modelo desloca o debate para além da preferência individual de cada família. Quando a militarização organiza gestão, disciplina e financiamento — e, em alguns lugares, torna-se a única opção pública — entram em jogo a gestão democrática, a pluralidade escolar e o próprio sentido da educação pública.

**Pergunta:** Uma escola pública oferece escolha real quando o modelo militarizado se torna a única opção disponível em uma localidade?

**Temas propostos:** `educacao`, `politica`

**Relações pendentes:** Foucault, Arendt, Freire e Bourdieu podem abrir leituras, mas nenhuma relação autoral deve ser preservada como validada sem justificativa específica.

## 5. CUL-0003 — antes e depois

### Diagnóstico do legado

A estrutura do card já se aproximava do modelo cultural atual, mas:

- `resumo` repetia integralmente `resumo_obra`;
- a leitura tendia a transformar Byung-Chul Han em explicação exclusiva;
- faltava distinguir o que o filme apresenta da hipótese editorial;
- os metadados e uma referência externa confiável não estavam ligados.

### Proposta

**Título:** Her: intimidade, projeção e vínculos mediados por tecnologia

**A obra:** Em um futuro próximo, Theodore trabalha escrevendo cartas pessoais para outras pessoas e vive um período de isolamento após o fim de seu casamento. Ao instalar um sistema operacional capaz de aprender e conversar, ele conhece Samantha e passa a construir com ela uma relação afetiva. O filme acompanha esse vínculo sem revelar aqui seus desdobramentos finais.

**Leitura Sociosofia:** *Her* não apresenta a tecnologia apenas como causa de isolamento. Samantha oferece escuta, surpresa e transformação, mas também é uma presença desenhada para aprender preferências e responder de modo personalizado. A questão central deixa de ser se o afeto é verdadeiro ou falso e passa a ser como desejo, conflito e alteridade se reorganizam quando a relação é mediada por uma tecnologia sempre disponível e adaptável.

**Ancoragem teórica:** Hipótese de leitura editorial: Byung-Chul Han pode ajudar a pensar a busca por relações com menos opacidade e conflito; Sherry Turkle pode contribuir para discutir intimidade mediada e companhia tecnológica. Nenhuma dessas referências é explícita no filme e ambas permanecem como relações a validar.

**Temas propostos:** `tecnologia`, `cultura`

**Relações pendentes:** nenhuma referência autoral será convertida automaticamente em REL.

## 6. Condições para a migração real

Depois da aprovação editorial, uma etapa técnica separada deverá:

1. preservar o ID e o endereço atual;
2. registrar a versão anterior no histórico interno;
3. substituir o texto sem criar duplicata;
4. retirar o ID correspondente de `publicado_legado` somente quando a nova projeção estiver publicada;
5. atribuir EVI e código de migração aos cards de dados;
6. validar novamente a contagem pública e a navegação temática.

## 7. Decisão esperada

A revisão pode usar comandos separados:

- `Aprovar DAD-0004.`
- `Ajustar DAD-0004.`
- `Aprovar DAD-0007.`
- `Ajustar DAD-0007.`
- `Aprovar CUL-0003.`
- `Ajustar CUL-0003.`

Nenhuma aprovação neste PR publica automaticamente os novos textos.
