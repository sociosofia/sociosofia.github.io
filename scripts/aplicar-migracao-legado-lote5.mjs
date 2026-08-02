import {readFile,writeFile} from 'node:fs/promises';
import {themeMapFromRegistry} from '../publication-contract.mjs';
import {validateRepertoryCollection} from '../repertory-contract.mjs';

const root=new URL('../',import.meta.url);
const expected=['CUL-0007','CUL-0008','CUL-0009'];
const [proposals,approval,legacy,repertorios,publications,cultural,themes]=await Promise.all([
  read('data/propostas-migracao-legado-lote5-v1.json'),
  read('data/aprovacoes-migracao-legado-lote5-v1.json'),
  read('data/publicacao-legado.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json'),
  read('data/temas.json')
]);

assert(proposals.status==='aprovado','As propostas do quinto lote não estão aprovadas.');
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação nominal do quinto lote é inválida.');
assert(approval.autoriza_migracao_tecnica===true,'A migração técnica não foi autorizada.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao quinto trio.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não corresponde ao quinto trio.');

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
  lote:'legado-lote5-v1',
  data_migracao:'2026-08-02',
  aprovado_por:'Luiz Jácomo',
  itens:expected.map(id=>({id,registro_anterior:sourceMap.get(id)}))
};

const culturalRecords=expected.map(id=>{
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
      lote:'legado-lote5-v1',
      id_legado:item.id,
      historico_ref:'data/historico-migracao-legado-lote5-v1.json',
      aprovacao_ref:'data/aprovacoes-migracao-legado-lote5-v1.json'
    },
    destaque:item.destaque,
    tags:item.tags
  };
});

const nextCultural=[...cultural,...culturalRecords].sort((a,b)=>a.id.localeCompare(b.id));
const nextLegacy={
  ...legacy,
  versao:'1.5',
  criterio:'Após o quinto lote de migração, permanecem 18 repertórios culturais no estado transitório. Todos os sete cards DAD originalmente legados já possuem projeção canônica.',
  migrados:[...(legacy.migrados||[]),...expected.map(id=>({id,lote:'legado-lote5-v1',destino:'data/repertorios-canonicos.json'}))],
  ids:(legacy.ids||[]).filter(id=>!expected.includes(id))
};

const themeIds=new Set(themeMapFromRegistry(themes).keys());
const culturalValidation=validateRepertoryCollection(nextCultural,{themeIds});
assert(culturalValidation.errors.length===0,'A base cultural falhou no contrato: '+culturalValidation.errors.join(' | '));
assert(nextLegacy.ids.length===18,'O legado deveria conter 18 itens após o quinto lote.');
assert(publications.length===12,'A base de dados deveria permanecer com 12 cards.');
assert(nextCultural.length===8,'A base cultural deveria conter 8 cards.');
const allPublic=[...nextLegacy.ids,...publications.map(item=>item.id),...nextCultural.map(item=>item.id)];
assert(allPublic.length===38&&new Set(allPublic).size===38,'O conjunto público não preservou 38 IDs únicos.');

await Promise.all([
  write('data/historico-migracao-legado-lote5-v1.json',history),
  write('data/publicacao-legado.json',nextLegacy),
  write('data/repertorios-canonicos.json',nextCultural)
]);

console.log('Quinto lote aplicado: 18 legados, 12 dados e 8 repertórios culturais.');

function assert(condition,message){if(!condition)throw new Error(message);}
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
async function write(path,value){await writeFile(new URL(path,root),JSON.stringify(value,null,2)+'\n');}

// Commit de disparo: o workflow já existe no histórico da branch.
