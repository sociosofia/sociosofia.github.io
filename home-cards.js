import {esc,entityEntry,entityLinks,entityMatches,entityUrl,itemEntityNames,keywordList,relationCard} from './site-shared.js';

export function card(i){
  return `<article class="card" data-type="${esc(i.tipo)}"><span class="tag ${i.status!=='publicado'?'review':''}">${esc(i.tipo||'Repertório')}</span><h3><a class="card-title-link" href="repertorio.html?id=${encodeURIComponent(i.id)}">${esc(i.titulo)}</a></h3>${i.subtitulo?`<p class="card-subtitle">${esc(i.subtitulo)}</p>`:''}<p class="card-summary">${esc(i.resumo||i.resumo_obra||'')}</p><div class="card-meta"><span>${i.bloco==='dados'?'Dados e informações':'Repertório cultural'}</span>${i.subtema?`<span>•</span><span>${esc(i.subtema)}</span>`:''}</div>${entityLinks(i,['conceito','autor'])}${keywordList(i,5)}<div class="card-actions"><span class="card-meta">${esc(i.fonte_status||i.status||'')}</span><a class="read-more" href="repertorio.html?id=${encodeURIComponent(i.id)}">Abrir</a></div></article>`;
}

export function feature(i,meta={}){
  if(!i)return '<p>Nenhum repertório da semana foi definido ainda.</p>';
  const context=meta.contexto?`<div class="weekly-context"><strong>Por que agora?</strong><p>${esc(meta.contexto)}</p></div>`:'';
  return `<div><span class="tag ${i.status!=='publicado'?'review':''}">${esc(i.tipo)}</span><h3>${esc(i.titulo)}</h3>${i.subtitulo?`<p class="feature-subtitle">${esc(i.subtitulo)}</p>`:''}<p>${esc(i.resumo||i.resumo_obra||'')}</p>${context}</div><aside><div class="feature-meta"><span>${esc(meta.periodo||i.categoria)}</span>${meta.periodo?`<span>•</span><span>${esc(i.categoria)}</span>`:''}<span>•</span><span>${esc(i.tempo_leitura||'Leitura rápida')}</span></div>${entityLinks(i,['conceito','autor'])}${keywordList(i,5)}<p><a class="read-more" href="repertorio.html?id=${encodeURIComponent(i.id)}">Abrir repertório completo</a></p></aside>`;
}

export function previousHighlight(i,meta={}){
  return `<a class="previous-highlight-card" href="repertorio.html?id=${encodeURIComponent(i.id)}"><span class="tag">${esc(i.tipo||'Repertório')}</span><strong>${esc(i.titulo)}</strong>${i.subtitulo?`<span>${esc(i.subtitulo)}</span>`:''}<small>${esc(meta.periodo||i.ano_data||'Destaque anterior')}</small></a>`;
}

export function entityDetail(items,tipo,nome){
  const rel=items.filter(i=>entityMatches(i,tipo,nome));
  const dados=rel.filter(i=>i.bloco==='dados'), cultura=rel.filter(i=>i.bloco==='cultura');
  const outros=correlatas(rel,tipo,nome);
  const rotulo={autor:'Autor ou autora',conceito:'Conceito',tema:'Tema'}[tipo]||'Card';
  const entry=entityEntry(tipo,nome);
  const resumo=entry?.resumo||defaultSummary(tipo,nome,rel.length);
  return `<div class="entity-detail-header"><span class="tag">${rotulo}</span><h3>${esc(nome)}</h3><p class="entity-summary">${esc(resumo)}</p></div>${section('Dados, notícias, artigos e pesquisas relacionados',dados)}${section('Filmes, séries e repertórios culturais relacionados',cultura)}${outros.length?`<section class="relation-section"><h3>Outras conexões editoriais</h3><ul class="inline-links">${outros.map(o=>`<li><a href="${entityUrl(o.tipo,o.nome)}">${esc(o.nome)}</a></li>`).join('')}</ul></section>`:''}`;
}

function defaultSummary(tipo,nome,n){
  if(tipo==='autor')return `${nome} aparece como referência teórica em ${n} repertório${n===1?'':'s'} do banco atual.`;
  if(tipo==='tema')return `Este tema organiza ${n} repertório${n===1?'':'s'} do banco atual sem pretender esgotar o assunto.`;
  return `${nome} funciona como ferramenta de interpretação em ${n} repertório${n===1?'':'s'} do banco atual.`;
}

function section(titulo,itens){return `<section class="relation-section"><h3>${titulo}</h3>${itens.length?`<div class="relation-grid">${itens.slice(0,8).map(relationCard).join('')}</div>`:'<p class="portal-prompt">As conexões deste bloco ainda estão em preparação editorial.</p>'}</section>`;}

function correlatas(itens,tipo,nome){
  const m=new Map();
  itens.forEach(i=>{
    itemEntityNames(i,'conceito').forEach(n=>{if(tipo==='conceito'&&n===nome)return;const k='conceito:'+n;m.set(k,{tipo:'conceito',nome:n,p:(m.get(k)?.p||0)+1});});
    itemEntityNames(i,'tema').forEach(n=>{if(tipo==='tema'&&n===nome)return;const k='tema:'+n;m.set(k,{tipo:'tema',nome:n,p:(m.get(k)?.p||0)+1});});
    itemEntityNames(i,'autor').forEach(n=>{if(tipo==='autor'&&n===nome)return;const k='autor:'+n;m.set(k,{tipo:'autor',nome:n,p:(m.get(k)?.p||0)+1});});
  });
  return [...m.values()].sort((a,b)=>b.p-a.p||a.nome.localeCompare(b.nome,'pt-BR')).slice(0,12);
}
