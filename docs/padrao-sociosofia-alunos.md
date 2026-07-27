# Padrão Sociosofia Alunos

## Finalidade

O Sociosofia Alunos é o companheiro permanente do material didático. Cada percurso permanece disponível enquanto a edição, a paginação e a divisão institucional do livro não mudarem.

A mesma página deve atender a três usos:

1. **Ler antes da aula** — antecipar o problema e iniciar a discussão;
2. **Acompanhar o capítulo** — localizar páginas, movimentos, conceitos e autores durante o estudo;
3. **Retomar para avaliação** — reconstruir o percurso e as conexões depois da aula.

O andamento de uma turma específica não determina a disponibilidade dos capítulos.

## Estrutura de navegação

Caminho público:

> escola → ano → componente → etapa → capítulo

Estrutura no repositório:

```text
alunos/
  sociologia-1ano/
  filosofia-1ano/
  sociologia-2ano/
  filosofia-2ano/
```

Cada livro deve possuir uma página anual integrada, com todos os capítulos organizados em etapas.

## Estrutura do conteúdo

Cada capítulo deve apresentar:

- número e título;
- páginas exatas do livro do estudante;
- problema de abertura;
- movimentos de aprendizagem na ordem real do material;
- perguntas orientadoras;
- explicações curtas;
- passagem para o movimento seguinte;
- autores, conceitos, métodos, dados e repertórios aprovados;
- síntese para revisão;
- conexão com o capítulo seguinte.

A progressão mede movimentos de aprendizagem, não quantidade de autores ou cards.

## Método editorial

A produção segue esta ordem:

1. ler integralmente o “Para seu planejamento”;
2. formular internamente o núcleo do capítulo;
3. conferir a paginação no miolo do livro do estudante;
4. reconstruir o percurso página por página;
5. analisar e classificar as orientações docentes;
6. identificar mediações efetivamente realizadas pelo professor;
7. somente depois selecionar fichas;
8. produzir separadamente auditoria interna e camada pública;
9. executar o portão de qualidade;
10. corrigir, verificar novamente e classificar.

Nunca começar pelos cards.

## Fichas e entidades

Autores e conceitos recorrentes devem possuir cadastro canônico único.

A ficha central guarda:

- título;
- tipo;
- definição principal;
- ideias internas;
- conexões estáveis;
- palavras-chave.

Cada capítulo registra apenas:

- páginas;
- função naquele movimento;
- exemplo específico;
- seção “Como aparece neste capítulo”.

Não duplicar definições de Marx, Durkheim, Weber, Bourdieu, Alteridade, Interseccionalidade ou qualquer outra entidade recorrente.

## Repertórios

Manter três estatutos internos:

- **ativado:** participa de um movimento real e possui ficha pública;
- **candidato:** tem potencial, mas ainda não foi confirmado;
- **sugestão do manual:** permanece nos bastidores até ganhar função pedagógica definida.

A simples ocorrência de filme, livro, música, dado, instituição ou autor não cria uma ficha.

## Camadas separadas

### Camada permanente

- edição do livro;
- etapas, capítulos e páginas;
- movimentos;
- fichas canônicas;
- repertórios aprovados;
- conexões;
- sínteses.

### Camada anual do professor

- leitura indicada para a aula;
- avisos;
- atividades específicas;
- repertórios realmente usados no ano;
- diferenças entre turmas.

A camada anual aponta para o percurso permanente, sem alterar sua arquitetura.

## Interface pública

Usar:

- Fraunces nos títulos;
- Inter nos textos;
- fundo `#F7F1E8`;
- roxo `#5B2E91`;
- terracota `#D95D39`;
- verde-azulado `#2F6F73`;
- amarelo `#F2C14E`;
- cards claros;
- navegação em uma única interface;
- fichas abertas sem perda do ponto de leitura;
- responsividade e foco visível para teclado.

Não mostrar:

- “Para seu planejamento”;
- núcleo essencial;
- mediação docente;
- decisões editoriais;
- dúvidas e pendências;
- classificação de qualidade;
- correções de paginação;
- “Onde estamos”;
- “ainda não iniciado” ou “conteúdo em andamento”.

## Versionamento

Registrar internamente:

- componente e ano;
- instituição e unidade de referência;
- edição do material;
- paginação;
- data da última conferência;
- versão da curadoria Sociosofia.

Quando o material mudar, criar uma nova versão e preservar a anterior em arquivo. Não sobrescrever silenciosamente um percurso vinculado a outra edição.

## Portão de qualidade

Um livro só pode ser integrado à página inicial quando:

- todas as páginas estiverem conferidas;
- todos os capítulos tiverem auditoria;
- etapas e transições estiverem coerentes;
- fichas recorrentes estiverem normalizadas;
- não houver links sem destino;
- a camada pública estiver livre de bastidores;
- dados atuais estiverem datados ou removidos da camada permanente;
- a navegação tiver sido testada em computador e celular.

## Referência inicial

A versão de **Sociologia — 1º ano — SESI-SP, 3ª edição, 2026** é a primeira implementação aprovada deste padrão e funciona como referência estrutural para os próximos livros, sem obrigar outros materiais a repetir a mesma quantidade de movimentos, fichas ou repertórios.
