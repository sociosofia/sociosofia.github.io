# Editoria 2 — Área do Estudante comparativa

Ambiente de desenvolvimento e comparação da nova arquitetura editorial da Área do Estudante do Sociosofia.

## Regra principal

A Área do Estudante atual, em `/alunos/`, permanece intacta e funciona como referência obrigatória. A Editoria 2 não é uma substituição automática.

## Objetivo

Comparar a área atual com uma nova versão baseada em:

- correspondência explícita com o material didático e suas páginas;
- movimentos de compreensão do capítulo;
- entidades canônicas reutilizáveis;
- navegação entre movimentos;
- trilhas adicionadas apenas posteriormente, quando houver autor ou autora, repertório e dado ou evidência verificável.

## Fluxo de trabalho

```text
conteúdo atual + material didático
→ reconstrução dos movimentos
→ implementação na Editoria 2
→ comparação com /alunos/
→ registro de ganhos e perdas
→ correções
→ aprovação de Luiz
→ eventual substituição
```

## O que deve ser comparado

- clareza da entrada por escola, ano, componente, etapa e capítulo;
- correspondência com páginas do livro;
- facilidade para retomar o percurso;
- navegação no celular;
- legibilidade;
- continuidade entre capítulos;
- preservação de autores, conceitos, repertórios e dados já existentes;
- facilidade de manutenção e reutilização;
- instalação e comportamento como PWA;
- eventuais perdas da estrutura anterior.

## Estados

- `em desenvolvimento` — conteúdo e interface ainda mudam;
- `comparável` — já pode ser confrontado com a área atual;
- `aprovado para integração` — passou pela revisão editorial e funcional;
- `publicado` — integrado à área oficial após confirmação explícita.

## Situação inicial

- branch: `editoria2`;
- área oficial preservada: `/alunos/`;
- primeiro recorte de implementação: Sociologia, 2º ano, capítulo 2;
- nenhuma alteração automática da página inicial;
- nenhuma substituição autorizada.
