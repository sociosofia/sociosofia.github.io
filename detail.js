import {loadItems,loadEntityRegistry,esc,entityUrl,related,relationCard,itemEntityNames,itemKeywords} from './site-shared.js';

const box=document.querySelector('#repertorio-detalhe'),crumb=document.querySelector('#breadcrumb-atual');
const id=new URLSearchParams(location.search).get('id');

try{
  const [items]=await Promise.all([loadItems(),loadEntityRegistry()]),item=items.find(i=>i.id===id);
  if(!item)throw new Error('Repertório não encontrado.');
  document.title=`${item.titulo} | Sociosofia`;crumb.textContent=item.titulo;box.innerHTML=view(item,items);
}catch(e){crumb.textContent='Erro';box.innerHTML=`<section class="detail-section"><h1>Ops, não encontramos esse repertório.</h1><p>${esc(e.message)}</p><p><a class="button" href="index.html#repertorios">Voltar aos repertórios</a></p></section>`;}

function view(i,items){
  const cultural=i.bloco==='cultura',other=cultural?'dados':'cultura',rels=related(items,i,other,6);
  return `<header class="detail-hero"><div><span class="tag ${i.status!=='publicado'?'review':''}">${esc(i.tipo||'Repertório')}</span><h1>${esc(i.titulo)}</h1>${i.subtitulo?`<p class="detail-subtitle">${esc(i.subtitulo)}</p>`:''}<p>${esc(i.resumo||i.resumo_obra||'')}</p><div class="detail-meta"><span>${esc(i.categoria)}</span>${i.subtema?`<span>•</span><span>${esc(i.subtema)}</span>`:''}<span>•</span><span>${esc(i.status||'rascunho')}</span></div>${headerLinks(i)}</div>${sidebar(i,cultural)}</header>
  ${cultural?culture(i):data(i)}
  ${theory(i)}
  <section class="detail-section detail-section-wide detail-relations"><h2>${cultural?'Dados, notícias e pesquisas relacionados':'Filmes, séries e repertórios culturais relacionados'}</h2>${rels.length?`<div class="relation-grid">${rels.map(relationCard).join('')}</div>`:'<p>As conexões deste bloco ainda estão em preparação editorial.</p>'}</section>
  <p><a class="button" href="index.html#repertorios">Voltar aos repertórios</a></p>`;
}

function sidebar(i,cultural){return `<aside class="detail-sidebar"><dl><dt>${cultural?'Referência da obra':'Fonte completa'}</dt><dd>${i.fonte_url?`<a href="${esc(i.fonte_url)}" target="_blank" rel="noopener noreferrer">${esc(i.fonte_nome||'Acessar fonte')}</a>`:esc(i.fonte_nome||'A definir')}</dd><dt>Ano ou data</dt><dd>${esc(i.ano_data||'A definir')}</dd><dt>${cultural?'Tipo de repertório':'Confiabilidade'}</dt><dd>${esc(i.confiabilidade||(cultural?'Repertório cultural':'A avaliar'))}</dd><dt>Status editorial</dt><dd>${esc(i.fonte_status||i.status||'A confirmar')}</dd></dl></aside>`;}
function culture(i){return section('Resumo da obra',i.resumo_obra||i.resumo)+section('Leitura Sociosofia',i.leitura_sociosofia)+section('Ancoragem teórica',i.ancoragem_teorica);}
function data(i){return section('Dado ou ideia central',i.dado||i.ideia)+section('Conexões possíveis',i.conexoes)+section('Observação editorial',i.observacao_editorial);}
function section(t,c){return c?`<section class="detail-section"><h2>${esc(t)}</h2><p>${esc(c)}</p></section>`:'';}

function headerLinks(i){
  const entities=[...itemEntityNames(i,'tema').map(n=>['tema',n]),...itemEntityNames(i,'conceito').map(n=>['conceito',n]),...itemEntityNames(i,'autor').map(n=>['autor',n])];
  return entities.length?`<div class="entity-links"><span>Cards relacionados</span><ul class="inline-links">${entities.slice(0,8).map(([t,n])=>`<li><a href="${entityUrl(t,n)}">${esc(n)}</a></li>`).join('')}</ul></div>`:'';
}

function linkedList(tipo,names){
  return names.length?`<ul class="inline-links">${names.map(n=>`<li><a href="${entityUrl(tipo,n)}">${esc(n)}</a></li>`).join('')}</ul>`:'<p>Nenhum card editorial associado por enquanto.</p>';
}

function theory(i){
  const themes=itemEntityNames(i,'tema'),concepts=itemEntityNames(i,'conceito'),authors=itemEntityNames(i,'autor'),keywords=itemKeywords(i,12);
  return `<section class="detail-section"><h2>Temas relacionados</h2>${linkedList('tema',themes)}</section><section class="detail-section"><h2>Conceitos relacionados</h2>${linkedList('conceito',concepts)}</section><section class="detail-section"><h2>Autores e autoras que ajudam a pensar</h2>${linkedList('autor',authors)}</section><section class="detail-section"><h2>Palavras-chave</h2>${keywords.length?`<ul class="keyword-list">${keywords.map(n=>`<li>${esc(n)}</li>`).join('')}</ul>`:'<p>A definir.</p>'}</section>`;
}
