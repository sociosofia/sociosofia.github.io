import {readFile,writeFile} from 'node:fs/promises';
import {themeMapFromRegistry,validatePublicationCollection} from '../publication-contract.mjs';
import {validateRepertoryCollection} from '../repertory-contract.mjs';

const root=new URL('../',import.meta.url);
const expected=['DAD-0003','CUL-0004','CUL-0005'];
const [proposals,approval,legacy,repertorios,publications,cultural,themes]=await Promise.all([
  read('data/propostas-migracao-legado-lote4-v1.json'),
  read('data/aprovacoes-migracao-legado-lote4-v1.json'),
  read('data/publicacao-legado.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json'),
  read('data/temas.json')
]);

assert(proposals.status==='aprovado','As propostas do quarto lote não estão aprovadas.');
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação nominal do quarto lote é inválida.');
assert(approval.autoriza_migracao_tecnica===true,'A migração técnica não foi autorizada.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao quarto trio.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não corresponde ao quarto trio.');

const legacyIds=new Set(legacy.ids||[]);
const publicationIds=new Set(publications.map(item=>item.id));
const culturalIds=new Set(cultural.map(item=>item.id));
for(const id of expected){
  assert(legacyIds.has(id),`${id} não está mais em publicado_legado.`);
  assert(!publicationIds.has(id)&&!culturalIds.has(id),`${id} já existe em uma base canônica.`);
}

const sourceMap=new Map(repertorios.map(item=>[item.id,item]));
const proposalMap=new Map(proposals.propostas.map(item=>[item.id,item]));
for(const id of expected)assert(sourceMap.has(id),`A versão histórica de ${id} não foi encontrada.`);

const history={
  versao:'1.0',
  lote:'legado-lote4-v1',
  data_migracao:'2026-08-02',
  aprovado_por:'Luiz Jácomo',
  itens:expected.map(id=>({id,registro_anterior:sourceMap.get(id)}))
};

const dataProposal=proposalMap.get('DAD-0003');
const dataRecord={
  versao_contrato:'1.0',
  modelo_publico:'card_dados_v1',
  id:dataProposal.id,
  codigo_publicacao:'R000-C03',
  codigo_migracao:'MIG-L04-DAD-0003',
  evi_id:'EVI-gepem-convivencia-medo-alunos-sp-2022',
  tema_ids:dataProposal.tema_ids,
  editoria:dataProposal.editoria,
  categoria:dataProposal.categoria,
  subtema:dataProposal.subtema,
  titulo:dataProposal.titulo,
  subtitulo:dataProposal.subtitulo,
  tipo:dataProposal.tipo,
  resumo:dataProposal.resumo,
  dado:dataProposal.dado,
  contextualizacao:dataProposal.contextualizacao,
  interpretacao_sociosofia:dataProposal.interpretacao_sociosofia,
  questao:dataProposal.questao,
  conexoes:dataProposal.conexoes,
  conceitos:dataProposal.conceitos,
  autores:[],
  autores_possiveis:dataProposal.autores_possiveis,
  relacoes_pendentes:dataProposal.relacoes_pendentes,
  fonte_nome:dataProposal.fonte_nome,
  fonte_url:dataProposal.fonte_url,
  ano_data:dataProposal.ano_data,
  confiabilidade:dataProposal.confiabilidade,
  fonte_status:dataProposal.fonte_status,
  nivel:dataProposal.nivel,
  status:'publicado',
  aprovacao:{status:'aprovado',aprovado_por:'Luiz Jácomo',data:'2026-08-02'},
  origem_migracao:{
    lote:'legado-lote4-v1',
    id_legado:dataProposal.id,
    historico_ref:'data/historico-migracao-legado-lote4-v1.json',
    aprovacao_ref:'data/aprovacoes-migracao-legado-lote4-v1.json'
  },
  destaque:dataProposal.destaque,
  tags:dataProposal.tags
};

