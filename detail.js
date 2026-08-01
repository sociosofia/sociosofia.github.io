import {loadItems,loadEntityRegistry,esc,related,itemEntityNames,itemKeywords,text,norm,uniq} from './site-shared.js';

const box=document.querySelector('#repertorio-detalhe'),crumb=document.querySelector('#breadcrumb-atual');
const params=new URLSearchParams(location.search);
const id=params.get('id');
const searchTerm=String(params.get('busca')||'').trim();
const searchOrigin=String(params.get('origem')||'').trim();

try{
  const [items]=await Promise.all([loadItems(),loadEntityRegistry()]),item=items.find(i=>i.id===id);
  if(!item)throw new Error('Repertório não encontrado.');
  document.title=`${item.titulo} | Sociosofia`;crumb.textContent=item.titulo;box.innerHTML=view(item,items);
}catch(e){crumb.textContent='Erro';box.innerHTML=`<section class="detail-section"><h1>Ops, não encontramos esse repertório.</h1><p>${esc(e.message)}</p><p><a class="button" href="index.html#temas">Voltar ao início</a></p></section>`;}

function view(i,items){
  const cultural=i.bloco==='cultura',other=cultural?'dados':'cultura',suggestions=related(items,i,other,6);
  return `<header class="detail-hero"><div><span class="tag">${esc(i.tipo||'Repertório')}</span><h1>${esc(i.titulo)}</h1>${i.subtitulo?`<p class="detail-subtitle">${esc(i.subtitulo)}</p>`:''}<p>${esc(i.resumo||i.resumo_obra||'')}</p><div class="detail-meta"><span>${esc(i.categoria)}</span>${i.subtema?`<span>•</span><span>${esc(i.subtema)}</span>`:''}</div>${headerLinks(i)}</div>${sidebar(i,cultural)}</header>
  ${cultural?culture(i):data(i)}
  ${theory(i)}
  ${searchContinuity(i,items)}
  ${automaticSuggestions(cultural,suggestions)}
  <p>${backLink()}</p>`;
}

function publicValue(value){
  const valueText=String(value||'').trim();
  return valueText&&!/^a (definir|confirmar|avaliar)$/i.test(valueText)?valueText:'';
}

function sidebar(i,cultural){
  const source=publicValue(i.fonte_nome),date=publicValue(i.ano_data);
  const sourceBlock=source?`<dt>${cultural?'Referência da obra':'Fonte completa'}</dt><dd>${i.fonte_url?`<a href="${esc(i.fonte_url)}" target="_blank" rel="noopener noreferrer">${esc(source)}</a>`:esc(source)}</dd>`:'';
  const dateBlock=date?`<dt>Ano ou data</dt><dd>${esc(date)}</dd>`:'';
  return sourceBlock||dateBlock?`<aside class="detail-sidebar"><dl>${sourceBlock}${dateBlock}</dl></aside>`:'';
}
function culture(i){return section('Resumo da obra',i.resumo_obra||i.resumo)+section('Leitura Sociosofia',i.leitura_sociosofia)+section('Ancoragem teórica',i.ancoragem_teorica);}
function data(i){return section('Dado ou ideia central',i.dado||i.ideia)+section('Para continuar pensando',i.questao)+section('Conexões possíveis',i.conexoes);}
function section(t,c){return c?`<section class="detail-section"><h2>${esc(t)}</h2><p>${esc(c)}</p></section>`:'';}

function headerLinks(i){
  const entities=[...itemEntityNames(i,'tema').map(n=>['tema',n]),...itemEntityNames(i,'conceito').map(n=>['conceito',n]),...itemEntityNames(i,'autor').map(n=>['autor',n])];
  return entities.length?`<div class="entity-links"><span>Conexões</span><ul class="inline-links">${entities.slice(0,8).map(([t,n])=>`<li><a href="${entityContextUrl(t,n)}">${esc(n)}</a></li>`).join('')}</ul></div>`:'';
}

function linkedList(tipo,names){
  return names.length?`<ul class="inline-links">${names.map(n=>`<li><a href="${entityContextUrl(tipo,n)}">${esc(n)}</a></li>`).join('')}</ul>`:'<p>Ainda não há conexões nesta seção.</p>';
}

