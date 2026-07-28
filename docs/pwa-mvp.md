# Sociosofia Alunos — MVP PWA

## Escopo

Este protótipo cria uma Progressive Web App em `/app/` para o percurso:

> SESI Rio Claro → 1º ano → Sociologia

A Área do Estudante atualmente publicada em `/alunos/` não é alterada. O link da página inicial também permanece apontando para a versão pública já aprovada.

## Decisão de arquitetura

O MVP usa HTML, CSS e JavaScript sem etapa de compilação. Essa decisão é deliberada: o repositório já é publicado diretamente pelo GitHub Pages e a introdução imediata de Astro ou de um novo fluxo de build aumentaria o risco de interromper o site atual.

A validação ocorre em duas camadas:

1. validar experiência, instalação, responsividade, favoritos, retomada e funcionamento offline;
2. depois da aprovação do produto, migrar os capítulos para coleções estruturadas e adotar Astro sem alterar a experiência validada.

## Ponte de compatibilidade

O conteúdo anual aprovado já existe em quatro arquivos compactados. O aplicativo:

1. baixa esses arquivos;
2. recompõe o conteúdo;
3. descompacta o HTML no navegador;
4. exibe o capítulo escolhido dentro do leitor do aplicativo;
5. guarda os arquivos no cache para leitura offline.

Isso evita duplicar ou reescrever os capítulos durante a primeira validação.

## Recursos incluídos

- três etapas e dez capítulos;
- busca local por título, etapa e páginas;
- favoritos no aparelho;
- retomada do último capítulo;
- instalação como PWA;
- cache offline do aplicativo e do percurso anual;
- leitor integrado;
- link de segurança para a versão anual;
- responsividade e foco visível;
- preferência por movimento reduzido.

## Limites do MVP

- não há login;
- não há coleta de dados pessoais;
- favoritos e retomada não sincronizam entre aparelhos;
- a busca ainda não indexa todo o texto interno do capítulo;
- os capítulos ainda dependem da ponte de compatibilidade com a página anual compactada;
- ícones SVG devem ser validados em aparelhos Android antes da publicação definitiva.

## Próximo portão de qualidade

Antes de substituir qualquer link público:

- testar em Chrome Android e Firefox Android;
- testar instalação na tela inicial;
- testar modo avião depois do primeiro carregamento;
- testar os dez marcadores `#capitulo-N`;
- testar telas de 360 px e 412 px;
- verificar contraste, navegação por teclado e botão voltar;
- confirmar que uma atualização de conteúdo substitui corretamente o cache anterior.