const culturalRecords=['CUL-0004','CUL-0005'].map(id=>{
  const item=proposalMap.get(id);
  return {
    versao_contrato:'1.0',
    modelo_publico:'card_repertorio_v1',
    id:item.id,
    tema_ids:item.tema_ids,
    editoria:item.editoria,
    categoria:item.categoria,
    subtema:item.subtema,
    titulo:item.titulo,
    subtitulo:item.subtitulo,
    tipo:item.tipo,
    resumo:item.resumo,
    resumo_obra:item.resumo_obra,
    leitura_sociosofia:item.leitura_sociosofia,
    ancoragem_teorica:item.ancoragem_teorica,
    cuidado_pedagogico:item.cuidado_pedagogico,
    questao:item.questao,
    conceitos:item.conceitos,
    autores:[],
    autores_possiveis:item.autores_possiveis,
    relacoes_pendentes:item.relacoes_pendentes,
    fonte_nome:item.fonte_nome,
    fonte_url:item.fonte_url,
    ano_data:item.ano_data,
    confiabilidade:item.confiabilidade,
    fonte_status:item.fonte_status,
    nivel:item.nivel,
    status:'publicado',
    aprovacao:{status:'aprovado',aprovado_por:'Luiz Jácomo',data:'2026-08-02'},
    origem_migracao:{
      lote:'legado-lote4-v1',
      id_legado:item.id,
      historico_ref:'data/historico-migracao-legado-lote4-v1.json',
      aprovacao_ref:'data/aprovacoes-migracao-legado-lote4-v1.json'
    },
    destaque:item.destaque,
    tags:item.tags
  };
});

const nextPublications=[...publications,dataRecord].sort((a,b)=>a.id.localeCompare(b.id));
const nextCultural=[...cultural,...culturalRecords].sort((a,b)=>a.id.localeCompare(b.id));
const destinationById=new Map([
  ['DAD-0003','data/publicacoes.json'],
  ['CUL-0004','data/repertorios-canonicos.json'],
  ['CUL-0005','data/repertorios-canonicos.json']
]);
const nextLegacy={
  ...legacy,
  versao:'1.4',
  criterio:'Após o quarto lote de migração, permanecem 21 cards CUL no estado transitório. Todos os sete cards DAD originalmente legados já possuem projeção canônica.',
  migrados:[...(legacy.migrados||[]),...expected.map(id=>({id,lote:'legado-lote4-v1',destino:destinationById.get(id)}))],
  ids:(legacy.ids||[]).filter(id=>!expected.includes(id))
};

const themeIds=new Set(themeMapFromRegistry(themes).keys());
const dataValidation=validatePublicationCollection(nextPublications,{themeIds});
assert(dataValidation.errors.length===0,'A base de dados falhou no contrato: '+dataValidation.errors.join(' | '));
const culturalValidation=validateRepertoryCollection(nextCultural,{themeIds});
assert(culturalValidation.errors.length===0,'A base cultural falhou no contrato: '+culturalValidation.errors.join(' | '));
assert(nextLegacy.ids.length===21,'O legado deveria conter 21 itens após o quarto lote.');
assert(nextPublications.length===12,'A base de dados deveria conter 12 cards.');
assert(nextCultural.length===5,'A base cultural deveria conter 5 cards.');
const allPublic=[...nextLegacy.ids,...nextPublications.map(item=>item.id),...nextCultural.map(item=>item.id)];
assert(allPublic.length===38&&new Set(allPublic).size===38,'O conjunto público não preservou 38 IDs únicos.');

await Promise.all([
  write('data/historico-migracao-legado-lote4-v1.json',history),
  write('data/publicacao-legado.json',nextLegacy),
  write('data/publicacoes.json',nextPublications),
  write('data/repertorios-canonicos.json',nextCultural)
]);

console.log('Quarto lote aplicado: 21 legados, 12 dados e 5 repertórios culturais.');

function assert(condition,message){if(!condition)throw new Error(message);}
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
async function write(path,value){await writeFile(new URL(path,root),JSON.stringify(value,null,2)+'\n');}
