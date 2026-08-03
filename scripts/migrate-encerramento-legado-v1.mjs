import {readFile,writeFile} from 'node:fs/promises';
import {validateRepertoryCollection} from '../repertory-contract.mjs';

const root=new URL('../',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const write=async(path,value)=>writeFile(new URL(path,root),`${JSON.stringify(value,null,2)}\n`,'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const [proposal7,proposal8,approval7,approval8,legacy,canonical,original,publicacoes,themes]=await Promise.all([
  read('data/propostas-migracao-legado-lote7-v1.json'),
  read('data/propostas-migracao-legado-lote8-final-v1.json'),
  read('data/aprovacoes-migracao-legado-lote7-v1.json'),
  read('data/aprovacoes-migracao-legado-lote8-final-v1.json'),
  read('data/publicacao-legado.json'),
  read('data/repertorios-canonicos.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/temas.json')
]);

const lot7=['CUL-0016','CUL-0017','CUL-0018','CUL-0019','CUL-0020','CUL-0021'];
const lot8=['CUL-0006','CUL-0022','CUL-0023','CUL-0024','CUL-0025','CUL-0026'];
const all=[...lot7,...lot8];

validateSnapshot(proposal7,approval7,lot7,'legado-lote7-v1');
validateSnapshot(proposal8,approval8,lot8,'legado-lote8-final-v1');
assert(approval8.efeitos?.migracao_conjunta_com_lote7_permitida===true,'A aprovação final não autoriza a migração técnica conjunta.');
assert(approval8.efeitos?.preservar_historicos_separados===true,'A aprovação final não preserva históricos separados.');

const legacyIds=new Set(legacy.ids||[]);
assert(legacyIds.size===12,'O portão legado deve conter exatamente 12 IDs antes do encerramento.');
for(const id of all)assert(legacyIds.has(id),`${id} não está no portão legado antes da migração.`);
assert(all.every(id=>!canonical.some(item=>item.id===id)),'Um dos 12 IDs já existe na base canônica.');

const originalMap=new Map(original.map(item=>[item.id,item]));
for(const id of all)assert(originalMap.has(id),`${id} não existe no acervo original.`);

const projected7=proposal7.propostas.map(item=>project(item,approval7,'legado-lote7-v1','L07'));
const projected8=proposal8.propostas.map(item=>project(item,approval8,'legado-lote8-final-v1','L08'));
const nextCanonical=[...canonical,...projected7,...projected8];

const themeIds=new Set((themes.temas||[]).map(theme=>theme.id));
const validated=validateRepertoryCollection(nextCanonical,{themeIds});
assert(validated.errors.length===0,`Contrato cultural inválido:\n${validated.errors.join('\n')}`);
assert(nextCanonical.length===26,'A base cultural final deve conter 26 registros canônicos.');
assert(new Set(nextCanonical.map(item=>item.id)).size===26,'A base cultural final contém IDs duplicados.');

const history7=history('legado-lote7-v1',approval7,lot7,originalMap);
const history8=history('legado-lote8-final-v1',approval8,lot8,originalMap);
const migrated=[...(legacy.migrados||[])];
for(const id of lot7)migrated.push({id,lote:'legado-lote7-v1',destino:'data/repertorios-canonicos.json'});
for(const id of lot8)migrated.push({id,lote:'legado-lote8-final-v1',destino:'data/repertorios-canonicos.json'});
assert(new Set(migrated.map(item=>item.id)).size===33,'O registro cumulativo de migrações contém duplicações.');

const nextLegacy={
  ...legacy,
  versao:'1.8',
  estado_publico:'encerrado',
  descricao:'Migração canônica do acervo público legado concluída. O registro é preservado apenas como trilha histórica do processo.',
  criterio:'Após os lotes 7 e 8, nenhum conteúdo permanece no estado transitório publicado_legado. Os 12 dados e os 26 repertórios culturais públicos possuem projeções canônicas.',
  migrados:migrated,
  ids:[]
};

const allPublic=[...publicacoes.map(item=>item.id),...nextCanonical.map(item=>item.id)];
assert(publicacoes.length===12,'A base de dados canônica deixou de conter 12 registros.');
assert(allPublic.length===38&&new Set(allPublic).size===38,'O conjunto público final deve conter 38 IDs únicos.');
const serialized=JSON.stringify({publicacoes,nextCanonical}).toLowerCase();
assert(!serialized.includes('r001-c02'),'R001-C02 apareceu na publicação final.');
assert(!serialized.includes('salário digno'),'O card de salário digno apareceu na publicação final.');

await Promise.all([
  write('data/repertorios-canonicos.json',nextCanonical),
  write('data/publicacao-legado.json',nextLegacy),
  write('data/historico-migracao-legado-lote7-v1.json',history7),
  write('data/historico-migracao-legado-lote8-final-v1.json',history8)
]);

console.log('Encerramento do legado gerado: 0 legados + 12 dados + 26 repertórios culturais = 38 conteúdos públicos.');

function validateSnapshot(proposal,approval,expected,lote){
  assert(proposal.lote===lote,`Proposta incorreta para ${lote}.`);
  assert(JSON.stringify(proposal.propostas.map(item=>item.id))===JSON.stringify(expected),`IDs incorretos em ${lote}.`);
  assert(approval.lote===lote&&approval.status==='aprovado',`Aprovação inválida para ${lote}.`);
  assert(approval.aprovado_por==='Luiz Jácomo',`Aprovação nominal inválida para ${lote}.`);
  assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),`A aprovação não cobre exatamente ${lote}.`);
  assert(approval.itens.every(item=>item.decisao==='aprovado'),`Há item não aprovado em ${lote}.`);
}

function project(item,approval,lote,code){
  const {modelo_proposto,estado_publico_preservado,status_editorial_proposto,...content}=item;
  return {
    versao_contrato:'1.0',
    modelo_publico:'card_repertorio_v1',
    codigo_migracao:`MIG-${code}-${item.id}`,
    ...content,
    status:'publicado',
    aprovacao:{status:'aprovado',aprovado_por:approval.aprovado_por,data:approval.data},
    origem_migracao:{
      lote,
      id_legado:item.id,
      historico_ref:`data/historico-migracao-${lote}.json`,
      aprovacao_ref:`data/aprovacoes-migracao-${lote}.json`
    }
  };
}

function history(lote,approval,ids,originalMap){
  return {
    versao:'1.0',
    lote,
    data_migracao:'2026-08-03',
    aprovado_por:approval.aprovado_por,
    itens:ids.map(id=>({id,registro_anterior:originalMap.get(id)}))
  };
}
