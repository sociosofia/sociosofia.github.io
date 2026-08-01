# Pacote de sincronização — automação editorial e site público v1

**Status:** documento operacional vigente após a integração do contrato de publicações  
**Destino:** chat responsável pela busca, triagem e modelagem de novos dados  
**Escopo:** cards públicos de dados derivados de evidências canônicas EVI

## 1. Princípio geral

A automação pode buscar fontes, registrar FON e EVI, propor cards e sugerir conexões. Ela não publica por conta própria.

A sequência obrigatória é:

```text
busca e triagem
→ registro da fonte
→ evidência EVI
→ proposta de card numerada
→ decisão explícita de Luiz
→ objeto público validado
→ simulação de inserção
→ gravação explícita
→ verificação da interface
```

A decisão humana é o portão entre a proposta editorial e a projeção pública.

## 2. Fontes de verdade no repositório

Antes de preparar ou inserir qualquer card, consultar:

- `docs/contrato-automacao-publicacao-v1.md` — regras editoriais e operacionais;
- `schemas/card-dados-publico-v1.schema.json` — esquema legível por máquina;
- `data/temas.json` — IDs temáticos, rótulos públicos e aliases;
- `data/publicacoes.json` — projeções já publicadas;
- `publication-contract.mjs` — validação central;
- `scripts/inserir-publicacao.mjs` — inserção segura.

Nenhuma regra lembrada de conversas anteriores substitui esses arquivos.

## 3. Estados editoriais

A frente de automação pode usar internamente:

- `candidato` — item localizado, ainda sem triagem;
- `em_triagem` — fonte e relevância em análise;
- `em_modelagem` — EVI e card em elaboração;
- `em_revisao` — proposta apresentada a Luiz;
- `em_ajuste` — card devolvido para correção;
- `aprovado` — conteúdo aprovado, ainda não gravado;
- `rejeitado` — proposta descartada;
- `arquivado` — registro preservado sem continuidade imediata.

No arquivo público, o único estado permitido é:

```json
"status": "publicado"
```

`em_ajuste`, `aprovado`, `em_revisao` ou qualquer outro estado nunca devem ser gravados em `data/publicacoes.json`.

## 4. Comandos editoriais de Luiz

As decisões podem ser dadas em linguagem direta, por exemplo:

```text
Publicar R003–C01.
Ajustar R003–C02.
Rejeitar R003–C03.
```

Interpretação operacional:

- **Publicar** — autoriza preparar a projeção pública, registrar a aprovação e executar a validação;
- **Ajustar** — mantém a proposta fora do arquivo público e registra as correções solicitadas;
- **Rejeitar** — encerra a proposta sem apagar sua trilha editorial interna.

A palavra “Publicar” não autoriza criar REL, conceito, autor, repertório ou Elo. Esses vínculos exigem revisão editorial própria.

## 5. Formato obrigatório da entrega aprovada

Após o comando **Publicar**, entregar um único objeto JSON compatível com o contrato:

```json
{
  "versao_contrato": "1.0",
  "modelo_publico": "card_dados_v1",
  "id": "DAD-0000",
  "codigo_publicacao": "R000-C00",
  "evi_id": "EVI-identificador-estavel",
  "tema_ids": ["tema-canonico"],
  "editoria": "Notícias, dados e informações",
  "categoria": "Rótulo público do primeiro tema",
  "subtema": "",
  "titulo": "",
  "subtitulo": "",
  "tipo": "",
  "resumo": "",
  "dado": "",
  "contextualizacao": "",
  "interpretacao_sociosofia": "",
  "questao": "",
  "conceitos": [],
  "autores": [],
  "fonte_nome": "",
  "fonte_url": "https://...",
  "ano_data": "",
  "confiabilidade": "",
  "fonte_status": "conferida",
  "nivel": "",
  "status": "publicado",
  "aprovacao": {
    "status": "aprovado",
    "aprovado_por": "Luiz Jácomo"
  },
  "destaque": false,
  "tags": []
}
```

## 6. Função dos campos públicos

- `titulo` — afirmação curta e informativa;
- `dado` — mensagem empírica dominante do card;
- `contextualizacao` — universo, período, amostra, método, recorte ou limite necessário à leitura;
- `interpretacao_sociosofia` — mediação sociológica ou filosófica, claramente distinta do dado;
- `questao` — abertura para redação, debate ou aula;
- `fonte_nome`, `fonte_url` e `ano_data` — referência original e temporalidade;
- `evi_id` — ligação com a evidência canônica interna;
- `tema_ids` — pertencimento editorial estável;
- `tags` — descoberta, busca e serendipidade, sem criar relações canônicas.

O card precisa funcionar sozinho. Links e relações aprofundam a leitura, mas não corrigem texto incompleto.

## 7. Temas canônicos vigentes

Usar apenas os IDs presentes em `data/temas.json`:

