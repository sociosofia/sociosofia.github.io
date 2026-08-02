import {themeMapFromRegistry,validatePublicationCollection,normalizePublication} from './publication-contract.mjs';
import {validateRepertoryCollection,normalizeRepertory} from './repertory-contract.mjs';

const nativeFetch=window.fetch.bind(window);

window.fetch=async function publicationAwareFetch(input,init){
  const url=typeof input==='string'?input:(input?.url||'');
  if(!url.endsWith('data/repertorios.json'))return nativeFetch(input,init);

  const baseResponse=await nativeFetch(input,init);
  if(!baseResponse.ok)return baseResponse;

  const base=await baseResponse.json();
  let publicacoes=[];
  let repertoriosCanonicos=[];
  let themeMap=new Map();

  try{
    const themesResponse=await nativeFetch('data/temas.json',{cache:'no-store'});
    if(!themesResponse.ok)throw new Error('O registro canônico de temas não pôde ser carregado.');
    themeMap=themeMapFromRegistry(await themesResponse.json());
    if(!themeMap.size)throw new Error('O registro canônico de temas está vazio.');
  }catch(error){
    console.warn('Não foi possível carregar o registro canônico de temas.',error);
  }

  if(themeMap.size){
    try{
      const publicationResponse=await nativeFetch('data/publicacoes.json',{cache:'no-store'});
      if(!publicationResponse.ok)throw new Error('A base de publicações não pôde ser carregada.');
      const validation=validatePublicationCollection(await publicationResponse.json(),{themeIds:new Set(themeMap.keys())});
      if(validation.errors.length){
        console.error('Publicações rejeitadas pelo contrato técnico:',validation.errors);
      }
      publicacoes=validation.valid.map(item=>normalizePublication(item,themeMap));
    }catch(error){
      console.warn('Não foi possível carregar as publicações aprovadas.',error);
    }

    try{
      const repertoryResponse=await nativeFetch('data/repertorios-canonicos.json',{cache:'no-store'});
      if(!repertoryResponse.ok)throw new Error('A base canônica de repertórios culturais não pôde ser carregada.');
      const validation=validateRepertoryCollection(await repertoryResponse.json(),{themeIds:new Set(themeMap.keys())});
      if(validation.errors.length){
        console.error('Repertórios culturais rejeitados pelo contrato técnico:',validation.errors);
      }
      repertoriosCanonicos=validation.valid.map(normalizeRepertory);
    }catch(error){
      console.warn('Não foi possível carregar os repertórios culturais aprovados.',error);
    }
  }

  const canonicalIds=new Set([...publicacoes,...repertoriosCanonicos].map(item=>item.id));
  const baseSemSubstituidos=base.filter(item=>!canonicalIds.has(item.id));

  return new Response(JSON.stringify([...baseSemSubstituidos,...publicacoes,...repertoriosCanonicos]),{
    status:200,
    headers:{'Content-Type':'application/json; charset=utf-8'}
  });
};
