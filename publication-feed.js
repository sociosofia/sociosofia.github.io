const nativeFetch=window.fetch.bind(window);

window.fetch=async function publicationAwareFetch(input,init){
  const url=typeof input==='string'?input:(input?.url||'');
  if(!url.endsWith('data/repertorios.json'))return nativeFetch(input,init);

  const baseResponse=await nativeFetch(input,init);
  if(!baseResponse.ok)return baseResponse;

  const base=await baseResponse.json();
  let publicacoes=[];
  try{
    const publicationResponse=await nativeFetch('data/publicacoes.json',{cache:'no-store'});
    if(publicationResponse.ok){
      const data=await publicationResponse.json();
      if(Array.isArray(data))publicacoes=data;
    }
  }catch(error){
    console.warn('Não foi possível carregar as publicações aprovadas.',error);
  }

  return new Response(JSON.stringify([...base,...publicacoes]),{
    status:200,
    headers:{'Content-Type':'application/json; charset=utf-8'}
  });
};
