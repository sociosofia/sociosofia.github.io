import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const [legacy,publicacoes,cultural,proposal7,proposal8,approval7,approval8,history7,history8,original]=await Promise.all([
  read('data/publicacao-legado.json'),read('data/publicacoes.json'),read('data/repertorios-canonicos.json'),
  read('data/propostas-migracao-legado-lote7-v1.json'),read('data/propostas-migracao-legado-lote8-final-v1.json'),
  read('data/aprovacoes-migracao-legado-lote7-v1.json'),read('data/aprovacoes-migracao-legado-lote8-final-v1.json'),
  read('data/historico-migracao-legado-lote7-v1.json'),read('data/historico-migracao-legado-lote8-final-v1.json'),read('data/repertorios.json')
]);

const lot7=['CUL-0016','CUL-0017','CUL-0018','CUL-0019','CUL-0020','CUL-0021'];
const lot8=['CUL-0006','CUL-0022','CUL-0023','CUL-0024','CUL-0025','CUL-0026'];
const all=[...lot7,...lot8];
assert(legacy.estado_publico==='encerrado'&&legacy.ids.length===0,'O portão legado não foi encerrado.');
assert(legacy.migrados.length===33&&new Set(legacy.migrados.map(item=>item.id)).size===33,'O registro cumulativo de migrados está incorreto.');
assert(publicacoes.length===12&&cultural.length===26,'As bases canônicas finais devem conter 12 dados e 26 repertórios culturais.');
const publicIds=[...publicacoes.map(item=>item.id),...cultural.map(item=>item.id)];
assert(publicIds.length===38&&new Set(publicIds).size===38,'O conjunto público final deve conter 38 IDs únicos.');

validateLot('legado-lote7-v1',lot7,proposal7,approval7,history7);
validateLot('legado-lote8-final-v1',lot8,proposal8,approval8,history8);
const originalMap=new Map(original.map(item=>[item.id,item]));
const canonicalMap=new Map(cultural.map(item=>[item.id,item]));
for(const id of all){
  const item=canonicalMap.get(id);
  assert(item,`${id} não possui destino canônico.`);
  assert(item.status==='publicado'&&item.aprovacao?.status==='aprovado',`${id} não está publicado com aprovação válida.`);
  assert(item.autores?.length===0,`${id} contém relação autoral automática.`);
  assert(item.origem_migracao?.id_legado===id,`${id} perdeu o vínculo com o ID legado.`);
  assert(originalMap.has(id),`${id} não existe no acervo original.`);
}

const serialized=JSON.stringify({publicacoes,cultural}).toLowerCase();
assert(!serialized.includes('r001-c02'),'R001-C02 apareceu na publicação final.');
assert(!serialized.includes('salário digno'),'O card de salário digno apareceu na publicação final.');
console.log('Encerramento do legado validado: 12 dados + 26 repertórios culturais = 38 conteúdos canônicos.');

function validateLot(lote,ids,proposal,approval,history){
  assert(proposal.lote===lote&&approval.lote===lote&&history.lote===lote,`Metadados inconsistentes em ${lote}.`);
  assert(JSON.stringify(proposal.propostas.map(item=>item.id))===JSON.stringify(ids),`Propostas incorretas em ${lote}.`);
  assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(ids)&&approval.itens.every(item=>item.decisao==='aprovado'),`Aprovação incompleta em ${lote}.`);
  assert(JSON.stringify(history.itens.map(item=>item.id))===JSON.stringify(ids),`Histórico incompleto em ${lote}.`);
  assert(history.itens.every(item=>item.registro_anterior?.id===item.id),`Uma versão anterior não foi preservada em ${lote}.`);
}
