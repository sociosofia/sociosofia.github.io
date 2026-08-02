# Auditoria do acervo legado — lote 1 v1

**Status:** diagnóstico editorial e técnico para decisão de Luiz  
**Escopo:** `DAD-0001` a `DAD-0007` e `CUL-0001` a `CUL-0003`  
**Regra desta etapa:** nenhuma alteração em `data/repertorios.json`, IDs, textos públicos ou relações

## 1. Objetivo

Comparar uma amostra inicial do acervo legado com os modelos canônicos atuais do Sociosofia e indicar o tratamento necessário para cada registro.

A classificação não julga o valor temático do conteúdo. Ela responde a outra pergunta: **o registro, no estado atual, pode permanecer como projeção pública canônica?**

Categorias usadas:

- **Conforme** — já atende ao modelo atual; requer apenas conferência final.
- **Ajuste leve** — argumento central preservável, com correções localizadas de campos, recorte, fonte ou linguagem.
- **Reescrita substancial** — tema e fonte podem ser preservados, mas a projeção pública precisa ser refeita.
- **Reestruturação** — o registro reúne objetos diferentes, não possui uma mensagem dominante ou precisa ser dividido/reconcebido.
- **Relações pendentes** — conceitos, autores ou conexões sugeridos não devem ser tratados como RELs validadas.

## 2. Decisão Prioritária 0 — visibilidade de estados não publicados

O carregador geral usa atualmente a regra:

```js
.filter(i => i.status !== "arquivado")
```

Assim, registros com status `aguardando revisão`, `rascunho`, `em_ajuste` ou outros estados não arquivados podem entrar na interface.

No lote auditado:

- `DAD-0001` a `DAD-0007` estão como `aguardando revisão`;
- `CUL-0001` a `CUL-0003` estão como `rascunho`.

Portanto, o problema não é apenas editorial. O site geral ainda não possui para o acervo legado o mesmo portão técnico aplicado a `data/publicacoes.json`.

### Alternativas para decisão

**A. Contenção rigorosa**  
Carregar apenas `status: publicado`. É a solução coerente com o contrato atual, mas pode retirar temporariamente grande parte do acervo legado da navegação.

**B. Migração controlada**  
Criar um estado transitório público, por exemplo `publicado_legado`, atribuído somente após uma triagem mínima. Preserva o acervo enquanto diferencia o que já passou pelo novo modelo.

**C. Manter a regra atual durante a auditoria**  
Evita redução imediata do acervo, mas continua expondo rascunhos e itens ainda não aprovados.

**Recomendação:** alternativa B. Ela impede que `rascunho` e `aguardando revisão` sejam tratados como publicados, sem apagar de uma vez todo o acervo historicamente visível.

## 3. Síntese do lote

| ID | Título abreviado | Diagnóstico principal | Relações |
|---|---|---|---|
| `DAD-0001` | Juventudes minorizadas | Reestruturação | Pendentes |
| `DAD-0002` | Saúde mental e pertencimento | Reescrita substancial | Pendentes |
| `DAD-0003` | Bullying e sofrimento emocional | Reestruturação | Pendentes |
| `DAD-0004` | Início dos transtornos mentais | Ajuste leve | Pendentes |
| `DAD-0005` | Saúde docente | Reestruturação | Pendentes |
| `DAD-0006` | Leitura na primeira infância | Reescrita substancial | Pendentes |
| `DAD-0007` | Escolas militarizadas | Ajuste leve | Pendentes |
| `CUL-0001` | Coringa | Reescrita substancial | Pendentes |
| `CUL-0002` | Corra! | Ajuste leve | Pendentes |
| `CUL-0003` | Her | Ajuste leve | Pendentes |

Resultado geral:

- Conforme: **0**
- Ajuste leve: **4**
- Reescrita substancial: **3**
- Reestruturação: **3**
- Relações pendentes: **10**

A ausência de registros plenamente conformes é esperada: esses cards foram produzidos antes do fechamento do modelo atual.

## 4. Auditoria individual — dados

### DAD-0001 — Juventudes minorizadas, escola e trabalho

**Classificação:** Reestruturação.

**O que preservar**

- o problema social: desigualdades nas trajetórias juvenis;
- a publicação de referência;
- o cuidado de não individualizar exclusão escolar, pobreza e inserção precária.

