import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [base,expansion,approval,legacy,publicacoes,cultural]=await Promise.all([
  read('data/propostas-migracao-legado-lote6-v1.json'),
  read('data/propostas-migracao-legado-lote6-ampliacao-v1.json'),
  read('data/aprovacoes-migracao-legado-lote6-v1.json'),
  read('data/publicacao-legado.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json')
]);

const expected=['CUL-0010','CUL-0011','CUL-0012','CUL-0013','CUL-0014','CUL-0015'];
const proposals=[...base.propostas,...expansion.propostas];
assert(base.status==='em_revisao'&&expansion.status==='em_revisao','Os snapshots das propostas devem permanecer como submetidos à revisão.');
assert(JSON.stringify(proposals.map(item=>item.id))===JSON.stringify(expected),'As propostas aprovadas não correspondem ao sexto lote.');
assert(approval.status==='aprovado','A decisão editorial do sexto lote não está aprovada.');
assert(approval.aprovado_por==='Luiz Jácomo','A aprovação nominal do sexto lote é inválida.');
assert(approval.data==='2026-08-02','A data da aprovação do sexto lote é inválida.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não cobre exatamente os seis IDs do lote.');
assert(approval.itens.every(item=>item.decisao==='aprovado'),'Há item não aprovado no sexto lote.');
assert(approval.efeitos?.publicacao_imediata===false,'A aprovação editorial autorizou publicação direta sem migração.');
assert(approval.efeitos?.migracao_tecnica_separada===true,'A aprovação não preservou a migração técnica separada.');
assert(approval.efeitos?.criar_relacoes_automaticas===false,'A aprovação autorizou relações automáticas indevidas.');

const legacyIds=new Set(legacy.ids||[]);
const culturalIds=new Set(cultural.map(item=>item.id));
const flags=expected.map(id=>culturalIds.has(id));
assert(flags.every(Boolean)||flags.every(flag=>!flag),'O sexto lote ficou parcialmente migrado.');
const migrated=flags.every(Boolean);
if(migrated){
  assert(legacy.ids.length===12&&publicacoes.length===12&&cultural.length===14,'As contagens após a migração do sexto lote estão incorretas.');
  for(const id of expected){
    assert(!legacyIds.has(id),`${id} permaneceu no legado após a migração.`);
    const item=cultural.find(entry=>entry.id===id);
    assert(item?.aprovacao?.aprovado_por==='Luiz Jácomo',`${id} não preservou a aprovação nominal.`);
  }
}else{
  assert(legacy.ids.length===18&&publicacoes.length===12&&cultural.length===8,'As contagens anteriores à migração do sexto lote estão incorretas.');
  for(const id of expected)assert(legacyIds.has(id),`${id} deixou o legado antes da migração.`);
}
assert(legacy.ids.length+publicacoes.length+cultural.length===38,'O total público deixou de ser 38 conteúdos.');

console.log(migrated?'Aprovação integral preservada após a migração do sexto lote.':'Aprovação integral registrada e aguardando migração técnica.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
