import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const [proposals,approval,legacy,publicacoes,cultural]=await Promise.all([read('data/propostas-migracao-legado-lote7-v1.json'),read('data/aprovacoes-migracao-legado-lote7-v1.json'),read('data/publicacao-legado.json'),read('data/publicacoes.json'),read('data/repertorios-canonicos.json')]);
const expected=['CUL-0016','CUL-0017','CUL-0018','CUL-0019','CUL-0020','CUL-0021'];
assert(proposals.status==='em_revisao','O snapshot das propostas deve permanecer como submetido à revisão.');
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação nominal do sétimo lote é inválida.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected)&&approval.itens.every(item=>item.decisao==='aprovado'),'A aprovação não cobre integralmente o sétimo lote.');
assert(approval.efeitos?.publicacao_imediata===false&&approval.efeitos?.criar_relacoes_automaticas===false,'Os efeitos da aprovação são inválidos.');
const legacyIds=new Set(legacy.ids||[]); const canonicalIds=new Set(cultural.map(item=>item.id));
const flags=expected.map(id=>canonicalIds.has(id)); assert(flags.every(Boolean)||flags.every(flag=>!flag),'O sétimo lote ficou parcialmente migrado.');
const migrated=flags.every(Boolean);
for(const id of expected){assert(migrated?!legacyIds.has(id):legacyIds.has(id),`${id} apresenta estado legado incoerente.`);assert(migrated?canonicalIds.has(id):!canonicalIds.has(id),`${id} apresenta estado canônico incoerente.`);}
if(migrated)assert(legacy.ids.length===0&&publicacoes.length===12&&cultural.length===26,'O estado final está incorreto.');
else assert(legacy.ids.length===12&&publicacoes.length===12&&cultural.length===14,'O estado anterior está incorreto.');
console.log(migrated?'Aprovação do sétimo lote preservada após migração.':'Aprovação do sétimo lote registrada antes da migração.');