**Problemas encontrados**

- o campo `dado` reúne ao menos três afirmações empíricas autônomas: jovens fora da escola, jovens que não estudavam nem trabalhavam e jovens em pobreza;
- não há uma mensagem empírica dominante;
- universo, período, método e possível sobreposição entre os grupos não aparecem no próprio card;
- o relatório é uma coletânea ampla e pode reunir indicadores de fontes e anos diferentes;
- quatro autores são sugeridos sem demonstração de vínculo intelectual específico com cada afirmação.

**Tratamento proposto**

- localizar no relatório a origem exata de cada indicador;
- registrar uma ou mais EVI;
- dividir o registro em cards autônomos, caso os indicadores tenham fontes, universos ou argumentos diferentes;
- escolher `educacao`, `trabalho`, `racismo` e outros temas somente conforme o recorte de cada novo card;
- manter os autores apenas como propostas de relação, nunca como vínculos automáticos.

### DAD-0002 — Saúde mental, escola e pertencimento

**Classificação:** Reescrita substancial.

**O que preservar**

- a pesquisa e o recorte de escolas privadas;
- o problema do pertencimento e do bem-estar na experiência escolar;
- a ressalva metodológica já presente no resumo.

**Problemas encontrados**

- o campo `dado` apresenta apenas o tamanho e a composição da amostra;
- título e subtítulo prometem resultados sobre cansaço, vínculo e bem-estar, mas nenhum resultado substantivo foi escolhido como mensagem dominante;
- a interpretação sobre a escola como ambiente de pressão não pode ser sustentada apenas pela quantidade de respondentes;
- os quatro autores sugeridos cumprem funções muito diferentes e não possuem relação validada.

**Tratamento proposto**

- selecionar no relatório um resultado central claramente mensurado;
- mover amostra e período para `contextualizacao`;
- explicitar que o universo é de escolas privadas participantes;
- reescrever `interpretacao_sociosofia` a partir do resultado escolhido;
- reduzir conceitos e autores ao mínimo indispensável.

### DAD-0003 — Bullying, violência escolar e sofrimento emocional

**Classificação:** Reestruturação.

**O que preservar**

- a pergunta sobre convivência escolar;
- a relevância dos estudos do GEPEM;
- o reconhecimento de que a reportagem é fonte secundária.

**Problemas encontrados**

- uma reportagem intermediária ocupa o lugar de fonte principal;
- o card combina pesquisa de 2022 com 945.481 estudantes e estudo de 2024 com 3.276 estudantes;
- os dois estudos possuem objetos, universos e resultados distintos;
- “medo de ir à escola”, solidão, desesperança e ideação suicida não devem ser fundidos em uma única evidência;
- a lista de autores não representa relações intelectualmente validadas.

**Tratamento proposto**

- localizar os estudos originais citados pelo Porvir;
- registrar cada pesquisa como EVI independente;
- decidir se cada EVI gera card próprio;
- evitar títulos que agreguem fenômenos diferentes como se fossem uma medida única;
- tratar conteúdos sobre ideação suicida com mediação pedagógica específica, sem sensacionalismo.

### DAD-0004 — Adolescência e início dos transtornos mentais

**Classificação:** Ajuste leve.

**O que preservar**

- fonte acadêmica original;
- uma única afirmação empírica dominante;
- ressalva de que o estudo é norte-americano e não descreve diretamente o Brasil;
- pergunta sobre prevenção e cuidado.

**Problemas encontrados**

- dado, contextualização e interpretação ainda estão fundidos no resumo;
- o título pode sugerir universalidade maior do que o estudo permite;
- a fonte é de 2005 e deve ser apresentada como evidência histórica específica, não como estimativa brasileira atual;
- autores associados não equivalem a relações validadas.

**Tratamento proposto**

- preservar o card como projeção de estudo acadêmico, com recorte explícito no título ou subtítulo;
- separar universo e metodologia em `contextualizacao`;
- explicar na interpretação o alcance e o limite da evidência;
- usar `saude` e `educacao` como temas, com `saude` ainda marcado taxonomicamente como provisório.

### DAD-0005 — Saúde docente, ansiedade e condições de trabalho

**Classificação:** Reestruturação.

**O que preservar**

- relatório e recorte da rede estadual de Santa Catarina;
- problema da relação entre organização do trabalho e sofrimento docente;
- pergunta editorial.

