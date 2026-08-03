import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [proposals,approval,legacy,publicacoes,cultural]=await Promise.all([
  read('data/propostas-migracao-legado-lote8-final-v1.json'),
  read('data/aprovacoes-migracao-legado-lote8-final-v1.json'),
  read('data/publicacao-legado.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json')
]);

const expected=['CUL-0006','CUL-0022','CUL-0023','CUL-0024','CUL-0025','CUL-0026'];
assert(proposals.status==='em_revisao','O snapshot das propostas deve permanecer como submetido à revisão.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao lote final.');
assert(approval.status==='aprovado','A decisão editorial do lote final não está aprovada.');
assert(approval.aprovado_por==='Luiz Jácomo','A aprovação nominal do lote final é inválida.');
assert(approval.data==='2026-08-03','A data da aprovação do lote final é inválida.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não cobre exatamente os seis IDs finais.');
assert(approval.itens.every(item=>item.decisao==='aprovado'),'Há item não aprovado no lote final.');
assert(approval.efeitos?.publicacao_imediata===false,'A aprovação editorial publicou cards prematuramente.');
assert(approval.efeitos?.migracao_tecnica_separada===true,'A aprovação não preservou a etapa técnica separada.');
assert(approval.efeitos?.migracao_conjunta_com_lote7_permitida===true,'A aprovação não registrou a aceleração conjunta com o lote 7.');
assert(approval.efeitos?.preservar_historicos_separados===true,'A aprovação não preservou históricos separados.');
assert(approval.efeitos?.criar_relacoes_automaticas===false,'A aprovação autorizou relações automáticas indevidas.');

const legacyIds=new Set(legacy.ids||[]);
const canonicalIds=new Set([...publicacoes,...cultural].map(item=>item.id));
for(const id of expected){
  assert(legacyIds.has(id),`${id} deixou publicado_legado antes da migração técnica.`);
  assert(!canonicalIds.has(id),`${id} entrou em base canônica antes da migração técnica.`);
}
assert(legacy.ids.length===12&&publicacoes.length===12&&cultural.length===14,'A aprovação editorial alterou o estado público vigente.');
assert(legacy.ids.length+publicacoes.length+cultural.length===38,'A aprovação editorial alterou o total público de 38 conteúdos.');

console.log('Aprovação integral do lote final registrada sem publicação prematura.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
