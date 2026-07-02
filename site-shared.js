export const CULTURA = "Séries, filmes, livros e músicas";

export const TEMAS = [
  ["educacao","Juventude, educação e escola",["juventude","jovem","adolesc","educa","escola","docente","professor","bullying","infância"]],
  ["trabalho","Trabalho e desigualdade",["trabalho","desigual","pobreza","precar","classe","renda","explora","alienação","meritocracia"]],
  ["racismo","Raça, racismo e relações étnico-raciais",["racismo","racial","raça","negro","negra","branquitude","colonial","escrav","eugen","quilomb","indígen"]],
  ["genero","Gênero, sexualidade e corpo",["gênero","mulher","femin","sexual","lgbt","masculin","corpo","heteronorm","patriarc"]],
  ["tecnologia","Tecnologia, mídia e vida digital",["tecnologia","digital","algorit","inteligência artificial","mídia","rede social","internet","vigilância","virtual"]],
  ["politica","Política, democracia e cidadania",["política","democracia","cidadania","estado","poder","governo","direito","participação","militarização"]],
  ["cultura","Cultura, identidade e diferenças",["cultura","identidade","diferença","alteridade","etnocentr","indústria cultural","representação","pertencimento"]],
  ["violencia","Violência, direitos humanos e justiça",["violência","justiça","crime","prisão","polícia","letalidade","direitos humanos","guerra","controle","punição"]],
  ["saude","Saúde, cuidado e bem-estar",["saúde","cuidado","sofrimento","ansiedade","depress","mental","doença","medical","bem-estar"]]
].map(([id,nome,palavras])=>({id,nome,palavras}));

export const norm = v => String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
export const esc = v => String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
export const list = v => Array.isArray(v)?v.filter(Boolean):String(v||"").split(/[;,]/).map(x=>x.trim()).filter(Boolean);
export const uniq = a => [...new Set(a.filter(Boolean))].sort((x,y)=>x.localeCompare(y,"pt-BR"));

export function normalizeItem(i){
  const categoria=i.categoria||i.editoria||"Notícias, dados e informações";
  return {...i,categoria,editoria:i.editoria||categoria,bloco:categoria===CULTURA?"cultura":"dados",conceitos:list(i.conceitos),autores:list(i.autores),tags:list(i.tags)};
}

export async function loadItems(){
  const r=await fetch("data/repertorios.json");
  if(!r.ok) throw new Error("Banco de repertórios indisponível");
  return (await r.json()).map(normalizeItem).filter(i=>i.status!=="arquivado");
}

export function text(i){
  return norm([i.titulo,i.subtitulo,i.resumo,i.resumo_obra,i.leitura_sociosofia,i.ancoragem_teorica,i.categoria,i.subtema,i.tipo,i.dado,i.ideia,i.conexoes,i.fonte_nome,...i.conceitos,...i.autores,...i.tags].join(" "));
}

export function inTheme(i,t){const s=text(i);return t.palavras.some(p=>s.includes(norm(p)));}
export function themeIds(i){return TEMAS.filter(t=>inTheme(i,t)).map(t=>t.id);}
const overlap=(a,b)=>a.filter(x=>b.includes(x)).length;

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

export function entityUrl(tipo,nome){return `index.html?${tipo}=${encodeURIComponent(nome)}#temas`;}
export function relationCard(i){return `<a class="relation-card ${i.bloco==='cultura'?'cultural':''}" href="repertorio.html?id=${encodeURIComponent(i.id)}"><small>${esc(i.tipo||'Repertório')}</small><strong>${esc(i.titulo)}</strong><span>${esc(i.subtitulo||i.subtema||'')}</span></a>`;}
export function entityLinks(i){
  const c=i.conceitos.slice(0,4).map(n=>`<li><a href="${entityUrl('conceito',n)}">${esc(n)}</a></li>`).join("");
  const a=i.autores.slice(0,3).map(n=>`<li><a href="${entityUrl('autor',n)}">${esc(n)}</a></li>`).join("");
  return c+a?`<ul class="inline-links">${c}${a}</ul>`:"";
}
