import fs from 'node:fs';
import zlib from 'node:zlib';

function assert(condition,message){
  if(!condition)throw new Error(message);
}

const base='alunos/filosofia-1ano';
const chunks=Array.from({length:8},(_,index)=>`${base}/page-${String(index+1).padStart(2,'0')}.b64`);
const encoded=chunks.map(file=>{
  assert(fs.existsSync(file),`Arquivo ausente: ${file}`);
  return fs.readFileSync(file,'utf8').trim();
}).join('');

const html=zlib.gunzipSync(Buffer.from(encoded,'base64')).toString('utf8');
const loader=fs.readFileSync(`${base}/index.html`,'utf8');

const count=(pattern)=>(html.match(pattern)||[]).length;
assert(count(/<section class="stage-block"/g)===3,'O percurso deve conter exatamente 3 etapas.');
assert(count(/<section class="chapter(?:\s+chapter-divider)?" id="capitulo-\d+"/g)===10,'O percurso deve conter exatamente 10 capítulos.');
assert(count(/<article class="movement"/g)===56,'O percurso deve conter exatamente 56 movimentos.');
assert(count(/class="trail"/g)===1,'O percurso deve conter exatamente uma trilha opcional.');

const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
assert(ids.length===new Set(ids).size,'Há IDs duplicados no HTML anual.');

const idSet=new Set(ids);
for(const [,href] of html.matchAll(/href="#([^"]+)"/g)){
  assert(idSet.has(href),`Link interno sem destino: #${href}`);
}

for(const forbidden of ['purple','#5B2E91','#51425F','#3E1C68','Fraunces','aguardando revisão','SOC-0007','SOC-0008','versão local','Decisões editoriais']){
  assert(!html.toLowerCase().includes(forbidden.toLowerCase()),`Conteúdo público contém termo proibido: ${forbidden}`);
}

assert(html.includes('p. 12–25'),'Paginação do início do percurso não foi preservada.');
assert(html.includes('p. 156–177'),'Paginação do fim do percurso não foi preservada.');
assert(loader.includes('accessibility-patch.js'),'O carregador não aplica o patch de acessibilidade.');
assert(!loader.includes('visual-patch.js'),'O carregador ainda aplica a camada visual antiga.');
assert(!/purple|Fraunces|#5B2E91|#51425F|#3E1C68/i.test(loader),'O carregador contém a identidade visual proibida.');
for(const file of chunks.map(path=>path.split('/').pop())){
  assert(loader.includes(`"${file}"`),`O carregador não referencia ${file}.`);
}

console.log('Filosofia do 1º ano: percurso anual validado.');
