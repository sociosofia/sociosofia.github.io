import {loadItems,esc,entityUrl,related,relationCard,primaryTheme,TEMAS} from './site-shared.js';

const box=document.querySelector('#repertorio-detalhe'),crumb=document.querySelector('#breadcrumb-atual');
const id=new URLSearchParams(location.search).get('id');

try{
  const items=await loadItems(),item=items.find(i=>i.id===id);
  if(!item)throw new Error('Repertório não encontrado.');
  document.title=`${item.titulo} | Sociosofia`;crumb.textContent=item.titulo;box.innerHTML=view(item,items);
}catch(e){crumb.textContent='Erro';box.innerHTML=`<section class="detail-section"><h1>Ops, não encontramos esse repertório.</h1><p>${esc(e.message)}</p><p><a class="button" href="index.html#explorar">Voltar aos repertórios</a></p></section>`;}

function view(i,items){
  const cultural=i.bloco==='cultura',other=cultural?'dados':'cultura',rels=related(items,i,other,6),tema=primaryTheme(i);
  return `<header class="detail-hero"><div><span class="tag ${i.status!=='publicado'?'review':''}">${esc(i.tipo||'Repertório')}</span><h1>${esc(i.titulo)}</h1>${i.subtitulo?`<p class="detail-subtitle">${esc(i.subtitulo)}</p>`:''}<p>${esc(i.resumo||i.resumo_obra||'')}</p><div class="detail-meta"><span>${esc(tema?.nome||i.categoria)}</span>${i.subtema?`<span>•</span><span>${esc(i.subtema)}</span>`:''}<span>•</span><span>${esc(i.status||'rascunho')}</span></div>${links(i)}</div>${sidebar(i,cultural)}</header>
  ${themeSection(tema,i)}
  ${cultural?culture(i):data(i)}
  ${tripod(i,cultural)}
  ${theory(i)}
  <section class="detail-section detail-section-wide detail-relations"><h2>${cultural?'Dados, notícias e pesquisas relacionados':'Filmes, séries e repertórios culturais relacionados'}</h2>${rels.length?`<div class="relation-grid">${rels.map(relationCard).join('')}</div>`:'<p>As conexões deste bloco ainda estão em preparação editorial.</p>'}</section>
  <p><a class="button" href="index.html#explorar">Voltar aos repertórios</a></p>`;
}

function sidebar(i,cultural){return `<aside class="detail-sidebar"><dl><dt>${cultural?'Referência da obra':'Fonte completa'}</dt><dd>${i.fonte_url?`<a href="${esc(i.fonte_url)}" target="_blank" rel="noopener noreferrer">${esc(i.fonte_nome||'Acessar fonte')}</a>`:esc(i.fonte_nome||'A definir')}</dd><dt>Ano ou data</dt><dd>${esc(i.ano_data||'A definir')}</dd><dt>${cultural?'Tipo de repertório':'Confiabilidade'}</dt><dd>${esc(i.confiabilidade||(cultural?'Repertório cultural':'A avaliar'))}</dd><dt>Status editorial</dt><dd>${esc(i.fonte_status||i.status||'A confirmar')}</dd></dl></aside>`;}
function themeSection(tema,i){if(!tema)return '';const menores=i.temas_menores?.length?i.temas_menores:tema.menores.slice(0,4);return `<section class="detail-section"><p class="eyebrow">Grande tema</p><h2>${esc(tema.nome)}</h2><p>${esc(tema.descricao)}</p><div class="minor-theme-list">${menores.map(x=>`<span>${esc(x)}</span>`).join('')}</div></section>`;}
function culture(i){return section('Apresentação da obra',i.resumo_obra||i.resumo)+section('Leitura sociológica e filosófica',i.leitura_sociosofia)+section('O que observar',i.o_que_observar)+section('Ancoragem teórica',i.ancoragem_teorica)+section('Cuidados de uso',i.cuidados_uso);}
function data(i){return section('Dado ou ideia central',i.dado||i.ideia)+section('Conexões possíveis',i.conexoes)+section('Observação editorial',i.observacao_editorial);}
function section(t,c){return c?`<section class="detail-section"><h2>${esc(t)}</h2><p>${esc(c)}</p></section>`:'';}
function links(i){const all=[...i.conceitos.map(n=>['conceito',n]),...i.autores.map(n=>['autor',n])];return all.length?`<ul class="inline-links">${all.map(([t,n])=>`<li><a href="${entityUrl(t,n)}">${esc(n)}</a></li>`).join('')}</ul>`:'';}
function theory(i){return `<section class="detail-section"><h2>Conceitos relacionados</h2>${i.conceitos.length?`<ul class="inline-links">${i.conceitos.map(n=>`<li><a href="${entityUrl('conceito',n)}">${esc(n)}</a></li>`).join('')}</ul>`:'<p>A definir.</p>'}</section><section class="detail-section"><h2>Autores e autoras que ajudam a pensar</h2>${i.autores.length?`<ul class="inline-links">${i.autores.map(n=>`<li><a href="${entityUrl('autor',n)}">${esc(n)}</a></li>`).join('')}</ul>`:'<p>A definir.</p>'}</section>`;}
function tripod(i,cultural){
  const legitimado=i.legitimacao||(cultural?`A obra está identificada por título, autoria ou direção, país, ano e contexto de produção. Referência: ${i.fonte_nome||'a conferir'}.`:`A fonte, a data, o recorte e a confiabilidade devem ser explicitados. Referência: ${i.fonte_nome||'a conferir'}.`);
  const pertinente=i.pertinencia||(cultural?i.leitura_sociosofia:i.conexoes)||'A relação com o problema será explicitada na revisão editorial.';
  const produtivo=i.produtividade||i.como_mobilizar||i.questao||'A ficha deverá mostrar como o repertório sustenta uma interpretação ou argumento.';
  return `<section class="detail-section"><p class="eyebrow">Tripé editorial</p><h2>Como este repertório funciona</h2><div class="editorial-tripod"><article><h3>Legitimado</h3><p>${esc(legitimado)}</p></article><article><h3>Pertinente</h3><p>${esc(pertinente)}</p></article><article><h3>Produtivo</h3><p>${esc(produtivo)}</p></article></div></section>`;
}