**Problemas encontrados**

- o campo `dado` não apresenta dado: apenas enumera os assuntos tratados no relatório;
- não há número, proporção, comparação ou achado delimitado;
- o resumo formula interpretação ampla sem ancoragem em uma evidência pública dominante;
- quatro autores são indicados sem relação validada.

**Tratamento proposto**

- retornar ao relatório e selecionar um resultado central;
- criar EVI com amostra, período, instrumento e recorte;
- construir um novo card de dados a partir desse achado;
- avaliar se outros indicadores justificam cards separados;
- manter `trabalho`, `educacao` e `saude` como possibilidades temáticas, não como relações automáticas.

### DAD-0006 — Primeira infância, leitura em casa e desigualdade

**Classificação:** Reescrita substancial.

**O que preservar**

- a comparação entre prática de leitura e nível socioeconômico;
- o relatório original;
- a relação pedagógica possível com capital cultural e desigualdade educacional.

**Problemas encontrados**

- o título e o dado usam “famílias brasileiras”, mas a própria ficha informa que o estudo brasileiro abrange apenas três estados;
- a comparação com “média internacional” precisa indicar países ou desenho comparativo do estudo;
- o card reúne comparação Brasil–média internacional e diferença interna por nível socioeconômico; pode haver duas mensagens concorrentes;
- quatro autores são sugeridos, incluindo referências de campos distintos.

**Tratamento proposto**

- corrigir o universo já no título ou subtítulo;
- escolher como mensagem dominante a desigualdade interna ou a comparação internacional;
- levar o outro resultado para contextualização ou card separado;
- distinguir descrição empírica de interpretação sobre capital cultural;
- manter apenas o autor cuja relação for efetivamente desenvolvida.

### DAD-0007 — Escolas cívico-militares e militarização da educação

**Classificação:** Ajuste leve.

**O que preservar**

- uma afirmação empírica dominante;
- fonte técnica identificada;
- pergunta sobre concepção de escola pública;
- potencial de circulação entre educação, política e direitos.

**Problemas encontrados**

- dado e leitura política estão fundidos no resumo;
- o crescimento de 595% exige explicação da base de comparação de 2019 e do critério usado para definir “escola militarizada”;
- a nota técnica não deve ser apresentada como equivalente ao Censo Escolar, embora use dados públicos;
- quatro autores aparecem como possíveis leituras, sem relações validadas.

**Tratamento proposto**

- manter os dois números apenas se a metodologia confirmar que pertencem ao mesmo recorte;
- explicitar definição, período e procedimento de cruzamento em `contextualizacao`;
- separar a crítica à militarização em `interpretacao_sociosofia`;
- usar `educacao` e `politica` como temas principais e `violencia` somente se o texto justificar.

## 5. Auditoria individual — repertórios culturais

### CUL-0001 — Coringa

**Classificação:** Reescrita substancial.

**O que preservar**

- resumo da obra;
- discussão sobre abandono institucional, precariedade e produção social do desvio;
- Foucault como possibilidade de ancoragem.

**Problemas encontrados**

- a formulação aproxima sofrimento psíquico, humilhação e violência de maneira causalmente perigosa;
- o card pode reforçar a associação social entre transtorno mental e violência;
- “a violência não nasce apenas de uma decisão individual” corre o risco de converter contexto social em explicação total da ação do personagem;
- faltam ficha rápida, créditos, acesso e URL de referência;
- `resumo` e `resumo_obra` são duplicados.

**Tratamento proposto**

- reescrever a leitura para distinguir representação cinematográfica, sofrimento psíquico, abandono institucional e responsabilização moral;
- não usar a obra como prova empírica sobre saúde mental;
- preservar Foucault como uma leitura possível, com recorte explícito em normalização e exclusão;
- completar créditos e acesso sem prometer disponibilidade permanente.

### CUL-0002 — Corra!

**Classificação:** Ajuste leve.

**O que preservar**

- resumo claro da obra;
- leitura sobre cordialidade aparente, objetificação e controle do corpo negro;
- Fanon como ancoragem principal;
- estrutura geral próxima do modelo canônico de repertório.

**Problemas encontrados**

