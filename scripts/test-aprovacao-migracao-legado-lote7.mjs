import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [proposals,approval,legacy,publicacoes,cultural]=await Promise.all([
  read('data/propostas-migracao-legado-lote7-v1.json'),
  read('data/aprovacoes-migracao-legado-lote7-v1.json'),
  read('data/publicacao-legado.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json')
]);

const expected=['CUL-0016','CUL-0017','CUL-0018','CUL-0019','CUL-0020','CUL-0021'];
assert(proposals.status==='em_revisao','O snapshot das propostas deve permanecer como submetido à revisão.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao sétimo lote.');
assert(approval.status==='aprovado','A decisão editorial do sétimo lote não está aprovada.');
assert(approval.aprovado_por==='Luiz Jácomo','A aprovação nominal do sétimo lote é inválida.');
assert(approval.data==='2026-08-02','A data da aprovação do sétimo lote é inválida.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não cobre exatamente os seis IDs do lote.');
assert(approval.itens.every(item=>item.decisao==='aprovado'),'Há item não aprovado no sétimo lote.');
assert(approval.efeitos?.publicacao_imediata===false,'A aprovação editorial publicou cards prematuramente.');
assert(approval.efeitos?.migracao_tecnica_separada===true,'A aprovação não preservou a migração técnica separada.');
assert(approval.efeitos?.criar_relacoes_automaticas===false,'A aprovação autorizou relações automáticas indevidas.');

const legacyIds=new Set(legacy.ids||[]);
const canonicalIds=new Set([...publicacoes,...cultural].map(item=>item.id));
for(const id of expected){
  assert(legacyIds.has(id),`${id} deixou publicado_legado antes da migração técnica.`);
  assert(!canonicalIds.has(id),`${id} entrou em base canônica antes da migração técnica.`);
}
assert(legacy.ids.length===12&&publicacoes.length===12&&cultural.length===14,'A aprovação editorial alterou o estado público vigente.');
assert(legacy.ids.length+publicacoes.length+cultural.length===38,'A aprovação editorial alterou o total público de 38 conteúdos.');

console.log('Aprovação integral do sétimo lote registrada sem publicação prematura.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