| ID | Rótulo público | Estado |
|---|---|---|
| `educacao` | Juventude, educação e escola | estável |
| `trabalho` | Trabalho e desigualdade | estável |
| `racismo` | Raça, racismo e relações étnico-raciais | estável |
| `genero` | Gênero, sexualidade e corpo | estável |
| `tecnologia` | Tecnologia, mídia e vida digital | estável |
| `politica` | Política, democracia e cidadania | estável |
| `cultura` | Cultura, identidade e diferenças | estável |
| `violencia` | Violência, direitos humanos e justiça | estável |
| `territorio` | Meio ambiente, território e sociedade | estável |
| `saude` | Saúde, cuidado e bem-estar | provisório |

Um card pode ter vários `tema_ids`. O primeiro determina o rótulo principal da projeção pública; os demais ampliam sua circulação temática.

Não criar novos IDs dentro do card. A necessidade de um novo tema deve ser apresentada como decisão taxonômica separada.

## 8. Regras para IDs e duplicatas

Antes da entrega:

1. conferir se o `evi_id` já existe;
2. identificar se a proposta é novo card, atualização ou duplicata;
3. conferir o próximo `DAD-0000` disponível;
4. preservar o código de rodada e card, no padrão `R000-C00`;
5. impedir repetição de `id` e `codigo_publicacao`;
6. não substituir silenciosamente um card existente;
7. quando uma EVI gerar mais de um card, manter o mesmo `evi_id` e atribuir IDs públicos distintos.

## 9. Validação e inserção

Salvar o objeto aprovado em um arquivo temporário e executar primeiro a simulação:

```bash
node scripts/inserir-publicacao.mjs caminho/do/card-aprovado.json
```

A simulação deve confirmar:

- conformidade com o contrato;
- temas existentes;
- fonte válida;
- aprovação registrada;
- ausência de IDs e códigos duplicados;
- integridade do conjunto público;
- nenhuma alteração no arquivo durante o teste.

Somente depois da confirmação, gravar explicitamente:

```bash
node scripts/inserir-publicacao.mjs caminho/do/card-aprovado.json --write
```

Após a escrita:

```bash
node scripts/validate-publicacoes.mjs
node scripts/test-publication-contract.mjs
node scripts/test-inserir-publicacao.mjs
```

Também verificar a renderização do card e sua presença nos temas correspondentes.

## 10. Condutas proibidas

A automação não deve:

- publicar sem comando explícito de Luiz;
- inserir registros `em_ajuste` ou apenas `aprovado` no arquivo público;
- inventar fonte, data, estatística, autor, conceito, ID ou URL;
- transformar sugestão temática em REL validada;
- criar ou alterar conceitos, autores, repertórios culturais ou Elos automaticamente;
- alterar cards anteriores ao inserir um novo;
- reinterpretar “Publicar Rxxx–Cxx” como aprovação de outros cards da rodada;
- usar reportagem intermediária como fonte original quando a pesquisa original estiver disponível;
- apagar propostas rejeitadas da trilha editorial interna.

## 11. Resposta mínima após cada operação

Após uma simulação válida:

```text
R003–C01 validado em modo de simulação.
Nenhum arquivo público foi alterado.
ID proposto: DAD-0012.
Temas: racismo, educacao.
```

Após a inserção:

```text
R003–C01 inserido como DAD-0012.
Validação concluída.
Card localizado nos temas racismo e educacao.
Nenhuma REL ou Elo foi criado automaticamente.
```

Quando houver erro, informar o erro e interromper a gravação. Não corrigir campos editoriais de modo silencioso.

## 12. Bloco para sincronizar o outro chat

Copiar a orientação abaixo para a frente de automação:

> A estrutura pública do Sociosofia está estabilizada. A partir de agora, use como fontes de verdade `docs/contrato-automacao-publicacao-v1.md`, `docs/pacote-sincronizacao-automacao-v1.md`, `schemas/card-dados-publico-v1.schema.json`, `data/temas.json` e `data/publicacoes.json`. Continue buscando, registrando FON e EVI e apresentando propostas numeradas. Não publique nada sem comando explícito de Luiz. Quando Luiz disser “Publicar Rxxx–Cxx”, prepare apenas esse card no modelo `card_dados_v1`, registre a aprovação humana, execute primeiro `scripts/inserir-publicacao.mjs` sem `--write`, informe o resultado da simulação e somente então faça a gravação explícita. Cards em ajuste permanecem fora da base pública. Não crie RELs, conceitos, autores, repertórios ou Elos automaticamente; apenas proponha essas conexões para revisão separada.

## 13. Registros públicos no momento desta versão

- R001–C01 → DAD-0008;
- R002–C01 → DAD-0009;
- R002–C02 → DAD-0010;
- R002–C03 → DAD-0011.

R001–C02, sobre salário digno, permanece fora da base pública e em ajuste editorial.
