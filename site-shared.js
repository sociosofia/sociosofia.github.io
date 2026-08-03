export const CULTURA = "Séries, filmes, livros e músicas";

const FALLBACK_THEMES=[
  {id:"educacao",nome:"Juventude, educação e escola",palavras:["juventude","jovem","adolesc","educa","escola","docente","professor","bullying","infância"]},
  {id:"trabalho",nome:"Trabalho e desigualdade",palavras:["trabalho","desigual","pobreza","precar","classe","renda","explora","alienação","meritocracia"]},
  {id:"racismo",nome:"Raça, racismo e relações étnico-raciais",palavras:["racismo","racial","raça","negro","negra","branquitude","colonial","escrav","eugen","quilomb","indígen"]},
  {id:"genero",nome:"Gênero, sexualidade e corpo",palavras:["gênero","mulher","femin","sexual","lgbt","masculin","corpo","heteronorm","patriarc"]},
  {id:"tecnologia",nome:"Tecnologia, mídia e vida digital",palavras:["tecnologia","digital","algorit","inteligência artificial","mídia","rede social","internet","vigilância","virtual"]},
  {id:"politica",nome:"Política, democracia e cidadania",palavras:["política","democracia","cidadania","estado","poder","governo","direito","participação","militarização"]},
  {id:"cultura",nome:"Cultura, identidade e diferenças",palavras:["cultura","identidade","diferença","alteridade","etnocentr","indústria cultural","representação","pertencimento"]},
  {id:"violencia",nome:"Violência, direitos humanos e justiça",palavras:["violência","justiça","crime","prisão","polícia","letalidade","direitos humanos","guerra","controle","punição"]},
  {id:"territorio",nome:"Meio ambiente, território e sociedade",palavras:["meio ambiente","território","cidade","campo","clima","natureza","sustentabilidade","moradia","mobilidade","desastre"]},
  {id:"saude",nome:"Saúde, cuidado e bem-estar",palavras:["saúde","cuidado","sofrimento","ansiedade","depress","mental","doença","medical","bem-estar"]}
];

const PUBLIC_STATUSES=new Set(["publicado","publicado_legado"]);

export let TEMAS=FALLBACK_THEMES.map(theme=>({...theme}));

export const norm = v => String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
export const esc = v => String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
export const list = v => Array.isArray(v)?v.filter(Boolean):String(v||"").split(/[;,]/).map(x=>x.trim()).filter(Boolean);
export const uniq = a => [...new Set(a.filter(Boolean))].sort((x,y)=>x.localeCompare(y,"pt-BR"));

const EMPTY_REGISTRY={conceito:[],tema:[],autor:[]};
let entityRegistry=EMPTY_REGISTRY;
let themesLoaded=false;
let legacyPublicationLoaded=false;
let legacyPublicationIds=new Set();

function normalizeRegistry(raw={}){
  const out={conceito:[],tema:[],autor:[]};
  Object.keys(out).forEach(tipo=>{
    out[tipo]=list(raw[tipo]).map(entry=>typeof entry==='string'?{nome:entry}:{...entry,nome:entry.nome||entry.titulo}).filter(entry=>entry.nome);
  });
  return out;
}

function canonicalTheme(nome){
  const target=norm(nome);
  return TEMAS.find(theme=>[theme.nome,...list(theme.aliases)].some(value=>norm(value)===target));
}

function isPublicEntityEntry(entry){
  return Boolean(entry&&entry.status_publicacao==='publicado'&&(entry.resumo||entry.href));
}

export async function loadThemeRegistry(){
  if(themesLoaded)return TEMAS;
  themesLoaded=true;
  try{
    const response=await fetch('data/temas.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Não foi possível carregar os temas canônicos');
    const raw=await response.json();
    const loaded=(Array.isArray(raw?.temas)?raw.temas:[])
      .filter(theme=>theme?.id&&theme?.nome_publico)
      .map(theme=>({
        id:theme.id,
        nome:theme.nome_publico,
        aliases:list(theme.aliases),
        palavras:list(theme.palavras_descoberta),
        status_taxonomico:theme.status_taxonomico||'estavel'
      }));
    if(loaded.length)TEMAS=loaded;
  }catch(error){
    console.warn(error);
  }
  return TEMAS;
}

