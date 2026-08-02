import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [approval,history,legacy,repertorios,publicacoes,cultural]=await Promise.all([
  read('data/aprovacoes-migracao-legado-lote1-v1.json'),read('data/historico-migracao-legado-lote1-v1.json'),read('data/publicacao-legado.json'),read('data/repertorios.json'),read('data/publicacoes.json'),read('data/repertorios-canonicos.json')
]);
const expected=['DAD-0004','DAD-0007','CUL-0003'];
const dataIds=new Set(publicacoes.map(item=>item.id));
const culturalIds=new Set(cultural.map(item=>item.id));
const historyIds=new Set((history.registros||[]).map(item=>item.id));
const repertoryIds=new Set(repertorios.map(item=>item.id));
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação do primeiro lote é inválida.');
for(const id of expected){assert(!legacy.ids.includes(id),`${id} voltou ao legado.`);assert(historyIds.has(id),`${id} perdeu o histórico.`);assert(repertoryIds.has(id),`${id} deixou o acervo original.`);}
assert(dataIds.has('DAD-0004')&&dataIds.has('DAD-0007'),'Os dados do primeiro lote deixaram a base canônica.');
assert(culturalIds.has('CUL-0003'),'CUL-0003 deixou a base cultural.');
for(const id of ['DAD-0004','DAD-0007']){const item=publicacoes.find(entry=>entry.id===id);assert(item.origem_migracao?.lote==='legado-lote1-v1',`${id} perdeu a origem.`);assert(item.autores.length===0,`${id} criou relação automática.`);}
const her=cultural.find(item=>item.id==='CUL-0003');assert(her.origem_migracao?.lote==='legado-lote1-v1','CUL-0003 perdeu a origem.');assert(her.autores.length===0,'CUL-0003 criou relação automática.');
assert(legacy.ids.length===21&&publicacoes.length===12&&cultural.length===5,'As contagens globais após o quarto lote estão incorretas.');
assert(legacy.ids.length+publicacoes.length+cultural.length===38,'O total público deixou de ser 38.');
console.log('Primeiro lote continua íntegro após o quarto lote.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