function theory(i){
  const themes=itemEntityNames(i,'tema'),concepts=itemEntityNames(i,'conceito'),authors=itemEntityNames(i,'autor'),keywords=itemKeywords(i,12);
  return `<section class="detail-section"><h2>Temas relacionados</h2>${linkedList('tema',themes)}</section><section class="detail-section"><h2>Conceitos relacionados</h2>${linkedList('conceito',concepts)}</section><section class="detail-section"><h2>Autores e autoras que ajudam a pensar</h2>${linkedList('autor',authors)}</section>${keywords.length?`<section class="detail-section"><h2>Palavras-chave</h2><ul class="keyword-list">${keywords.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></section>`:''}`;
}

function searchContinuity(current,items){
  if(!searchTerm)return '';
  const q=norm(searchTerm);
  const matches=items.filter(item=>item.id!==current.id&&text(item).includes(q));
  const dados=matches.filter(item=>item.bloco==='dados');
  const cultura=matches.filter(item=>item.bloco==='cultura');
  const conceitos=uniq(matches.flatMap(item=>itemEntityNames(item,'conceito')));
  const temas=uniq(matches.flatMap(item=>itemEntityNames(item,'tema')));
  const autores=uniq(matches.flatMap(item=>itemEntityNames(item,'autor')));

  return `<section class="detail-section detail-section-wide search-continuity" aria-labelledby="continue-search-title">
    <header class="search-continuity-head">
      <div>
        <span class="eyebrow">Continue pela busca inicial</span>
        <h2 id="continue-search-title">Outros caminhos para “${esc(searchTerm)}”</h2>
        <p>Estes resultados preservam o assunto que trouxe você até este card. Eles são resultados contextuais da busca e não significam, por si só, uma relação editorial já validada.</p>
      </div>
      <a class="button ghost" href="index.html?busca=${encodeURIComponent(searchTerm)}#repertorios">Voltar aos três vértices</a>
    </header>
    <div class="continuity-vertices">
      ${continuityGroup('dados','Dado',`Outros dados sobre ${searchTerm}`,dados.map(item=>contextItemLink(item,'dados')))}
      ${continuityConceptGroup(conceitos,temas,autores)}
      ${continuityGroup('cultura','Repertório',`Outros repertórios sobre ${searchTerm}`,cultura.map(item=>contextItemLink(item,'cultura')))}
    </div>
  </section>`;
}

function continuityGroup(key,label,title,links){
  return `<section class="continuity-vertex continuity-${key}"><span>${label}</span><h3>${esc(title)}</h3>${links.length?`<ul>${links.join('')}</ul>`:'<p>Nenhum outro resultado neste vértice.</p>'}</section>`;
}

function continuityConceptGroup(conceitos,temas,autores){
  const links=[
    ...conceitos.map(nome=>`<li><a href="${entityContextUrl('conceito',nome)}"><small>Conceito</small>${esc(nome)}</a></li>`),
    ...temas.map(nome=>`<li><a href="${entityContextUrl('tema',nome)}"><small>Tema</small>${esc(nome)}</a></li>`),
    ...autores.map(nome=>`<li><a href="${entityContextUrl('autor',nome)}"><small>Autor ou autora</small>${esc(nome)}</a></li>`)
  ];
  return continuityGroup('conceitos','Conceito',`Conceitos e autores para ${searchTerm}`,links);
}

function contextItemLink(item,origin){
  return `<li><a href="${repertoryContextUrl(item.id,origin)}"><small>${esc(item.tipo||'Repertório')}</small>${esc(item.titulo)}</a></li>`;
}

function automaticSuggestions(cultural,suggestions){
  if(!suggestions.length)return '';
  return `<section class="detail-section detail-section-wide detail-relations"><h2>${cultural?'Outros dados por proximidade temática':'Outros repertórios por proximidade temática'}</h2><p class="relation-disclaimer">Sugestões calculadas por temas, palavras-chave e entidades em comum. Não substituem relações editoriais validadas.</p><div class="relation-grid">${suggestions.map(item=>relationCardWithContext(item)).join('')}</div></section>`;
}

function relationCardWithContext(item){
  const url=repertoryContextUrl(item.id,item.bloco==='dados'?'dados':'cultura');
  return `<a class="relation-card ${item.bloco==='cultura'?'cultural':''}" href="${url}"><small>${esc(item.tipo||'Repertório')}</small><strong>${esc(item.titulo)}</strong><span>${esc(item.subtitulo||item.subtema||'')}</span></a>`;
}

function entityContextUrl(tipo,nome){
  const next=new URLSearchParams({tipo,entidade:nome});
  if(searchTerm)next.set('busca',searchTerm);
  if(searchOrigin)next.set('origem',searchOrigin);
  return `index.html?${next.toString()}#temas`;
}

function repertoryContextUrl(itemId,origin){
  const next=new URLSearchParams({id:itemId});
  if(searchTerm)next.set('busca',searchTerm);
  if(origin||searchOrigin)next.set('origem',origin||searchOrigin);
  return `repertorio.html?${next.toString()}`;
}

function backLink(){
  if(searchTerm)return `<a class="button" href="index.html?busca=${encodeURIComponent(searchTerm)}#repertorios">Voltar aos resultados de “${esc(searchTerm)}”</a>`;
  return '<a class="button" href="index.html#temas">Voltar a explorar</a>';
}
