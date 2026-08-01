export const PUBLICATION_CONTRACT_VERSION='1.0';
export const PUBLICATION_MODEL='card_dados_v1';
export const PUBLICATION_STATUS='publicado';

const REQUIRED_TEXT_FIELDS=[
  'id',
  'codigo_publicacao',
  'evi_id',
  'titulo',
  'dado',
  'contextualizacao',
  'interpretacao_sociosofia',
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

export function themeMapFromRegistry(raw){
  const themes=Array.isArray(raw?.temas)?raw.temas:[];
  return new Map(themes.filter(theme=>cleanText(theme?.id)).map(theme=>[cleanText(theme.id),theme]));
}

export function validatePublication(item,{index=0,themeIds=new Set()}={}){
  const errors=[];
  const label=`registro ${index+1}`;

  if(!isObject(item))return {valid:false,errors:[`${label}: deve ser um objeto.`]};

  REQUIRED_TEXT_FIELDS.forEach(field=>{
    if(!cleanText(item[field]))errors.push(`${label}: campo obrigatório ausente: ${field}.`);
  });

  if(item.versao_contrato!==PUBLICATION_CONTRACT_VERSION){
    errors.push(`${label}: versao_contrato deve ser ${PUBLICATION_CONTRACT_VERSION}.`);
  }

  if(item.modelo_publico!==PUBLICATION_MODEL){
    errors.push(`${label}: modelo_publico deve ser ${PUBLICATION_MODEL}.`);
  }

  if(item.status!==PUBLICATION_STATUS){
    errors.push(`${label}: somente registros com status publicado podem permanecer em data/publicacoes.json.`);
  }

  if(!/^DAD-\d{4}$/.test(cleanText(item.id))){
    errors.push(`${label}: id público deve seguir o padrão DAD-0000.`);
  }

  if(!/^R\d{3}-C\d{2}$/.test(cleanText(item.codigo_publicacao))){
    errors.push(`${label}: codigo_publicacao deve seguir o padrão R000-C00.`);
  }

  if(!/^EVI-[a-z0-9][a-z0-9-]*$/i.test(cleanText(item.evi_id))){
    errors.push(`${label}: evi_id deve apontar para uma evidência canônica EVI.`);
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

  return {valid:errors.length===0,errors};
}

export function validatePublicationCollection(raw,{themeIds=new Set()}={}){
  const errors=[];
  if(!Array.isArray(raw))return {valid:[],invalid:[],errors:['data/publicacoes.json deve conter uma lista.']};

  const ids=new Set();
  const codes=new Set();
  const valid=[];
  const invalid=[];

  raw.forEach((item,index)=>{
    const result=validatePublication(item,{index,themeIds});
    const itemErrors=[...result.errors];
    const id=cleanText(item?.id);
    const code=cleanText(item?.codigo_publicacao);

    if(id&&ids.has(id))itemErrors.push(`registro ${index+1}: id duplicado: ${id}.`);
    if(code&&codes.has(code))itemErrors.push(`registro ${index+1}: codigo_publicacao duplicado: ${code}.`);
    if(id)ids.add(id);
    if(code)codes.add(code);

    if(itemErrors.length){
      invalid.push({item,index,errors:itemErrors});
      errors.push(...itemErrors);
    }else{
      valid.push(normalizePublication(item));
    }
  });

  return {valid,invalid,errors};
}

export function normalizePublication(item,themeMap=new Map()){
  const temaIds=Array.isArray(item.tema_ids)?item.tema_ids.map(cleanText).filter(Boolean):[];
  const primaryTheme=themeMap.get(temaIds[0]);
  const contextualizacao=cleanText(item.contextualizacao);
  const interpretacao=cleanText(item.interpretacao_sociosofia);
  const resumo=cleanText(item.resumo)||[contextualizacao,interpretacao].filter(Boolean).join(' ');

  return {
    ...item,
    tema_ids:temaIds,
    categoria:cleanText(item.categoria)||cleanText(primaryTheme?.nome_publico)||'Notícias, dados e informações',
    editoria:cleanText(item.editoria)||'Notícias, dados e informações',
    resumo,
    contextualizacao,
    interpretacao_sociosofia:interpretacao
  };
}