export async function loadLegacyPublicationRegistry(){
  if(legacyPublicationLoaded)return legacyPublicationIds;
  legacyPublicationLoaded=true;
  try{
    const response=await fetch('data/publicacao-legado.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Não foi possível carregar o registro de publicação do legado');
    const raw=await response.json();
    if(raw?.estado_publico!=="publicado_legado")throw new Error('Estado público do legado inválido');
    legacyPublicationIds=new Set(list(raw?.ids));
  }catch(error){
    console.warn(error);
    legacyPublicationIds=new Set();
  }
  return legacyPublicationIds;
}

export async function loadEntityRegistry(){
  try{
    const r=await fetch("data/entidades.json");
    if(!r.ok)throw new Error("Não foi possível carregar as conexões");
    entityRegistry=normalizeRegistry(await r.json());
  }catch(e){
    console.warn(e);
    entityRegistry=EMPTY_REGISTRY;
  }
  return entityRegistry;
}

export function getEntityRegistry(){return entityRegistry;}
export function entityEntry(tipo,nome){
  if(tipo==='tema'){
    const theme=canonicalTheme(nome);
    return theme?{...theme,nome:theme.nome,status_publicacao:'publicado'}:undefined;
  }
  return (entityRegistry[tipo]||[]).find(e=>e.nome===nome);
}
export function isRegisteredEntity(tipo,nome){return Boolean(entityEntry(tipo,nome));}

function publicStatus(i){
  if(i.status==="publicado")return "publicado";
  if(legacyPublicationIds.has(i.id))return "publicado_legado";
  return "";
}

export function normalizeItem(i){
  const tema_ids=list(i.tema_ids);
  const primaryTheme=TEMAS.find(theme=>theme.id===tema_ids[0]);
  const categoria=i.categoria||primaryTheme?.nome||i.editoria||"Notícias, dados e informações";
  return {
    ...i,
    tema_ids,
    categoria,
    editoria:i.editoria||categoria,
    bloco:categoria===CULTURA?"cultura":"dados",
    status_publicacao:publicStatus(i),
    conceitos:list(i.conceitos),
    autores:list(i.autores),
    tags:list(i.tags),
    palavras_chave:list(i.palavras_chave||i.tags)
  };
}

export async function loadItems(){
  await Promise.all([loadThemeRegistry(),loadLegacyPublicationRegistry()]);
  const r=await fetch("data/repertorios.json");
  if(!r.ok) throw new Error("Não foi possível carregar os repertórios");
  return (await r.json()).map(normalizeItem).filter(i=>PUBLIC_STATUSES.has(i.status_publicacao));
}

export async function loadHighlights(){
  try{
    const r=await fetch("data/destaques.json");
    if(!r.ok)throw new Error("Não foi possível carregar o repertório da semana");
    const data=await r.json();
    return {atual:data.atual||null,anteriores:list(data.anteriores)};
  }catch(e){
    console.warn(e);
    return {atual:null,anteriores:[]};
  }
}

function themeText(i){
  return list(i.tema_ids).flatMap(id=>{
    const theme=TEMAS.find(entry=>entry.id===id);
    return theme?[theme.nome,...list(theme.aliases)]:[id];
  });
}

export function text(i){
  return norm([i.titulo,i.subtitulo,i.resumo,i.resumo_obra,i.leitura_sociosofia,i.ancoragem_teorica,i.categoria,i.subtema,i.tipo,i.dado,i.contextualizacao,i.interpretacao_sociosofia,i.ideia,i.conexoes,i.fonte_nome,...themeText(i),...i.conceitos,...i.autores,...i.tags].join(" "));
}

export function inTheme(i,t){
  return list(i.tema_ids).includes(t.id);
}
export function themeIds(i){
  return list(i.tema_ids).filter(id=>TEMAS.some(theme=>theme.id===id));
}
const overlap=(a,b)=>a.filter(x=>b.includes(x)).length;

