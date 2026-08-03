import {readFile,writeFile} from 'node:fs/promises';
import {validateRepertoryCollection} from '../repertory-contract.mjs';
import {themeMapFromRegistry} from '../publication-contract.mjs';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const paths={
  base:'data/propostas-migracao-legado-lote6-v1.json',
  expansion:'data/propostas-migracao-legado-lote6-ampliacao-v1.json',
  approval:'data/aprovacoes-migracao-legado-lote6-v1.json',
  legacy:'data/publicacao-legado.json',
  original:'data/repertorios.json',
  cultural:'data/repertorios-canonicos.json',
  publicacoes:'data/publicacoes.json',
  themes:'data/temas.json',
  history:'data/historico-migracao-legado-lote6-v1.json'
};

const [base,expansion,approval,legacy,original,cultural,publicacoes,themes]=await Promise.all([
  read(paths.base),read(paths.expansion),read(paths.approval),read(paths.legacy),
  read(paths.original),read(paths.cultural),read(paths.publicacoes),read(paths.themes)
]);

const expected=['CUL-0010','CUL-0011','CUL-0012','CUL-0013','CUL-0014','CUL-0015'];
const proposals=[...base.propostas,...expansion.propostas];
assert(JSON.stringify(proposals.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao sexto lote ampliado.');
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação nominal do sexto lote é inválida.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não cobre exatamente os seis IDs.');
assert(approval.itens.every(item=>item.decisao==='aprovado'),'Há item não aprovado no sexto lote.');

const legacyIds=new Set(legacy.ids||[]);
const culturalIds=new Set(cultural.map(item=>item.id));
const originalMap=new Map(original.map(item=>[item.id,item]));
const alreadyMigrated=expected.every(id=>!legacyIds.has(id)&&culturalIds.has(id));
if(alreadyMigrated){
  console.log('O sexto lote já está integralmente migrado.');
  process.exit(0);
}
for(const id of expected){
  assert(legacyIds.has(id),`${id} não está no portão legado.`);
  assert(!culturalIds.has(id),`${id} já existe na base cultural canônica.`);
  assert(originalMap.has(id),`${id} não possui registro histórico original.`);
}

const history={
  versao:'1.0',
  lote:'legado-lote6-v1',
  data_migracao:approval.data,
  aprovado_por:approval.aprovado_por,
  itens:expected.map(id=>({id,registro_anterior:originalMap.get(id)}))
};

const canonicalNew=proposals.map(proposal=>{
  const {modelo_proposto,estado_publico_preservado,status_editorial_proposto,...publicFields}=proposal;
  return {
    versao_contrato:'1.0',
    modelo_publico:'card_repertorio_v1',
    codigo_migracao:`MIG-L06-${proposal.id}`,
    ...publicFields,
    autores:[],
    status:'publicado',
    aprovacao:{
      status:'aprovado',
      aprovado_por:approval.aprovado_por,
      data:approval.data
    },
    origem_migracao:{
      lote:'legado-lote6-v1',
      id_legado:proposal.id,
      historico_ref:paths.history,
      aprovacao_ref:paths.approval
    }
  };
});

const nextCultural=[...cultural,...canonicalNew];
const nextLegacy={
  ...legacy,
  versao:'1.6',
  criterio:'Após o sexto lote de migração, permanecem 12 repertórios culturais no estado transitório. Todos os sete cards DAD originalmente legados já possuem projeção canônica.',
  migrados:[
    ...(legacy.migrados||[]),
    ...expected.map(id=>({id,lote:'legado-lote6-v1',destino:'data/repertorios-canonicos.json'}))
  ],
  ids:(legacy.ids||[]).filter(id=>!expected.includes(id))
};

assert(nextLegacy.ids.length===12,'O portão legado não ficou com 12 repertórios.');
assert(nextCultural.length===14,'A base cultural não ficou com 14 repertórios.');
assert(publicacoes.length===12,'A migração cultural alterou a base de dados.');
const themeIds=new Set(themeMapFromRegistry(themes).keys());
const validation=validateRepertoryCollection(nextCultural,{themeIds});
assert(validation.errors.length===0,'A coleção cultural falhou no contrato: '+validation.errors.join(' | '));
for(const item of canonicalNew){
  assert(item.autores.length===0,`${item.id} criou relação autoral automática.`);
  assert(item.status==='publicado'&&item.aprovacao.aprovado_por==='Luiz Jácomo',`${item.id} não preservou publicação e aprovação.`);
  assert(item.origem_migracao.lote==='legado-lote6-v1',`${item.id} perdeu a origem da migração.`);
}
const allPublic=[...nextLegacy.ids,...publicacoes.map(item=>item.id),...nextCultural.map(item=>item.id)];
assert(allPublic.length===38&&new Set(allPublic).size===38,'O conjunto público não preservou 38 IDs únicos.');
const serialized=JSON.stringify({publicacoes,nextCultural}).toLowerCase();
assert(!serialized.includes('r001-c02'),'R001-C02 apareceu durante a migração.');
assert(!serialized.includes('salário digno'),'O card de salário digno apareceu durante a migração.');

await Promise.all([
  write(paths.history,history),
  write(paths.cultural,nextCultural),
  write(paths.legacy,nextLegacy)
]);
console.log('Sexto lote aplicado: 12 legados, 12 dados e 14 repertórios culturais canônicos.');

async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
async function write(path,value){await writeFile(new URL(path,root),JSON.stringify(value,null,2)+'\n','utf8');}
