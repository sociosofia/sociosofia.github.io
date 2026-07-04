import {esc,entityLinks,entityUrl,relationCard,uniq,primaryTheme,norm} from './site-shared.js';

export function card(i){
  const tema=primaryTheme(i);
  return `<article class="card" data-type="${esc(i.tipo)}"><span class="tag ${i.status!=='publicado'?'review':''}">${esc(i.tipo||'Repertório')}</span><h3><a class="card-title-link" href="repertorio.html?id=${encodeURIComponent(i.id)}">${esc(i.titulo)}</a></h3>${i.subtitulo?`<p class="card-subtitle">${esc(i.subtitulo)}</p>`:''}<p class="card-summary">${esc(i.resumo||i.resumo_obra||'')}</p><div class="card-meta"><span>${esc(tema?.nome||(i.bloco==='dados'?'Dados e informações':'Repertório cultural'))}</span>${i.subtema?`<span>•</span><span>${esc(i.subtema)}</span>`:''}</div>${entityLinks(i)}<div class="card-actions"><span class="card-meta">${esc(i.fonte_status||i.status||'')}</span><a class="read-more" href="repertorio.html?id=${encodeURIComponent(i.id)}">Abrir</a></div></article>`;
}

export function feature(i){
  if(!i)return '<p>Nenhum repertório da semana publicado ainda.</p>';
  const tema=primaryTheme(i);
  return `<div><span class="tag ${i.status!=='publicado'?'review':''}">${esc(i.tipo)}</span><h3>${esc(i.titulo)}</h3>${i.subtitulo?`<p class="feature-subtitle">${esc(i.subtitulo)}</p>`:''}<p>${esc(i.resumo||i.resumo_obra||'')}</p></div><aside><div class="feature-meta"><span>${esc(tema?.nome||i.categoria)}</span><span>•</span><span>${esc(i.tempo_leitura||'Leitura rápida')}</span></div>${entityLinks(i)}<p><a class="read-more" href="repertorio.html?id=${encodeURIComponent(i.id)}">Abrir repertório completo</a></p></aside>`;
}

export function entityDetail(items,entities,tipo,nome){
  const campo=tipo==='autor'?'autores':'conceitos';
  const rel=items.filter(i=>i[campo].includes(nome));
  const dados=rel.filter(i=>i.bloco==='dados'), cultura=rel.filter(i=>i.bloco==='cultura');
  const outros=correlatas(rel,tipo,nome);
  const perfil=profileFor(entities,tipo,nome);
  const rotulo=tipo==='autor'?'Autor ou autora':'Conceito';
  const intro=tipo==='autor'?authorIntro(perfil,nome,rel.length):conceptIntro(perfil,nome,rel.length);
  return `<div class="entity-detail-header"><span class="tag">${rotulo}</span><h3>${esc(nome)}</h3>${intro}</div>${tipo==='autor'?authorBody(perfil):conceptBody(perfil)}${section('Dados, notícias, artigos e pesquisas relacionados',dados)}${section('Filmes, séries e repertórios culturais relacionados',cultura)}${outros.length?`<section class="relation-section"><h3>Outras conexões teóricas</h3><ul class="inline-links">${outros.map(o=>`<li><a href="${entityUrl(o.tipo,o.nome)}">${esc(o.nome)}</a></li>`).join('')}</ul></section>`:''}`;
}

export function entitySearchCard(tipo,p){
  const nome=p.nome||'';
  const resumo=tipo==='autor'?(p.concentracao||p.atividade||'Ficha biográfica e intelectual em preparação editorial.'):(p.definicoes?.[0]?.linguagem_simples||p.como_mobilizar||'Ficha conceitual em preparação editorial.');
  return `<article class="card entity-result-card"><span class="tag">${tipo==='autor'?'Autor ou autora':'Conceito'}</span><h3><a class="card-title-link" href="${entityUrl(tipo,nome)}">${esc(nome)}</a></h3><p class="card-summary">${esc(resumo)}</p><div class="card-actions"><span class="card-meta">${esc(p.status||'Em preparação')}</span><a class="read-more" href="${entityUrl(tipo,nome)}">Abrir ficha</a></div></article>`;
}

function authorIntro(p,nome,count){
  if(!p)return `<p class="entity-summary">${esc(nome)} integra o núcleo editorial e aparece em ${count} repertório${count===1?'':'s'} do banco atual. A ficha biográfica e intelectual ainda será desenvolvida.</p>`;
  const identidade=[p.pais,p.atividade].filter(Boolean).join(' · ');
  return `${identidade?`<p class="entity-kicker">${esc(identidade)}</p>`:''}<p class="entity-summary">${esc(p.concentracao||`${nome} integra o núcleo editorial do Sociosofia.`)}</p>`;
}

