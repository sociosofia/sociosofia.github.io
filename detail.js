import {loadItems,loadEntityRegistry,esc,related,itemEntityNames,itemKeywords,text,norm,uniq} from './site-shared.js';

const box=document.querySelector('#repertorio-detalhe'),crumb=document.querySelector('#breadcrumb-atual');
const params=new URLSearchParams(location.search);
const id=params.get('id');
const searchTerm=String(params.get('busca')||'').trim();
const searchOrigin=String(params.get('origem')||'').trim();

try{
  const [items]=await Promise.all([loadItems(),loadEntityRegistry()]),item=items.find(i=>i.id===id);
  if(!item)throw new Error('Card não encontrado.');
  box.dataset.kind=item.bloco;
  document.body.dataset.contentKind=item.bloco;
  document.title=`${item.titulo} | Sociosofia`;
  crumb.textContent=item.titulo;
  box.innerHTML=view(item,items);
}catch(e){
  crumb.textContent='Erro';
  box.innerHTML=`<section class="detail-section"><h1>Ops, não encontramos este card.</h1><p>${esc(e.message)}</p><p><a class="button" href="index.html#temas">Voltar ao início</a></p></section>`;
}

function view(i,items){
  const cultural=i.bloco==='cultura',other=cultural?'dados':'cultura',suggestions=related(items,i,other,6);
  return `<header class="detail-hero"><div><span class="tag">${esc(i.tipo||'Repertório')}</span><h1>${esc(i.titulo)}</h1>${i.subtitulo?`<p class="detail-subtitle">${esc(i.subtitulo)}</p>`:''}${heroSummary(i,cultural)}<div class="detail-meta"><span>${esc(i.categoria)}</span>${i.subtema?`<span>•</span><span>${esc(i.subtema)}</span>`:''}</div></div>${sidebar(i,cultural)}</header>
  ${cultural?culture(i):data(i)}
  ${entityPaths(i)}
  ${searchContinuity(i,items)}
  ${automaticSuggestions(cultural,suggestions)}
  <p class="detail-back">${backLink()}</p>`;
}

function heroSummary(i,cultural){
  const summary=String(i.resumo||'').trim();
  const work=String(i.resumo_obra||'').trim();
  if(!summary)return '';
  if(cultural&&work&&norm(summary)===norm(work))return '';
  return `<p>${esc(summary)}</p>`;
}

function publicValue(value){
  const valueText=String(value||'').trim();
  return valueText&&!/^a (definir|confirmar|avaliar)$/i.test(valueText)?valueText:'';
}

function sidebar(i,cultural){
  const source=publicValue(i.fonte_nome),date=publicValue(i.ano_data);
  const sourceBlock=source?`<div><dt>${cultural?'Referência da obra':'Fonte original'}</dt><dd>${i.fonte_url?`<a href="${esc(i.fonte_url)}" target="_blank" rel="noopener noreferrer">${esc(source)}</a>`:esc(source)}</dd></div>`:'';
  const dateBlock=date?`<div><dt>Ano ou data</dt><dd>${esc(date)}</dd></div>`:'';
  return sourceBlock||dateBlock?`<aside class="detail-sidebar"><dl>${sourceBlock}${dateBlock}</dl></aside>`:'';
}

function culture(i){
  return section('A obra',i.resumo_obra||i.resumo)
    +section('Leitura Sociosofia',i.leitura_sociosofia)
    +section('Ancoragem teórica',i.ancoragem_teorica);
}

function data(i){
  return section('Dado',i.dado||i.ideia)
    +section('Contextualização',i.contextualizacao)
    +section('Interpretação Sociosofia',i.interpretacao_sociosofia||i.conexoes)
    +section('Para continuar pensando',i.questao);
}

function section(title,content){
  return content?`<section class="detail-section"><h2>${esc(title)}</h2><p>${esc(content)}</p></section>`:'';
}

