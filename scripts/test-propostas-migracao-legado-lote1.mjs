import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const proposals=await read('data/propostas-migracao-legado-lote1-v1.json');
const approvals=await read('data/aprovacoes-migracao-legado-lote1-v1.json');
const legacy=await read('data/publicacao-legado.json');
const publicacoes=await read('data/publicacoes.json');
const cultural=await read('data/repertorios-canonicos.json');

const expected=['DAD-0004','DAD-0007','CUL-0003'];
const proposed=proposals.propostas.map(item=>item.id);
const approved=(approvals.itens||[]).map(item=>item.id);
const migrated=new Set([...
  publicacoes.filter(item=>item.origem_migracao?.lote==='legado-lote1-v1').map(item=>item.id),
  ...cultural.filter(item=>item.origem_migracao?.lote==='legado-lote1-v1').map(item=>item.id)
]);

assert(JSON.stringify(proposed)===JSON.stringify(expected),'O conjunto original de propostas foi alterado.');
assert(approvals.status==='aprovado','O lote ainda não possui aprovação editorial registrada.');
assert(approvals.aprovado_por==='Luiz Jácomo','A aprovação não está atribuída a Luiz Jácomo.');
assert(JSON.stringify(approved)===JSON.stringify(expected),'A aprovação não cobre exatamente o trio proposto.');
assert(JSON.stringify([...migrated].sort())===JSON.stringify([...expected].sort()),'Nem todas as propostas aprovadas foram migradas para bases canônicas.');

for(const id of expected){
  assert(!legacy.ids.includes(id),`${id} continua como publicado_legado após a migração.`);
}

for(const item of proposals.propostas){
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${item.id} continha relação autoral apresentada como pronta na proposta aprovada.`);
  assert(Array.isArray(item.relacoes_pendentes)&&item.relacoes_pendentes.length>0,`${item.id} perdeu o registro de relações pendentes.`);
}

console.log('Propostas, aprovação e destinos canônicos do primeiro lote estão coerentes.');

async function read(path){
  return JSON.parse(await readFile(new URL(path,root),'utf8'));
}