function authorBody(p){
  if(!p)return editorialPlaceholder('Ficha de autor ou autora','Quem é, formação, atividade principal, questões centrais, obras, conceitos, pertinência e uso argumentativo.');
  const facts=[];
  if(p.formacao)facts.push(['Formação',p.formacao]);
  if(p.atividade)facts.push(['Atividade principal',p.atividade]);
  if(p.status)facts.push(['Prioridade editorial',p.status]);
  return `${facts.length?`<div class="entity-facts">${facts.map(([t,v])=>`<div><strong>${esc(t)}</strong><span>${esc(v)}</span></div>`).join('')}</div>`:''}${listSection('Principais obras',p.obras)}${linkListSection('Conceitos associados',p.conceitos,'conceito')}${ifmgPanel('Autor ou autora','A biografia legitima a referência; as questões centrais mostram sua pertinência; as conexões indicam como suas ideias podem produzir argumentos.')}`;
}

function conceptIntro(p,nome,count){
  const resumo=p?.definicoes?.[0]?.linguagem_simples||`${nome} funciona como ferramenta de interpretação em ${count} repertório${count===1?'':'s'} do banco atual.`;
  return `<p class="entity-summary">${esc(resumo)}</p>`;
}

function conceptBody(p){
  if(!p)return editorialPlaceholder('Ficha conceitual','Definição sempre ancorada em autor, obra ou tradição, seguida de explicação simples, pertinência, uso argumentativo, limites e variações.');
  const defs=(p.definicoes||[]).map(d=>`<article class="definition-card"><p class="definition-source">${esc(d.autor||'Autor ou tradição')} ${d.obra?`· <em>${esc(d.obra)}</em>`:''}</p><p>${esc(d.texto||'')}</p>${d.linguagem_simples?`<div class="plain-language"><strong>Em termos simples</strong><p>${esc(d.linguagem_simples)}</p></div>`:''}</article>`).join('');
  return `${defs?`<section class="entity-editorial-section"><h3>Definição ancorada</h3>${defs}</section>`:''}${listSection('O que ajuda a compreender',p.ajuda_a_compreender)}${p.como_mobilizar?`<section class="entity-editorial-section"><h3>Como mobilizar</h3><p>${esc(p.como_mobilizar)}</p></section>`:''}${p.limites?`<section class="entity-editorial-section"><h3>Limites e variações</h3><p>${esc(p.limites)}</p></section>`:''}${ifmgPanel('Conceito','A autoria e a obra legitimam a definição; os problemas relacionados demonstram pertinência; o exemplo de mobilização torna o conceito produtivo.')}`;
}

function editorialPlaceholder(titulo,texto){return `<div class="editorial-placeholder"><strong>${esc(titulo)} em preparação</strong><p>${esc(texto)}</p></div>`;}
function ifmgPanel(tipo,texto){return `<aside class="ifmg-mini"><strong>Tripé editorial IFMG</strong><p>${esc(texto)}</p><div><span>Legitimado</span><span>Pertinente</span><span>Produtivo</span></div></aside>`;}
function listSection(titulo,itens){return itens?.length?`<section class="entity-editorial-section"><h3>${esc(titulo)}</h3><ul class="editorial-list">${itens.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`:'';}
function linkListSection(titulo,itens,tipo){return itens?.length?`<section class="entity-editorial-section"><h3>${esc(titulo)}</h3><ul class="inline-links">${itens.map(x=>`<li><a href="${entityUrl(tipo,x)}">${esc(x)}</a></li>`).join('')}</ul></section>`:'';}
function section(titulo,itens){return `<section class="relation-section"><h3>${titulo}</h3>${itens.length?`<div class="relation-grid">${itens.slice(0,8).map(relationCard).join('')}</div>`:'<p class="portal-prompt">As conexões deste bloco ainda estão em preparação editorial.</p>'}</section>`;}
function profileFor(entities,tipo,nome){const arr=tipo==='autor'?entities.autores:entities.conceitos;return arr.find(x=>norm(x.nome)===norm(nome));}
function correlatas(itens,tipo,nome){
  const m=new Map();
  itens.forEach(i=>{
    i.conceitos.forEach(n=>{if(tipo==='conceito'&&n===nome)return;const k='conceito:'+n;m.set(k,{tipo:'conceito',nome:n,p:(m.get(k)?.p||0)+1});});
    i.autores.forEach(n=>{if(tipo==='autor'&&n===nome)return;const k='autor:'+n;m.set(k,{tipo:'autor',nome:n,p:(m.get(k)?.p||0)+1});});
  });
  return [...m.values()].sort((a,b)=>b.p-a.p||a.nome.localeCompare(b.nome,'pt-BR')).slice(0,12);
}

export function entityNames(items,entities,tipo){
  const banco=tipo==='autor'?items.flatMap(i=>i.autores):items.flatMap(i=>i.conceitos);
  const catalogo=(tipo==='autor'?entities.autores:entities.conceitos).map(x=>x.nome);
  return uniq([...banco,...catalogo]);
}
