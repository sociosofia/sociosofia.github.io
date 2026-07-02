import {esc,entityLinks,entityUrl,relationCard,uniq} from './site-shared.js';

export function card(i){
  return `<article class="card" data-type="${esc(i.tipo)}"><span class="tag ${i.status!=='publicado'?'review':''}">${esc(i.tipo||'Repertório')}</span><h3><a class="card-title-link" href="repertorio.html?id=${encodeURIComponent(i.id)}">${esc(i.titulo)}</a></h3>${i.subtitulo?`<p class="card-subtitle">${esc(i.subtitulo)}</p>`:''}<p class="card-summary">${esc(i.resumo||i.resumo_obra||'')}</p><div class="card-meta"><span>${i.bloco==='dados'?'Dados e informações':'Repertório cultural'}</span>${i.subtema?`<span>•</span><span>${esc(i.subtema)}</span>`:''}</div>${entityLinks(i)}<div class="card-actions"><span class="card-meta">${esc(i.fonte_status||i.status||'')}</span><a class="read-more" href="repertorio.html?id=${encodeURIComponent(i.id)}">Abrir</a></div></article>`;
}

export function feature(i){
  if(!i)return '<p>Nenhuma curadoria publicada ainda.</p>';
  return `<div><span class="tag ${i.status!=='publicado'?'review':''}">${esc(i.tipo)}</span><h3>${esc(i.titulo)}</h3>${i.subtitulo?`<p class="feature-subtitle">${esc(i.subtitulo)}</p>`:''}<p>${esc(i.resumo||i.resumo_obra||'')}</p></div><aside><div class="feature-meta"><span>${esc(i.categoria)}</span><span>•</span><span>${esc(i.tempo_leitura||'Leitura rápida')}</span></div>${entityLinks(i)}<p><a class="read-more" href="repertorio.html?id=${encodeURIComponent(i.id)}">Abrir repertório completo</a></p></aside>`;
}

export function entityDetail(items,tipo,nome){
  const campo=tipo==='autor'?'autores':'conceitos';
  const rel=items.filter(i=>i[campo].includes(nome));
  const dados=rel.filter(i=>i.bloco==='dados'), cultura=rel.filter(i=>i.bloco==='cultura');
  const outros=correlatas(rel,tipo,nome);
  const rotulo=tipo==='autor'?'Autor ou autora':'Conceito';
  const resumo=tipo==='autor'?`${nome} aparece como referência teórica em ${rel.length} repertório${rel.length===1?'':'s'} do banco atual.`:`${nome} funciona como ferramenta de interpretação em ${rel.length} repertório${rel.length===1?'':'s'} do banco atual.`;
  return `<div class="entity-detail-header"><span class="tag">${rotulo}</span><h3>${esc(nome)}</h3><p class="entity-summary">${esc(resumo)} Esta ficha poderá receber definição, contexto e orientações de uso sem perder suas conexões.</p></div>${section('Dados, notícias, artigos e pesquisas relacionados',dados)}${section('Filmes, séries e repertórios culturais relacionados',cultura)}${outros.length?`<section class="relation-section"><h3>Outras conexões teóricas</h3><ul class="inline-links">${outros.map(o=>`<li><a href="${entityUrl(o.tipo,o.nome)}">${esc(o.nome)}</a></li>`).join('')}</ul></section>`:''}`;
}

function section(titulo,itens){return `<section class="relation-section"><h3>${titulo}</h3>${itens.length?`<div class="relation-grid">${itens.slice(0,8).map(relationCard).join('')}</div>`:'<p class="portal-prompt">As conexões deste bloco ainda estão em preparação editorial.</p>'}</section>`;}

function correlatas(itens,tipo,nome){
  const m=new Map();
  itens.forEach(i=>{
    i.conceitos.forEach(n=>{if(tipo==='conceito'&&n===nome)return;const k='conceito:'+n;m.set(k,{tipo:'conceito',nome:n,p:(m.get(k)?.p||0)+1});});
    i.autores.forEach(n=>{if(tipo==='autor'&&n===nome)return;const k='autor:'+n;m.set(k,{tipo:'autor',nome:n,p:(m.get(k)?.p||0)+1});});
  });
  return [...m.values()].sort((a,b)=>b.p-a.p||a.nome.localeCompare(b.nome,'pt-BR')).slice(0,12);
}

export function entityNames(items,tipo){return tipo==='autor'?uniq(items.flatMap(i=>i.autores)):uniq(items.flatMap(i=>i.conceitos));}
