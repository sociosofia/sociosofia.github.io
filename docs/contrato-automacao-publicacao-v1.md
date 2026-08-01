# Contrato entre automação editorial e site público — v1

**Status:** proposta técnica para validação de Luiz  
**Escopo:** projeções públicas de dados derivadas de evidências canônicas EVI  
**Arquivo público:** `data/publicacoes.json`  
**Esquema legível por máquina:** `schemas/card-dados-publico-v1.schema.json`

## 1. Separação de camadas

A automação trabalha em duas camadas distintas:

1. **Base editorial interna:** fontes, evidências EVI, método, escopo, limitações, pendências, atualizações e cards em ajuste.
2. **Projeção pública:** somente cards aprovados, autônomos e prontos para exibição.

Uma EVI pode permanecer validada internamente mesmo quando sua projeção pública está `em_ajuste`. Registros em ajuste não pertencem a `data/publicacoes.json`.

## 2. Portão humano

Nenhuma descoberta, EVI ou proposta de card é publicada automaticamente.

O fluxo é:

```text
busca e triagem
→ FON e EVI provisórias
→ proposta de card
→ revisão de Luiz
→ aprovação explícita
→ validação técnica
→ inclusão em data/publicacoes.json
→ interface pública
```

Cada projeção pública precisa registrar:

```json
"status": "publicado",
"aprovacao": {
  "status": "aprovado",
  "aprovado_por": "Luiz Jácomo"
}
```

## 3. Campos obrigatórios

```json
{
  "versao_contrato": "1.0",
  "modelo_publico": "card_dados_v1",
  "id": "DAD-0000",
  "codigo_publicacao": "R000-C00",
  "evi_id": "EVI-identificador-estavel",
  "tema_ids": ["tema-canonico"],
  "titulo": "",
  "dado": "",
  "contextualizacao": "",
  "interpretacao_sociosofia": "",
  "questao": "",
  "fonte_nome": "",
  "fonte_url": "https://...",
  "ano_data": "",
  "status": "publicado",
  "aprovacao": {
    "status": "aprovado",
    "aprovado_por": "Luiz Jácomo"
  }
}
```

`questao` é recomendada e exibida quando aprovada, mas não substitui o dado, a contextualização ou a interpretação.

O site valida a forma do `evi_id`. A existência efetiva da evidência e seu status editorial devem ser confirmados pela base interna da automação antes da inserção, pois os metadados completos da EVI não são expostos no repositório público.

## 4. Regras do card público

O card deve funcionar sozinho. Sua sequência é:

```text
título
→ dado principal
→ contextualização
→ Interpretação Sociosofia
→ pergunta para continuar pensando, quando houver
→ fonte original e data
```

Dado e contextualização cumprem funções diferentes. A contextualização informa alcance, universo, período, método ou limite necessário, sem simplesmente repetir a afirmação empírica.

Conceitos indispensáveis à compreensão precisam ser explicados no próprio texto. Links, autores, conceitos relacionados e Elos aprofundam a leitura, mas não corrigem uma explicação insuficiente.

Cada card possui uma mensagem empírica dominante. Uma EVI composta pode gerar mais de uma projeção pública, desde que cada card indique sua origem por `evi_id` e preserve IDs públicos distintos.

## 5. Temas canônicos

Os vínculos principais usam IDs de `data/temas.json`.

Exemplo:

```json
"tema_ids": ["genero", "trabalho"]
```

O primeiro ID define o rótulo temático principal exibido publicamente. Os demais preservam pertencimentos adicionais e permitem que o card apareça em outras entradas relevantes.

Aliases ajudam a reconciliar rótulos históricos. O site pode continuar usando palavras-chave para descoberta e serendipidade, mas a pertença editorial principal não depende mais de coincidência textual.

## 6. Compatibilidade e legado

Campos como `resumo`, `categoria`, `editoria`, `conexoes`, `tags`, `conceitos` e `autores` podem permanecer durante a migração. Eles não substituem os campos canônicos obrigatórios.

O carregador público:

- aceita somente registros válidos;
- ignora e registra no console qualquer projeção rejeitada;
- não exibe conteúdos `em_ajuste`, `rascunho`, `em_revisao` ou `arquivado`;
- impede IDs e códigos de publicação duplicados;
- rejeita `tema_ids` inexistentes;
- exige fonte original e aprovação humana;
- recusa todas as projeções novas quando o registro canônico de temas não pode ser conferido.

## 7. Registros vigentes

Os seguintes cards permanecem públicos:

- R001–C01 → DAD-0008;
- R002–C01 → DAD-0009;
- R002–C02 → DAD-0010;
- R002–C03 → DAD-0011.

R001–C02, sobre salário digno, permanece fora de `data/publicacoes.json` e não pode aparecer no site enquanto estiver `em_ajuste`.

## 8. Entrega esperada da automação após aprovação

Depois da aprovação explícita de Luiz, a automação deverá entregar um único objeto compatível com este contrato. Antes de gravá-lo, deverá:

1. verificar na base interna se o `evi_id` existe e está apto a gerar projeção pública;
2. distinguir novo card, atualização ou duplicata;
3. atribuir `tema_ids` válidos;
4. garantir unicidade de `id` e `codigo_publicacao`;
5. preencher a aprovação humana;
6. executar o validador;
7. inserir o objeto sem alterar outros registros;
8. confirmar a renderização pública.

A automação não cria RELs, conceitos, autores ou Elos automaticamente. Pode propor conexões para revisão editorial separada.

## 9. Rotina de inserção

A rotina segura é:

```bash
node scripts/inserir-publicacao.mjs caminho/do/card.json
```

Sem opções adicionais, ela opera em modo de simulação: valida o card e não escreve nada.

Depois da aprovação e da simulação bem-sucedida:

```bash
node scripts/inserir-publicacao.mjs caminho/do/card.json --write
```

A opção `--write` somente grava quando o conjunto completo permanece válido. O arquivo é reordenado por ID, sem alterar o conteúdo dos demais registros.

## 10. Verificações permanentes

O repositório mantém:

- validação do contrato e dos temas;
- teste de bloqueio para `em_ajuste`;
- teste de IDs, códigos e temas duplicados ou inválidos;
- teste da rotina de inserção em modo de simulação;
- auditoria em navegador da navegação temática e das seções públicas do card.

Essas verificações são executadas quando os arquivos do contrato ou das publicações mudam e também no primeiro merge desta estrutura à `main`.
