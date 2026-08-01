import {themeMapFromRegistry,validatePublicationCollection,normalizePublication} from './publication-contract.mjs';

const nativeFetch=window.fetch.bind(window);

window.fetch=async function publicationAwareFetch(input,init){
  const url=typeof input==='string'?input:(input?.url||'');
  if(!url.endsWith('data/repertorios.json'))return nativeFetch(input,init);

  const baseResponse=await nativeFetch(input,init);
  if(!baseResponse.ok)return baseResponse;

  const base=await baseResponse.json();
  let publicacoes=[];

  try{
    const [publicationResponse,themesResponse]=await Promise.all([
      nativeFetch('data/publicacoes.json',{cache:'no-store'}),
      nativeFetch('data/temas.json',{cache:'no-store'})
    ]);

    if(!publicationResponse.ok)throw new Error('A base de publicações não pôde ser carregada.');
    if(!themesResponse.ok)throw new Error('O registro canônico de temas não pôde ser carregado.');

    const data=await publicationResponse.json();
    const themeRegistry=await themesResponse.json();
    const themeMap=themeMapFromRegistry(themeRegistry);
    if(!themeMap.size)throw new Error('O registro canônico de temas está vazio.');

    const validation=validatePublicationCollection(data,{themeIds:new Set(themeMap.keys())});

    if(validation.errors.length){
      console.error('Publicações rejeitadas pelo contrato técnico:',validation.errors);
    }

    publicacoes=validation.valid.map(item=>normalizePublication(item,themeMap));
  }catch(error){
    console.warn('Não foi possível carregar as publicações aprovadas.',error);
  }

  return new Response(JSON.stringify([...base,...publicacoes]),{
    status:200,
    headers:{'Content-Type':'application/json; charset=utf-8'}
  });
};
