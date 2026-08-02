# Quarto lote editorial do acervo legado — v1

**Status:** em revisão  
**Escopo:** `DAD-0003`, `CUL-0004` e `CUL-0005`  
**Publicação:** bloqueada até nova aprovação explícita de Luiz

## 1. Critério do lote

O quarto lote conclui a revisão dos dados originalmente mantidos em `publicado_legado` e amplia a migração dos repertórios culturais. Foram selecionados:

- o último card `DAD` ainda transitório;
- um filme sobre mídia, vigilância e consentimento;
- um documentário brasileiro sobre racismo, eugenia, exploração da infância e memória.

Nenhuma proposta substitui o texto vigente nesta etapa.

## 2. DAD-0003 — correção da fonte e do indicador

O card legado reunia duas pesquisas e usava a reportagem do Porvir como fonte principal. A proposta passa a usar o artigo acadêmico **A convivência nas escolas: desafios e possibilidades**, publicado em *Estudos Avançados*, como fonte central.

A mudança corrige três pontos:

1. o universo é formado por estudantes dos anos finais do ensino fundamental da rede estadual paulista;
2. o indicador original se refere a medo frequente de outros estudantes, e não genericamente a medo de ir à escola;
3. o percentual de 18% reúne respostas de frequência diária ou semanal nos três meses anteriores.

**Título proposto:** 18% dos estudantes ouvidos disseram sentir medo frequente de outros alunos

O texto não classifica automaticamente todos os relatos como bullying e não afirma causalidade. A interpretação trata convivência e proteção como dimensões do direito à educação.

## 3. CUL-0004 — O Show de Truman

**Título proposto:** O Show de Truman: vigilância, espetáculo e realidade fabricada

A proposta preserva a discussão sobre espetáculo e vigilância, mas coloca o consentimento no centro. O filme não será apresentado como profecia literal das redes sociais nem como prova de que toda experiência mediada é falsa.

Guy Debord e Michel Foucault permanecem hipóteses editoriais, sem vínculo autoral automático.

## 4. CUL-0005 — Menino 23

**Título proposto:** Menino 23: eugenia, trabalho forçado e apagamento histórico

A nova leitura distingue:

- o que o documentário reconstrói;
- a interpretação Sociosofia;
- as hipóteses teóricas;
- os cuidados de mediação.

O card evita usar o nazismo como explicação externa que apague as raízes brasileiras do racismo e da exploração de crianças negras. Abdias do Nascimento e Kabengele Munanga permanecem possibilidades de leitura, sem REL automática.

## 5. Preservações

- os três IDs continuam em `publicado_legado`;
- `data/publicacoes.json` permanece com onze dados canônicos;
- `data/repertorios-canonicos.json` permanece com três repertórios canônicos;
- o total público continua em 38 conteúdos;
- nenhuma REL, ficha de autor, conceito ou Elo é criada;
- a Área do Estudante, o app e o Google Drive não são alterados;
- `R001-C02` e o card de salário digno continuam fora da base pública.

## 6. Decisão esperada

A revisão pode aprovar ou devolver separadamente:

- `DAD-0003`;
- `CUL-0004`;
- `CUL-0005`.

A aprovação editorial não publica automaticamente os cards. A migração pública será feita em branch e PR separados.