- “racismo cordial” é um conceito fortemente associado ao debate brasileiro e pode produzir deslocamento indevido quando aplicado sem explicação a uma obra norte-americana;
- conceitos adicionais ainda não são RELs validadas;
- faltam ficha rápida, créditos completos, acesso e URL;
- `resumo` repete `resumo_obra`.

**Tratamento proposto**

- substituir ou explicar o uso de “racismo cordial”;
- manter a leitura centrada em racismo liberal, branquitude, objetificação e olhar racial;
- preservar Fanon como âncora principal;
- completar metadados da obra e reduzir duplicações.

### CUL-0003 — Her

**Classificação:** Ajuste leve.

**O que preservar**

- resumo da obra;
- leitura sobre vínculos mediados, personalização e desejo de uma relação sem opacidade;
- Byung-Chul Han como leitura possível, não exclusiva;
- linguagem acessível para estudantes.

**Problemas encontrados**

- a obra aparece associada a uma única ancoragem teórica, embora o card mobilize também desejo, projeção, intimidade e alteridade;
- faltam ficha rápida, créditos completos, acesso e URL;
- `resumo` repete `resumo_obra`;
- conceitos e tags ainda não correspondem a relações canônicas validadas.

**Tratamento proposto**

- preservar o recorte atual e tornar explícito que Han é uma leitura possível;
- completar metadados e acesso;
- eliminar duplicação de campos;
- manter futuras relações com conceitos/autores para validação separada.

## 6. Padrões recorrentes encontrados

### 6.1 Dados sem separação canônica

Os sete cards de dados foram escritos antes da divisão atual entre:

```text
Dado
→ Contextualização
→ Interpretação Sociosofia
→ Para continuar pensando
→ Fonte e data
```

Mesmo os melhores registros precisam dessa migração.

### 6.2 Autores usados como repertório de possibilidades

Todos os dez cards possuem autores sugeridos, mas o arquivo não demonstra a validação intelectual de cada vínculo. No modelo atual, essas listas devem ser tratadas como **propostas editoriais**, não como relações confirmadas.

### 6.3 Ausência de `tema_ids`

Os cards dependem de palavras, categoria genérica e tags. A migração deve atribuir IDs canônicos sem eliminar a descoberta lateral por palavras-chave.

### 6.4 Fontes culturais incompletas

Os três repertórios culturais possuem obra, direção e ano no campo textual, mas `fonte_url` está vazio e não há ficha rápida estruturada nem informação de acesso.

### 6.5 Duplicação entre `resumo` e `resumo_obra`

Nos três repertórios culturais, os dois campos repetem o mesmo texto. A projeção canônica deve usar `resumo_obra` para a descrição da obra e `leitura_sociosofia` para a mediação editorial.

## 7. Ordem proposta de intervenção

### Etapa 1 — portão de visibilidade do legado

Decidir entre contenção rigorosa e estado transitório `publicado_legado`.

### Etapa 2 — três ajustes leves como piloto de migração

Migrar primeiro:

1. `DAD-0004`;
2. `DAD-0007`;
3. `CUL-0003`.

Esse trio testa:

- card de dado acadêmico;
- card de dado político-institucional;
- card de repertório cultural.

### Etapa 3 — reescritas substanciais

Migrar:

- `DAD-0002`;
- `DAD-0006`;
- `CUL-0001`.

### Etapa 4 — reestruturações

Retornar às fontes e reconstruir:

- `DAD-0001`;
- `DAD-0003`;
- `DAD-0005`.

### Etapa 5 — relações

Somente depois de cada projeção canônica estar estável:

- revisar conceitos;
- selecionar autores;
- propor RELs;
- verificar possíveis Elos.

## 8. Decisões solicitadas a Luiz

### D8.1 — portão do legado

Adotar a alternativa recomendada:

> Registros antigos só permanecem visíveis quando recebem `status: publicado_legado`; rascunhos, itens aguardando revisão e conteúdos em ajuste deixam de ser carregados.

### D8.2 — piloto de migração

Autorizar a modelagem, ainda fora da `main`, de:

- `DAD-0004`;
- `DAD-0007`;
- `CUL-0003`.

### D8.3 — preservação

Durante a migração:

- preservar IDs e URLs;
- não apagar registros históricos;
- não criar RELs automaticamente;
- não alterar conteúdos não incluídos no lote aprovado;
- apresentar antes/depois para aprovação antes de integrar.