export function entityMatches(i,tipo,nome){
  if(tipo==='tema'){
    const theme=canonicalTheme(nome);
    return Boolean(theme&&inTheme(i,theme));
  }

  const entry=entityEntry(tipo,nome);
  if(!isPublicEntityEntry(entry))return false;
  if(list(entry.ids).includes(i.id))return true;

  const values=tipo==='autor'?i.autores:i.conceitos;
  const terms=[entry.nome,...list(entry.aliases)].map(norm);
  return list(values).some(value=>terms.includes(norm(value)));
}

export function entityNames(items,tipo){
  if(tipo==='tema')return TEMAS.map(theme=>theme.nome).filter(nome=>items.some(i=>entityMatches(i,tipo,nome)));
  return (entityRegistry[tipo]||[]).filter(isPublicEntityEntry).map(e=>e.nome).filter(nome=>items.some(i=>entityMatches(i,tipo,nome)));
}

export function itemEntityNames(i,tipo){
  if(tipo==='tema')return TEMAS.map(theme=>theme.nome).filter(nome=>entityMatches(i,tipo,nome));
  return (entityRegistry[tipo]||[]).filter(isPublicEntityEntry).map(e=>e.nome).filter(nome=>entityMatches(i,tipo,nome));
}

export function itemKeywords(i,limit=8){
  const entities=[...itemEntityNames(i,'conceito'),...itemEntityNames(i,'tema'),...itemEntityNames(i,'autor')];
  const candidates=uniq([...i.conceitos,...i.palavras_chave]);
  const filtered=candidates.filter(value=>{
    const v=norm(value);
    if(!v)return false;
    if(v.length>4&&norm(i.titulo).includes(v))return false;
    return !entities.some(entity=>{
      const e=norm(entity);
      return e===v||(v.length>4&&e.includes(v))||(e.length>4&&v.includes(e));
    });
  });
  return filtered.slice(0,limit);
}

export function relationScore(a,b){
  let n=overlap(a.conceitos,b.conceitos)*4+overlap(a.autores,b.autores)*3+overlap(a.tags,b.tags)*2;
  n+=overlap(themeIds(a),themeIds(b))*2;
  const aw=norm(a.subtema||"").split(/\W+/).filter(x=>x.length>4), bw=norm(b.subtema||"");
  n+=aw.filter(x=>bw.includes(x)).length;
  return n;
}

export function related(items,item,target,limit=6){
  return items.filter(x=>x.id!==item.id&&(!target||x.bloco===target)).map(x=>({x,n:relationScore(item,x)})).filter(o=>o.n>0).sort((a,b)=>b.n-a.n||a.x.titulo.localeCompare(b.x.titulo,"pt-BR")).slice(0,limit).map(o=>o.x);
}

export function entityUrl(tipo,nome){
  const href=entityEntry(tipo,nome)?.href;
  return href||`index.html?tipo=${encodeURIComponent(tipo)}&entidade=${encodeURIComponent(nome)}#temas`;
}
export function relationCard(i){return `<a class="relation-card ${i.bloco==='cultura'?'cultural':''}" href="repertorio.html?id=${encodeURIComponent(i.id)}"><small>${esc(i.tipo||'Repertório')}</small><strong>${esc(i.titulo)}</strong><span>${esc(i.subtitulo||i.subtema||'')}</span></a>`;}

export function entityLinks(i,tipos=['tema','conceito','autor']){
  const links=[];
  tipos.forEach(tipo=>itemEntityNames(i,tipo).forEach(nome=>links.push({tipo,nome})));
  return links.length?`<div class="entity-links"><span>Conexões</span><ul class="inline-links">${links.slice(0,7).map(({tipo,nome})=>`<li><a href="${entityUrl(tipo,nome)}">${esc(nome)}</a></li>`).join("")}</ul></div>`:"";
}

export function keywordList(i,limit=6){
  const words=itemKeywords(i,limit);
  return words.length?`<div class="keyword-group"><span>Palavras-chave</span><ul class="keyword-list">${words.map(word=>`<li>${esc(word)}</li>`).join("")}</ul></div>`:"";
}
