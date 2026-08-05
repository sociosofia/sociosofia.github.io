import fs from 'node:fs';
import zlib from 'node:zlib';

function assert(condition,message){
  if(!condition) throw new Error(message);
}
const base='alunos/filosofia-1ano';
const chunks=Array.from({length:8},(_,index)=>`${base}/v2-${String(index+1).padStart(2,'0')}.b64`);
const encoded=chunks.map(file=>{
  assert(fs.existsSync(file),`Arquivo ausente: ${file}`);
  return fs.readFileSync(file,'utf8').replace(/\s+/g,'');
}).join('');
const html=zlib.gunzipSync(Buffer.from(encoded,'base64')).toString('utf8');
const loader=fs.readFileSync(`${base}/index.html`,'utf8');

const count=pattern=>(html.match(pattern)||[]).length;
assert(count(/<section class="stage-block"/g)===3,'O percurso deve conter 3 etapas.');
assert(count(/<section class="chapter(?:\s+chapter-divider)?" id="capitulo-\d+"/g)===10,'O percurso deve conter 10 capítulos.');
assert(count(/<article class="movement"/g)===56,'O percurso deve conter 56 movimentos.');
assert(count(/class="trail"/g)===1,'O percurso deve conter uma trilha opcional.');

const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
assert(ids.length===new Set(ids).size,'Há IDs duplicados no HTML.');
const idSet=new Set(ids);
for(const [,target] of html.matchAll(/href="#([^"]+)"/g)){
  assert(idSet.has(target),`Link interno sem destino: #${target}`);
}

const movementBlocks=[...html.matchAll(/<article class="movement" id="([^"]+)">([\s\S]*?)(?=<article class="movement"|<\/section>\s*(?:<section class="chapter|<section class="stage|<div class="stage-closing|<section class="annual-sources))/g)];
assert(movementBlocks.length===56,'Não foi possível validar os 56 movimentos individualmente.');
for(const [,id,block] of movementBlocks){
  assert(/class="pages">No livro · p\. \d+(?:–\d+)?<\/p>/.test(block),`Movimento sem páginas específicas: ${id}`);
}

const expectedChapter1=[
  ['movimento-1','p. 12–16'],
  ['movimento-2','p. 17–19'],
  ['movimento-3','p. 19–21'],
  ['movimento-4','p. 21–22'],
  ['movimento-5','p. 23–25'],
  ['movimento-6','p. 23–25']
];
for(const [id,pages] of expectedChapter1){
  const block=movementBlocks.find(item=>item[1]===id)?.[2]||'';
  assert(block.includes(`No livro · ${pages}`),`Paginação incorreta em ${id}: esperado ${pages}.`);
}

const forbiddenPatterns=[
  [/\bfich(?:a|as)\b/i,'ficha'],
  [/\bocorrência(?:s)?\b/i,'ocorrência'],
  [/\bretomada(?:s)?\b/i,'retomada'],
  [/\bcanônic(?:a|o|as|os)\b/i,'canônica'],
  [/\bativad(?:a|o|as|os)\b/i,'ativado'],
  [/\bnão foi ativado\b/i,'não foi ativado'],
  [/\ba finalidade não é criar\b/i,'comentário de catalogação'],
  [/\brepertórios? culturais?\b/i,'rótulo genérico de obra'],
  [/purple|#5B2E91|#51425F|#3E1C68|Fraunces/i,'identidade visual proibida']
];
for(const [pattern,label] of forbiddenPatterns){
  assert(!pattern.test(html),`Conteúdo público contém ${label}.`);
}
assert(!/purple|#5B2E91|#51425F|#3E1C68|Fraunces/i.test(loader),'O carregador contém identidade visual proibida.');

const entityMatches=[...html.matchAll(/<details class="[^"]*\bentity\b[^"]*" id="([^"]+)"[\s\S]*?<summary>[\s\S]*?<strong>([^<]+)<\/strong>/g)];
assert(entityMatches.length===107,`Quantidade inesperada de entidades: ${entityMatches.length}.`);
const entityIds=entityMatches.map(match=>match[1]);
const entityTitles=entityMatches.map(match=>match[2].trim());
assert(entityIds.length===new Set(entityIds).size,'Há entidades com ID duplicado.');
assert(entityTitles.length===new Set(entityTitles).size,'Há entidades públicas duplicadas por título.');
for(const title of entityTitles){
  assert(!/(ocorrência|retomada)/i.test(title),`Pseudoentidade pública: ${title}`);
}
for(const id of [
  'entidade-aristoteles',
  'entidade-platao',
  'entidade-immanuel-kant',
  'entidade-karl-popper',
  'entidade-falseabilidade-e-verdade-provisoria',
  'entidade-deducao-e-inducao',
  'entidade-etica-e-moral',
  'entidade-liberdade-escolha-e-responsabilidade',
  'entidade-metafisica-em-debate'
]){
  assert(entityIds.filter(value=>value===id).length===1,`Entidade canônica ausente ou duplicada: ${id}`);
}

assert(count(/<section class="linked-set"/g)===17,'A reconstrução deve conter 17 relações validadas.');
assert(count(/data-component="validated-relation"/g)===17,'Toda relação precisa declarar sua função.');
assert(!/data-member-count="1"/.test(html),'Há agrupamento relacional de cartão único.');
assert(count(/<section class="comparison-set"/g)===10,'A reconstrução deve conter 10 comparações ou debates.');
assert(count(/<section class="concept-family"/g)===7,'A reconstrução deve conter 7 famílias ou dimensões conceituais.');

for(const composite of [
  'Theodor Adorno e Max Horkheimer',
  'Charles Peirce e Ferdinand de Saussure',
  'Claude Shannon e Warren Weaver',
  'Jeremy Bentham e John Stuart Mill',
  'Zenão e os paradoxos do movimento'
]){
  assert(!entityTitles.includes(composite),`Autoria composta ainda projetada como entidade: ${composite}`);
}

assert(html.includes('class="utility-bar"'),'Barra de utilidades ausente.');
for(const id of ['material-open','install-app','search-toggle','site-search','material-dialog','material-generate']){
  assert(html.includes(`id="${id}"`),`Utilidade ausente: ${id}`);
}
for(const label of ['Material para aula','Material de revisão','Lista de exercícios']){
  assert(html.includes(label),`Tipo de material ausente: ${label}`);
}
assert(html.includes('data-material-generator="v1"'),'Contrato do gerador ausente.');
assert(html.includes('data-bank-untouched="true"'),'Confirmação de Banco intocado ausente.');
assert(html.includes('data-public-editorial-leaks="0"'),'Marcador de limpeza pública ausente.');

assert(loader.includes('accessibility-patch.js'),'O carregador não aplica acessibilidade.');
assert(!loader.includes('visual-patch.js'),'O carregador ainda aplica a camada visual antiga.');
for(const file of chunks.map(path=>path.split('/').pop())){
  assert(loader.includes(`"${file}"`),`O carregador não referencia ${file}.`);
}

console.log(JSON.stringify({
  etapas:3,
  capitulos:10,
  movimentos:56,
  trilhas:1,
  entidades:107,
  relacoes_validadas:17,
  comparacoes:10,
  familias_conceituais:7,
  linguagem_de_bastidor:0,
  paginas_especificas:56,
  utilidades:['Início','Material','Instalar','Buscar']
},null,2));
