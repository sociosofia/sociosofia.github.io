# Adendo — migração do legado e repertórios culturais canônicos v1

**Status:** vigente após aprovação de Luiz  
**Lote inicial:** `legado-lote1-v1`  
**Escopo:** `DAD-0004`, `DAD-0007` e `CUL-0003`

## 1. Separação das bases públicas

O Sociosofia passa a distinguir três conjuntos públicos:

1. `data/publicacoes.json` — cards canônicos de dados;
2. `data/repertorios-canonicos.json` — cards canônicos de repertórios culturais;
3. `data/repertorios.json` + `data/publicacao-legado.json` — acervo antigo ainda não migrado.

O arquivo `data/repertorios.json` permanece como registro histórico e fonte transitória. Um item antigo só é público quando seu ID está em `data/publicacao-legado.json`. Quando a migração é concluída, o ID sai do registro transitório e passa a ser carregado de sua base canônica.

## 2. Preservação de IDs e endereços

A migração não cria um novo ID para o conteúdo. O endereço público permanece:

`repertorio.html?id=<ID>`

O carregador remove da projeção transitória qualquer registro cujo ID esteja presente em uma base canônica válida. Assim, o texto antigo pode ser preservado internamente sem aparecer duplicado no site.

## 3. Faixa `R000`

A faixa `R000-Cxx` é reservada à migração de cards de dados que já possuíam ID público antes da criação das rodadas automatizadas.

- `R000` não representa uma nova rodada de busca;
- a automação de descoberta não deve gerar códigos `R000`;
- cada registro migrado deve possuir também `codigo_migracao`;
- os códigos das rodadas ordinárias continuam a partir de `R001`.

No primeiro lote:

- `DAD-0004` → `R000-C04`;
- `DAD-0007` → `R000-C07`.

## 4. Histórico e aprovação

Cada lote publicado deve registrar:

- propostas editoriais;
- aprovação nominal de Luiz;
- cópia integral dos registros substituídos;
- destino canônico de cada ID;
- testes de ausência de duplicação.

Arquivos do primeiro lote:

- `data/propostas-migracao-legado-lote1-v1.json`;
- `data/aprovacoes-migracao-legado-lote1-v1.json`;
- `data/historico-migracao-legado-lote1-v1.json`.

## 5. Relações editoriais

A migração de um card não cria automaticamente:

- REL;
- ficha de conceito;
- ficha de autor;
- Elo.

Conceitos podem permanecer como indexadores editoriais do card. Autores possíveis devem ficar em campo próprio e não podem ser convertidos em vínculo validado sem análise de relação.

## 6. Contagem após o primeiro lote

Após a publicação de `DAD-0004`, `DAD-0007` e `CUL-0003`:

- 30 conteúdos permanecem em `publicado_legado`;
- 7 cards de dados estão em `data/publicacoes.json`;
- 1 repertório cultural está em `data/repertorios-canonicos.json`;
- a fachada pública permanece com 38 conteúdos.
