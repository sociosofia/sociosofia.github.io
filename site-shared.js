export const CULTURA = "Séries, filmes, livros e músicas";

export const TEMAS = [
  {id:"trabalho",nome:"Trabalho, economia e desigualdades",descricao:"Relações de trabalho, classes, renda, consumo e formas de exploração.",menores:["Trabalho e profissões","Precarização e uberização","Classes e mobilidade social","Pobreza e renda","Capitalismo e consumo"],palavras:["trabalho","emprego","desemprego","renda","classe","pobreza","desigual","precar","uber","explora","alienação","consumo","capitalismo","meritocracia","profissão"]},
  {id:"cultura",nome:"Cultura, comunicação e tecnologia",descricao:"Identidades, representações, mídia, arte, consumo e vida digital.",menores:["Cultura e identidade","Arte e entretenimento","Indústria cultural","Mídia e representação","Redes, algoritmos e inteligência artificial"],palavras:["cultura","identidade","representação","mídia","comunicação","tecnologia","digital","algorit","inteligência artificial","rede social","internet","cinema","arte","indústria cultural","consumo","hiperconect"]},
  {id:"politica",nome:"Política, cidadania e justiça",descricao:"Estado, democracia, poder, violência, direitos e participação coletiva.",menores:["Estado e poder","Democracia e cidadania","Movimentos sociais","Políticas públicas","Violência, segurança e justiça"],palavras:["política","estado","poder","democracia","cidadania","direito","governo","participação","violência","justiça","crime","prisão","polícia","militar","guerra","punição","autoritar","movimento social"]},
  {id:"religiao",nome:"Religião e visões de mundo",descricao:"Religiões, moralidades, laicidade, espiritualidade e produção de sentidos.",menores:["Religião e sociedade","Diversidade religiosa","Intolerância e fundamentalismos","Laicidade e política","Moral, ética e espiritualidade"],palavras:["religião","religioso","fé","igreja","evangé","pentecost","catolic","orixá","laic","espiritual","fundamentalismo","moral","mito","ritual","sagrado"]},
  {id:"diferencas",nome:"Raça, gênero e diferenças sociais",descricao:"Racismo, colonialidade, gênero, sexualidade, povos e marcadores sociais.",menores:["Raça e relações étnico-raciais","Povos indígenas e colonialidade","Gênero e feminismos","Sexualidade e masculinidades","Migração, deficiência e outras diferenças"],palavras:["racismo","racial","raça","negro","negra","branquitude","colonial","escrav","eugen","quilomb","indígen","gênero","mulher","femin","sexual","lgbt","masculin","heteronorm","patriarc","xenof","migra","capacit"]},
  {id:"educacao",nome:"Educação, ciência e saúde",descricao:"Escola, juventudes, conhecimento, corpo, saúde, cuidado e bioética.",menores:["Escola e desigualdade educacional","Juventudes e socialização","Ciência e produção do conhecimento","Saúde mental e medicalização","Corpo, cuidado e envelhecimento"],palavras:["educa","escola","juventude","jovem","adolesc","infância","professor","docente","bullying","ciência","conhecimento","saúde","cuidado","sofrimento","ansiedade","depress","mental","doença","medical","bioética","corpo","envelhecimento"]},
  {id:"territorio",nome:"Cidade, território e meio ambiente",descricao:"Vida urbana, campo, mobilidade, segregação, natureza e conflitos ambientais.",menores:["Cidade e vida urbana","Moradia e segregação","Mobilidade e periferias","Campo, território e povos tradicionais","Meio ambiente e crise climática"],palavras:["cidade","urbano","território","moradia","segregação","mobilidade","periferia","campo","rural","terra","meio ambiente","ambiental","clima","natureza","mineração","sertão","migração","deslocamento"]}
];

export const norm = v => String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
export const esc = v => String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
export const list = v => Array.isArray(v)?v.filter(Boolean):String(v||"").split(/[;,]/).map(x=>x.trim()).filter(Boolean);
export const uniq = a => [...new Set(a.filter(Boolean))].sort((x,y)=>x.localeCompare(y,"pt-BR"));

export function normalizeItem(i){
  const categoria=i.categoria||i.editoria||"Notícias, dados e informações";
  const item={...i,categoria,editoria:i.editoria||categoria,bloco:categoria===CULTURA?"cultura":"dados",conceitos:list(i.conceitos),autores:list(i.autores),tags:list(i.tags),temas_menores:list(i.temas_menores)};
  item.grande_tema=i.grande_tema||i.tema_principal||bestTheme(item)?.id||"";
  return item;
}

export async function loadItems(){
  const r=await fetch("data/repertorios.json");
  if(!r.ok) throw new Error("Banco de repertórios indisponível");
  return (await r.json()).map(normalizeItem).filter(i=>i.status!=="arquivado");
}

export async function loadEntities(){
  try{
    const r=await fetch("data/entidades.json");
    if(!r.ok)return {autores:[],conceitos:[]};
    const data=await r.json();
    return {autores:Array.isArray(data.autores)?data.autores:[],conceitos:Array.isArray(data.conceitos)?data.conceitos:[]};
  }catch{return {autores:[],conceitos:[]};}
}

export function text(i){
  return norm([i.titulo,i.subtitulo,i.resumo,i.resumo_obra,i.leitura_sociosofia,i.ancoragem_teorica,i.categoria,i.subtema,i.grande_tema,...i.temas_menores,i.tipo,i.dado,i.ideia,i.conexoes,i.fonte_nome,...i.conceitos,...i.autores,...i.tags].join(" "));
}

export function inTheme(i,t){return i.grande_tema===t.id||t.palavras.some(p=>text(i).includes(norm(p)));}
export function bestTheme(i){const s=text(i);return TEMAS.map(t=>({t,n:t.palavras.filter(p=>s.includes(norm(p))).length})).sort((a,b)=>b.n-a.n)[0]?.n?TEMAS.map(t=>({t,n:t.palavras.filter(p=>s.includes(norm(p))).length})).sort((a,b)=>b.n-a.n)[0].t:null;}
export function primaryTheme(i){return TEMAS.find(t=>t.id===i.grande_tema)||bestTheme(i);}
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

export function entityUrl(tipo,nome){return `index.html?${tipo}=${encodeURIComponent(nome)}#explorar`;}
export function relationCard(i){const tema=primaryTheme(i);return `<a class="relation-card ${i.bloco==='cultura'?'cultural':''}" href="repertorio.html?id=${encodeURIComponent(i.id)}"><small>${esc(i.tipo||'Repertório')}</small><strong>${esc(i.titulo)}</strong><span>${esc(tema?.nome||i.subtitulo||i.subtema||'')}</span></a>`;}
export function entityLinks(i){
  const c=i.conceitos.slice(0,4).map(n=>`<li><a href="${entityUrl('conceito',n)}">${esc(n)}</a></li>`).join("");
  const a=i.autores.slice(0,3).map(n=>`<li><a href="${entityUrl('autor',n)}">${esc(n)}</a></li>`).join("");
  return c+a?`<ul class="inline-links">${c}${a}</ul>`:"";
}
