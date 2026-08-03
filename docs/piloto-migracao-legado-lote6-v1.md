# Sexto lote editorial ampliado do acervo legado — v1

**Status:** aprovado editorialmente  
**Escopo:** `CUL-0010` a `CUL-0015`  
**Aprovação:** Luiz Jácomo, em 02/08/2026  
**Publicação:** condicionada à migração técnica separada e às validações

## 1. Critério do lote ampliado

O sexto lote passou de três para seis repertórios após autorização de Luiz para ampliar as rodadas em um fluxo editorial já estabilizado. A seleção forma dois núcleos:

### Violência, guerra e território

- `CUL-0010` — *Men Against Fire*: tecnologia, desumanização e fabricação do inimigo;
- `CUL-0012` — *Cidade de Deus*: território, juventude e escolhas sob desigualdade;
- `CUL-0013` — *O Senhor das Armas*: lucro, Estados e circulação global da violência.

### Escola, trabalho e cultura institucional

- `CUL-0011` — *Entre os Muros da Escola*: linguagem, autoridade e reconhecimento;
- `CUL-0014` — *Vidas Entregues*: autonomia, gerenciamento algorítmico e transferência de riscos;
- `CUL-0015` — *O Diabo Veste Prada*: trabalho, distinção e transformação de si.

As fichas antigas possuíam entradas temáticas aproveitáveis, mas apresentavam autores como vínculos prontos e não registravam cuidados pedagógicos suficientes.

## 2. Decisão editorial

Luiz aprovou integralmente os seis cards. A decisão nominal está registrada em `data/aprovacoes-migracao-legado-lote6-v1.json`.

A aprovação autoriza a preparação da migração técnica em branch separada. Não autoriza publicação direta sem testes, nem criação automática de REL, ficha de autor, conceito ou Elo.

## 3. Eixos editoriais preservados

### CUL-0010 — Men Against Fire

A tecnologia não é tratada como causa única da desumanização. Propaganda, classificação eugênica, disciplina militar e decisões políticas constroem previamente o inimigo. Achille Mbembe e Zygmunt Bauman permanecem hipóteses editoriais.

### CUL-0011 — Entre os Muros da Escola

A proposta não culpa isoladamente estudantes, professores ou famílias. Linguagem, autoridade, assimetria institucional e reconhecimento são analisados no contexto escolar francês, sem transferência automática para o Brasil. Pierre Bourdieu e Paulo Freire permanecem possibilidades de leitura.

### CUL-0012 — Cidade de Deus

A leitura evita associar favela, pobreza, população negra ou juventude à criminalidade. O Estado aparece como presença seletiva e a mediação inclui representação e espetacularização da violência. Milton Santos, Loïc Wacquant e Alba Zaluar permanecem hipóteses.

### CUL-0013 — O Senhor das Armas

O comércio de armas é relacionado a mercados, Estados, fronteiras, guerras e responsabilidades institucionais. O filme não é tratado como documentário nem como prova de que todo comércio de armas seja ilegal. Karl Marx e Achille Mbembe permanecem hipóteses.

### CUL-0014 — Vidas Entregues

O documentário permite discutir gerenciamento algorítmico e transferência de riscos sem apagar a agência dos entregadores nem universalizar um recorte situado. Ricardo Antunes e Ludmila Costhek Abílio permanecem hipóteses editoriais.

### CUL-0015 — O Diabo Veste Prada

O conflito não é reduzido a uma chefe má, à vaidade feminina ou à superficialidade da moda. O trabalho aparece como aprendizagem de códigos, hierarquias e formas de apresentação. Pierre Bourdieu e Erving Goffman permanecem hipóteses.

## 4. Fontes verificadas

- Netflix/About Netflix, para *Men Against Fire*;
- Festival de Cannes, para *Entre les murs*;
- Miramax, para *Cidade de Deus*;
- Danish Film Institute, para *Lord of War*;
- Arquivo Nacional, para *Vidas Entregues*;
- 20th Century Studios, para *The Devil Wears Prada*.

O registro detalhado está em `docs/fontes-migracao-legado-lote6-v1.md`.

## 5. Preservações antes da migração técnica

- os seis IDs continuam em `publicado_legado`;
- `data/publicacoes.json` permanece com doze dados canônicos;
- `data/repertorios-canonicos.json` permanece com oito repertórios culturais canônicos;
- o total público continua em 38 conteúdos;
- nenhuma REL, ficha de autor, conceito ou Elo é criada;
- a Área do Estudante, o app e o Google Drive não são alterados;
- `R001-C02` e o card de salário digno continuam fora da base pública.

## 6. Próxima etapa

Criar branch e PR separados para a migração pública atômica dos seis cards, preservando IDs, URLs, histórico e contagem total, com validação contratual e auditoria de navegação antes do merge.