function entityPaths(i){
  const themes=itemEntityNames(i,'tema');
  const concepts=itemEntityNames(i,'conceito');
  const authors=itemEntityNames(i,'autor');
  const keywords=itemKeywords(i,12);
  if(!themes.length&&!concepts.length&&!authors.length&&!keywords.length)return '';

  return `<section class="detail-section detail-section-wide entity-paths" aria-labelledby="entity-paths-title">
    <div class="entity-paths-head">
      <span class="eyebrow">Aberturas possíveis</span>
      <h2 id="entity-paths-title">Explore a partir deste card</h2>
      <p>Estas entradas ajudam a continuar a leitura sem encerrar as relações possíveis.</p>
    </div>
    <div class="entity-path-grid">
      ${pathGroup('Temas',themes,'tema')}
      ${pathGroup('Conceitos',concepts,'conceito')}
      ${pathGroup('Autores e autoras',authors,'autor')}
    </div>
    ${keywords.length?`<div class="keyword-group"><span>Palavras-chave</span><ul class="keyword-list">${keywords.map(word=>`<li>${esc(word)}</li>`).join('')}</ul></div>`:''}
  </section>`;
}

function pathGroup(title,names,type){
  if(!names.length)return `<section class="entity-path-group is-empty"><h3>${esc(title)}</h3><p>Novas entradas poderão ser incorporadas aqui.</p></section>`;
  return `<section class="entity-path-group"><h3>${esc(title)}</h3><ul>${names.map(name=>`<li><a href="${entityContextUrl(type,name)}">${esc(name)}</a></li>`).join('')}</ul></section>`;
}

function searchContinuity(current,items){
  if(!searchTerm)return '';
  const query=norm(searchTerm);
  const matches=items.filter(item=>item.id!==current.id&&text(item).includes(query));
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
        <p>Algumas aproximações retomam relações conhecidas; outras podem sugerir conexões novas e abrir percursos que o Sociosofia não previu.</p>
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

function continuityConceptGroup(concepts,themes,authors){
  const links=[
    ...concepts.map(name=>`<li><a href="${entityContextUrl('conceito',name)}"><small>Conceito</small>${esc(name)}</a></li>`),
    ...themes.map(name=>`<li><a href="${entityContextUrl('tema',name)}"><small>Tema</small>${esc(name)}</a></li>`),
    ...authors.map(name=>`<li><a href="${entityContextUrl('autor',name)}"><small>Autor ou autora</small>${esc(name)}</a></li>`)
  ];
  return continuityGroup('conceitos','Conceito',`Conceitos e autores para ${searchTerm}`,links);
}

function contextItemLink(item,origin){
  return `<li><a href="${repertoryContextUrl(item.id,origin)}"><small>${esc(item.tipo||'Repertório')}</small>${esc(item.titulo)}</a></li>`;
}

function automaticSuggestions(cultural,suggestions){
  if(!suggestions.length)return '';
  return `<section class="detail-section detail-section-wide detail-relations"><h2>${cultural?'Outros dados para continuar pensando':'Outros repertórios para continuar pensando'}</h2><p class="relation-disclaimer">Explore, compare e construa suas próprias relações. As aproximações sugeridas por temas, palavras-chave e entidades em comum não esgotam as leituras possíveis.</p><div class="relation-grid">${suggestions.map(item=>relationCardWithContext(item)).join('')}</div></section>`;
}

function relationCardWithContext(item){
  const url=repertoryContextUrl(item.id,item.bloco==='dados'?'dados':'cultura');
  return `<a class="relation-card ${item.bloco==='cultura'?'cultural':''}" href="${url}"><small>${esc(item.tipo||'Repertório')}</small><strong>${esc(item.titulo)}</strong><span>${esc(item.subtitulo||item.subtema||'')}</span></a>`;
}

function entityContextUrl(type,name){
  const next=new URLSearchParams({tipo:type,entidade:name});
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
