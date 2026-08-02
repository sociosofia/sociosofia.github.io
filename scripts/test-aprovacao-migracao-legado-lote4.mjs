import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [proposals,approval,legacy,publications,cultural]=await Promise.all([
  read('data/propostas-migracao-legado-lote4-v1.json'),read('data/aprovacoes-migracao-legado-lote4-v1.json'),read('data/publicacao-legado.json'),read('data/publicacoes.json'),read('data/repertorios-canonicos.json')
]);
const expected=['DAD-0003','CUL-0004','CUL-0005'];
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação nominal do quarto lote é inválida.');
assert(approval.autoriza_migracao_tecnica===true,'A migração técnica do quarto lote não foi autorizada.');
assert(approval.nao_autoriza_relacoes_automaticas===true,'A aprovação não preserva o bloqueio de relações automáticas.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não cobre exatamente o quarto trio.');
assert(approval.itens.every(item=>item.status==='aprovado'),'Há item não aprovado no quarto lote.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas e a aprovação não correspondem ao mesmo trio.');

const legacyIds=new Set(legacy.ids||[]);
const dataIds=new Set(publications.map(item=>item.id));
const culturalIds=new Set(cultural.map(item=>item.id));
const flags=[dataIds.has('DAD-0003'),culturalIds.has('CUL-0004'),culturalIds.has('CUL-0005')];
assert(flags.every(Boolean)||flags.every(flag=>!flag),'A aprovação foi aplicada apenas a parte do quarto trio.');
if(flags.every(Boolean)){
  for(const id of expected)assert(!legacyIds.has(id),`${id} permaneceu no legado após a migração.`);
}else{
  for(const id of expected)assert(legacyIds.has(id),`${id} deixou o legado antes da migração integral.`);
}

console.log(flags.every(Boolean)?'Aprovação nominal aplicada integralmente ao quarto lote.':'Aprovação nominal registrada sem publicação prematura.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
