import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const proposals=JSON.parse(await readFile(new URL('data/propostas-migracao-legado-lote4-v1.json',root),'utf8'));
const approval=JSON.parse(await readFile(new URL('data/aprovacoes-migracao-legado-lote4-v1.json',root),'utf8'));
const legacy=JSON.parse(await readFile(new URL('data/publicacao-legado.json',root),'utf8'));
const publications=JSON.parse(await readFile(new URL('data/publicacoes.json',root),'utf8'));
const cultural=JSON.parse(await readFile(new URL('data/repertorios-canonicos.json',root),'utf8'));

const expected=['DAD-0003','CUL-0004','CUL-0005'];
assert(approval.status==='aprovado','O quarto lote não possui aprovação editorial.');
assert(approval.aprovado_por==='Luiz Jácomo','A aprovação não está atribuída a Luiz Jácomo.');
assert(approval.autoriza_migracao_tecnica===true,'A migração técnica do quarto lote não foi autorizada.');
assert(approval.nao_autoriza_relacoes_automaticas===true,'A aprovação não preserva o bloqueio de relações automáticas.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não cobre exatamente o quarto trio.');
assert(approval.itens.every(item=>item.status==='aprovado'),'Há item não aprovado no quarto lote.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas e a aprovação não correspondem ao mesmo trio.');

const legacyIds=new Set(legacy.ids||[]);
const canonicalIds=new Set([...publications,...cultural].map(item=>item.id));
for(const id of expected){
  assert(legacyIds.has(id),`${id} deixou o legado antes da migração técnica.`);
  assert(!canonicalIds.has(id),`${id} entrou prematuramente em base canônica.`);
}

console.log('Aprovação nominal do quarto lote registrada sem publicação prematura.');
