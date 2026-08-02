export const REPERTORY_CONTRACT_VERSION='1.0';
export const REPERTORY_MODEL='card_repertorio_v1';
export const REPERTORY_STATUS='publicado';
export const CULTURAL_CATEGORY='Séries, filmes, livros e músicas';

const REQUIRED_TEXT_FIELDS=[
  'id',
  'titulo',
  'tipo',
  'resumo_obra',
  'leitura_sociosofia',
  'fonte_nome',
  'fonte_url',
  'ano_data'
];

function isObject(value){
  return Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
}

function cleanText(value){
  return String(value??'').trim();
}

function validUrl(value){
  try{
    const parsed=new URL(value);
    return parsed.protocol==='https:'||parsed.protocol==='http:';
  }catch{
    return false;
  }
}

export function validateRepertory(item,{index=0,themeIds=new Set()}={}){
  const errors=[];
  const label=`repertório ${index+1}`;

  if(!isObject(item))return {valid:false,errors:[`${label}: deve ser um objeto.`]};

  REQUIRED_TEXT_FIELDS.forEach(field=>{
    if(!cleanText(item[field]))errors.push(`${label}: campo obrigatório ausente: ${field}.`);
  });

  if(item.versao_contrato!==REPERTORY_CONTRACT_VERSION){
    errors.push(`${label}: versao_contrato deve ser ${REPERTORY_CONTRACT_VERSION}.`);
  }

  if(item.modelo_publico!==REPERTORY_MODEL){
    errors.push(`${label}: modelo_publico deve ser ${REPERTORY_MODEL}.`);
  }

  if(item.status!==REPERTORY_STATUS){
    errors.push(`${label}: somente repertórios com status publicado podem permanecer em data/repertorios-canonicos.json.`);
  }

  if(!/^CUL-\d{4}$/.test(cleanText(item.id))){
    errors.push(`${label}: id público deve seguir o padrão CUL-0000.`);
  }

  const themes=Array.isArray(item.tema_ids)?item.tema_ids.map(cleanText).filter(Boolean):[];
  if(!themes.length)errors.push(`${label}: tema_ids deve conter ao menos um tema canônico.`);
  themes.forEach(themeId=>{
    if(themeIds.size&&!themeIds.has(themeId))errors.push(`${label}: tema_id desconhecido: ${themeId}.`);
  });

  if(!validUrl(item.fonte_url))errors.push(`${label}: fonte_url deve ser uma URL válida.`);

  if(item.aprovacao?.status!=='aprovado'||!cleanText(item.aprovacao?.aprovado_por)){
    errors.push(`${label}: a projeção pública exige aprovação humana registrada.`);
  }

  if(Array.isArray(item.autores)&&item.autores.length){
    errors.push(`${label}: autores validados exigem REL separada; use autores_possiveis enquanto a relação estiver pendente.`);
  }

  return {valid:errors.length===0,errors};
}

export function validateRepertoryCollection(raw,{themeIds=new Set()}={}){
  const errors=[];
  if(!Array.isArray(raw))return {valid:[],invalid:[],errors:['data/repertorios-canonicos.json deve conter uma lista.']};

  const ids=new Set();
  const valid=[];
  const invalid=[];

  raw.forEach((item,index)=>{
    const result=validateRepertory(item,{index,themeIds});
    const itemErrors=[...result.errors];
    const id=cleanText(item?.id);

    if(id&&ids.has(id))itemErrors.push(`repertório ${index+1}: id duplicado: ${id}.`);
    if(id)ids.add(id);

    if(itemErrors.length){
      invalid.push({item,index,errors:itemErrors});
      errors.push(...itemErrors);
    }else{
      valid.push(normalizeRepertory(item));
    }
  });

  return {valid,invalid,errors};
}

export function normalizeRepertory(item){
  const temaIds=Array.isArray(item.tema_ids)?item.tema_ids.map(cleanText).filter(Boolean):[];
  const resumoObra=cleanText(item.resumo_obra);
  const leitura=cleanText(item.leitura_sociosofia);
  return {
    ...item,
    tema_ids:temaIds,
    categoria:CULTURAL_CATEGORY,
    editoria:CULTURAL_CATEGORY,
    resumo:cleanText(item.resumo)||resumoObra,
    resumo_obra:resumoObra,
    leitura_sociosofia:leitura,
    autores:Array.isArray(item.autores)?item.autores:[]
  };
}
