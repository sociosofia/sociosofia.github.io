import fs from 'node:fs';

function assert(condition,message){
  if(!condition)throw new Error(message);
}

const shared=fs.readFileSync('site-shared.js','utf8');
const cards=fs.readFileSync('home-cards.js','utf8');
const entities=JSON.parse(fs.readFileSync('data/entidades.json','utf8'));
const themes=JSON.parse(fs.readFileSync('data/temas.json','utf8'));
const publications=JSON.parse(fs.readFileSync('data/publicacoes.json','utf8'));
const repertories=JSON.parse(fs.readFileSync('data/repertorios-canonicos.json','utf8'));
const all=[...publications,...repertories];

assert(all.length===38,`A coleção pública deveria conter 38 conteúdos; encontrou ${all.length}.`);

const themeIds=new Set(themes.temas.map(theme=>theme.id));
for(const item of all){
  assert(Array.isArray(item.tema_ids)&&item.tema_ids.length,`${item.id} não possui tema_ids explícitos.`);
  for(const themeId of item.tema_ids){
    assert(themeIds.has(themeId),`${item.id} usa tema desconhecido: ${themeId}.`);
  }
}

const inThemeBody=shared.match(/export function inTheme\(i,t\)\{([\s\S]*?)\n\}/)?.[1]||'';
assert(inThemeBody.includes('return list(i.tema_ids).includes(t.id);'),'O filtro temático não depende exclusivamente de tema_ids.');
assert(!inThemeBody.includes('text(i)')&&!inThemeBody.includes('.palavras'),'O filtro temático ainda contém inferência lexical.');

const corra=repertories.find(item=>item.id==='CUL-0002');
assert(corra,'CUL-0002 não foi encontrado.');
assert(!corra.tema_ids.includes('educacao'),'Corra! possui vínculo editorial explícito indevido com educação.');
const educacaoCultural=repertories.filter(item=>item.tema_ids.includes('educacao')).map(item=>item.id);
assert(!educacaoCultural.includes('CUL-0002'),'Corra! apareceu no conjunto cultural de educação por vínculo explícito.');

const publicConcepts=entities.conceito.filter(entry=>entry.status_publicacao==='publicado');
assert(publicConcepts.length===1,`Esperado somente um conceito publicado nesta fase; encontrados ${publicConcepts.length}.`);
assert(publicConcepts[0].nome==='Alienação','Alienação deveria ser o único conceito publicado nesta fase.');
assert(publicConcepts[0].href==='elo.html?id=ELO-trabalho-plataformas-controle&entrada=conceito','Alienação não aponta para a ficha canônica existente.');
assert(publicConcepts[0].ids.includes('CUL-0014'),'Alienação não preserva sua relação validada com Vidas Entregues.');

const alteridade=entities.conceito.find(entry=>entry.nome==='Alteridade');
assert(alteridade,'Alteridade deve permanecer registrada para desenvolvimento futuro.');
assert(alteridade.status_publicacao!=='publicado'&&!alteridade.href,'Alteridade não pode aparecer como ficha publicada antes de ser desenvolvida.');

assert(shared.includes("filter(isPublicEntityEntry)"),'A navegação não restringe conceitos e autores a entidades publicadas.');
assert(shared.includes("if(tipo==='tema')return TEMAS.map(theme=>theme.nome)"),'A aba de temas não usa o registro temático canônico.');
assert(cards.includes('Abrir ficha completa'),'A interface não oferece acesso à ficha conceitual existente.');

console.log('Navegação temática e entidades públicas validadas.');
