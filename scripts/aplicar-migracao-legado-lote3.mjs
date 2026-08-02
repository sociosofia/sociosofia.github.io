import {readFile,writeFile} from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const expected=['DAD-0001','DAD-0005','CUL-0002'];
const dataIds=new Set(['DAD-0001','DAD-0005']);
const codes={
  'DAD-0001':'R000-C01',
  'DAD-0005':'R000-C05'
};
const evis={
  'DAD-0001':'EVI-juventudes-minorizadas-pnad-educacao-raca-2025',
  'DAD-0005':'EVI-sinte-sc-saude-docente-2025'
};

const [proposals,approval,legacy,repertorios,publicacoes,culturais]=await Promise.all([
  read('data/propostas-migracao-legado-lote3-v1.json'),
  read('data/aprovacoes-migracao-legado-lote3-v1.json'),
  read('data/publicacao-legado.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json')
]);

assert(proposals.status==='aprovado','O terceiro lote não está aprovado.');
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação nominal não foi encontrada.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao terceiro trio.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não cobre o terceiro trio.');

const legacyIds=new Set(legacy.ids||[]);
const existingCanonical=new Set([...publicacoes,...culturais].map(item=>item.id));
for(const id of expected){
  assert(legacyIds.has(id),`${id} não está mais no estado publicado_legado.`);
  assert(!existingCanonical.has(id),`${id} já existe em base canônica.`);
}

const repertoryMap=new Map(repertorios.map(item=>[item.id,item]));
for(const id of expected)assert(repertoryMap.has(id),`O registro histórico ${id} não existe em data/repertorios.json.`);

const history={
  versao:'1.0',
  lote:'legado-lote3-v1',
  data_migracao:'2026-08-02',
  descricao:'Cópia integral dos registros anteriores à terceira migração canônica do acervo legado.',
  aprovado_por:'Luiz Jácomo',
  aprovacao_ref:'data/aprovacoes-migracao-legado-lote3-v1.json',
  registros:expected.map(id=>({id,registro_anterior:repertoryMap.get(id)}))
};

for(const proposal of proposals.propostas){
  if(dataIds.has(proposal.id)){
    publicacoes.push(toDataPublication(proposal));
  }else{
    culturais.push(toCulturalPublication(proposal));
  }
}

publicacoes.sort((a,b)=>a.id.localeCompare(b.id,'pt-BR'));
culturais.sort((a,b)=>a.id.localeCompare(b.id,'pt-BR'));
legacy.ids=legacy.ids.filter(id=>!expected.includes(id));
legacy.migrados=[...(legacy.migrados||[]),
  {id:'DAD-0001',lote:'legado-lote3-v1',destino:'data/publicacoes.json'},
  {id:'DAD-0005',lote:'legado-lote3-v1',destino:'data/publicacoes.json'},
  {id:'CUL-0002',lote:'legado-lote3-v1',destino:'data/repertorios-canonicos.json'}
];
legacy.versao='1.3';
legacy.criterio='Após o terceiro lote de migração, permanecem 1 card DAD e 23 cards CUL no estado transitório. Rascunhos futuros e itens em revisão não entram automaticamente nesta lista.';

assert(legacy.ids.length===24,'O portão transitório deveria conter 24 itens após o terceiro lote.');
assert(publicacoes.length===11,'A base canônica de dados deveria conter 11 registros.');
assert(culturais.length===3,'A base cultural canônica deveria conter 3 registros.');
assert(new Set([...legacy.ids,...publicacoes.map(item=>item.id),...culturais.map(item=>item.id)]).size===38,'A migração criou duplicação ou perda de IDs públicos.');

await Promise.all([
  write('data/historico-migracao-legado-lote3-v1.json',history),
  write('data/publicacao-legado.json',legacy),
  write('data/publicacoes.json',publicacoes),
  write('data/repertorios-canonicos.json',culturais)
]);

console.log('Terceiro lote migrado para as bases canônicas.');

function toDataPublication(item){
  return {
    versao_contrato:'1.0',
    modelo_publico:'card_dados_v1',
    id:item.id,
    codigo_publicacao:codes[item.id],
    codigo_migracao:`MIG-L03-${item.id}`,
    evi_id:evis[item.id],
    tema_ids:item.tema_ids,
    editoria:item.editoria,
    categoria:item.categoria,
    subtema:item.subtema,
    titulo:item.titulo,
    subtitulo:item.subtitulo,
    tipo:item.tipo,
    resumo:item.resumo,
    dado:item.dado,
    contextualizacao:item.contextualizacao,
    interpretacao_sociosofia:item.interpretacao_sociosofia,
    questao:item.questao,
    conexoes:item.conexoes,
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
      lote:'legado-lote3-v1',
      id_legado:item.id,
      historico_ref:'data/historico-migracao-legado-lote3-v1.json',
      aprovacao_ref:'data/aprovacoes-migracao-legado-lote3-v1.json'
    },
    destaque:Boolean(item.destaque),
    tags:item.tags
  };
}

function toCulturalPublication(item){
  return {
    versao_contrato:'1.0',
    modelo_publico:'card_repertorio_v1',
    id:item.id,
    codigo_migracao:`MIG-L03-${item.id}`,
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
      lote:'legado-lote3-v1',
      id_legado:item.id,
      historico_ref:'data/historico-migracao-legado-lote3-v1.json',
      aprovacao_ref:'data/aprovacoes-migracao-legado-lote3-v1.json'
    },
    destaque:Boolean(item.destaque),
    tags:item.tags
  };
}

function assert(condition,message){if(!condition)throw new Error(message);}
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
async function write(path,value){await writeFile(new URL(path,root),JSON.stringify(value,null,2)+'\n','utf8');}
