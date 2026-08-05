# Movimento 2 — relatório da reconstrução transversal de Filosofia do 1º ano

**Data:** 05/08/2026  
**Branch:** `agent/reconstruir-filosofia-1ano-transversal-v2`  
**Estado:** reconstruída e submetida a validação; não autorizada para publicação  
**Banco Sociosofia:** não alterado

## 1. Objeto

Reconstrução transversal da publicação anual de Filosofia do 1º ano incorporada pelo PR #60, preservando o percurso filosófico e corrigindo a projeção pública que havia transformado decisões editoriais em duplicidades, pseudoentidades, agrupamentos genéricos e linguagem de bastidor.

## 2. Fonte de reconstrução

A reconstrução foi realizada sobre o HTML anual integral efetivamente publicado, extraído dos oito blocos compactados da rota atual. O inventário diagnóstico foi utilizado para localizar e classificar perdas, mas não substituiu o conteúdo filosófico original.

Também foi auditada a antiga branch `agent/reconstruir-filosofia-1ano-v2`. Ela continha decisões parciais úteis, porém não era publicável: o carregador exigia `v2-07-08.b64`, arquivo nunca criado. Foram aproveitadas as decisões compatíveis com o contrato vigente, e não os arquivos incompletos.

## 3. Estrutura preservada

- 3 etapas;
- 10 capítulos;
- 56 movimentos;
- 1 trilha opcional;
- perguntas orientadoras e transições;
- fontes curriculares, filosóficas e acadêmicas;
- percurso filosófico anual e maior parte das sínteses públicas.

## 4. Resultado da normalização

### 4.1 Entidades

A projeção pública passa a conter **107 entidades únicas**.

Foram eliminadas:

- duplicidade de Karl Popper;
- duplicidade de Falseabilidade e verdade provisória;
- pseudoentidades “Aristóteles — ocorrência ética”, “Immanuel Kant — ocorrência ética”, “Platão — ocorrência metafísica” e “Aristóteles — ocorrência metafísica”;
- pseudoentidades conceituais intituladas como retomadas;
- entidades autorais compostas que apagavam diferenças entre autores.

Reaparições agora apontam para a mesma entidade por meio de usos curriculares contextuais.

### 4.2 Tipologia visual

A antiga projeção utilizava 45 invólucros relacionais genéricos. A reconstrução passa a distinguir:

- **17 relações intelectuais validadas**;
- **10 comparações ou debates**;
- **7 famílias ou dimensões conceituais**;
- destaques contextuais;
- conteúdos independentes;
- obras apresentadas por seu formato próprio.

Não há agrupamentos relacionais de cartão único.

### 4.3 Autores compostos

Foram separados, entre outros:

- Jeremy Bentham e John Stuart Mill;
- Theodor Adorno e Max Horkheimer;
- Charles Peirce e Ferdinand de Saussure;
- Claude Shannon e Warren Weaver.

“Zenão e os paradoxos do movimento” deixou de funcionar como entidade autoral composta: Zenão permanece autor e os paradoxos são tratados como problema filosófico.

## 5. Limpeza pública

A reconstrução apresenta **zero passagens de bastidor** para os padrões testados:

- ficha;
- ocorrência;
- retomada;
- canônica;
- ativado;
- comentários sobre catalogação ou decisão de publicação;
- rótulo genérico “repertório cultural”.

A inconsistência da matriz diagnóstica foi corrigida no contrato: o inventário registra **53 passagens distintas**, e não 83.

## 6. Paginação

Todos os **56 movimentos** agora possuem páginas específicas.

O Capítulo 1 foi normalizado assim:

- Movimento 1 — p. 12–16;
- Movimento 2 — p. 17–19;
- Movimento 3 — p. 19–21;
- Movimento 4 — p. 21–22;
- Movimento 5 — p. 23–25;
- Movimento 6 — p. 23–25.

## 7. Interface e funcionalidades

Foram incorporadas as utilidades persistentes aprovadas:

- Início;
- Material;
- Instalar;
- Buscar.

O gerador trabalha sobre o mesmo conteúdo da página e oferece:

- Material para aula;
- Material de revisão;
- Lista de exercícios;
- recorte por ano, etapa ou capítulo.

A interface preserva Inter, fundo quente, paleta dessaturada, conteúdo centralizado, busca discreta e ausência de roxo, Fraunces e contadores decorativos.

## 8. Validação automatizada

O teste `scripts/test-filosofia-1ano-transversal-v2.mjs` reconstrói o HTML a partir dos oito blocos e verifica:

- presença dos 3 estágios, 10 capítulos, 56 movimentos e 1 trilha;
- unicidade de todos os IDs e destinos dos links internos;
- páginas específicas em todos os movimentos;
- paginação exata do Capítulo 1;
- ausência de linguagem de bastidor e identidade visual proibida;
- 107 entidades únicas;
- unicidade dos autores e conceitos recorrentes;
- ausência de pseudoentidades e autorias compostas indevidas;
- 17 relações validadas, 10 comparações e 7 famílias conceituais;
- ausência de agrupamento relacional com apenas um membro;
- presença das quatro utilidades e dos três tipos de material;
- aplicação da camada de acessibilidade;
- ausência da antiga camada de correção visual;
- declaração explícita de que o Banco permaneceu intocado.

A validação é executada pelo workflow `Validar Filosofia 1º ano transversal v2`.

## 9. Limites desta entrega

A validação automatizada é estrutural, semântica e funcional em nível de código. A publicação ainda deve passar por revisão humana visual e editorial de Luiz Jácomo antes de qualquer integração à `main`.

Nenhuma alteração foi realizada no Banco Sociosofia. Nenhuma publicação foi autorizada ou efetuada.

## 10. Critério para o próximo movimento

Após a aprovação explícita de Luiz:

1. incorporar eventuais ajustes da revisão visual e editorial;
2. executar novamente o portão automatizado;
3. integrar somente a versão aprovada;
4. verificar a rota pública após a integração.
