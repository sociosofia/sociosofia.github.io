import {TEMAS,loadItems,loadEntityRegistry,inTheme,text,norm,esc,entityNames,itemEntityNames,uniq} from './site-shared.js';
import {buildShell} from './home-shell.js';
import {card,entityDetail} from './home-cards.js';

buildShell();
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let items=[];
const state={
  tema:{dados:null,cultura:null},
  tipo:'conceito',
  entidade:'',
  search:{query:'',current:null,dados:[],cultura:[],conceitos:[],temas:[],autores:[]}
};

init();
async function init(){
  menu();events();
  try{
    const [loadedItems]=await Promise.all([loadItems(),loadEntityRegistry()]);
    items=loadedItems;
    renderAll();params();
  }catch(e){
    ['#lista-dados','#lista-cultura'].forEach(s=>$(s).innerHTML='<p class="empty-state">Não foi possível carregar os repertórios.</p>');
    console.error(e);
  }
}

function menu(){const b=$('.nav-toggle'),l=$('#menu-principal');b?.addEventListener('click',()=>{const a=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!a));l?.classList.toggle('open');});}

function events(){
  $('#temas').addEventListener('click',e=>{
    const toggle=e.target.closest('[data-entry-portal]');
    if(toggle){togglePortal(toggle.dataset.entryPortal);return;}

    const t=e.target.closest('[data-theme]');
    if(t){
      const b=t.closest('[data-portal]').dataset.portal;
      state.tema[b]=state.tema[b]===t.dataset.theme?null:t.dataset.theme;
      renderThemes(b);renderPortal(b);return;
    }

    const tab=e.target.closest('[data-entity-type]');
    if(tab){state.tipo=tab.dataset.entityType;state.entidade='';$$('[data-entity-type]').forEach(x=>x.classList.toggle('active',x===tab));$('#busca-entidades').value='';renderEntities();promptEntity();return;}

    const ent=e.target.closest('[data-entity-name]');
    if(ent){
      const same=state.tipo===ent.dataset.entityType&&state.entidade===ent.dataset.entityName;
      if(same){state.entidade='';renderEntities();promptEntity();return;}
      selectEntity(ent.dataset.entityType,ent.dataset.entityName);
    }
  });

  $('#temas').addEventListener('keydown',e=>{if(e.key==='Escape')setPortal('',false,false);});
  $('#busca-entidades').addEventListener('input',renderEntities);
  $('.keyword-search-box')?.addEventListener('submit',e=>{e.preventDefault();search($('#busca').value);});

  $('#repertorios').addEventListener('click',e=>{
    const trigger=e.target.closest('[data-search-portal]');
    if(trigger){
      if(trigger.disabled||trigger.getAttribute('aria-disabled')==='true')return;
      const key=trigger.dataset.searchPortal;
      setSearchPortal(state.search.current===key?null:key,true);
      return;
    }
    if(e.target.closest('#limpar-busca'))clearSearch();
  });

  $('#repertorios').addEventListener('keydown',e=>{if(e.key==='Escape')setSearchPortal(null,false);});
}

function renderAll(){
  ['dados','cultura'].forEach(b=>{renderThemes(b);renderPortal(b);});
  renderEntities();
}

function togglePortal(bloco){
  const trigger=$(`[data-entry-portal="${bloco}"]`);
  const isOpen=trigger?.getAttribute('aria-expanded')==='true';
  setPortal(bloco,!isOpen,true);
}

function setPortal(bloco,expanded=true,scroll=true){
  $$('[data-entry-portal]').forEach(button=>{
    const on=expanded&&button.dataset.entryPortal===bloco;
    button.setAttribute('aria-expanded',String(on));
  });

  $$('.entry-panel[data-portal]').forEach(panel=>{
    panel.hidden=!(expanded&&panel.dataset.portal===bloco);
  });

  if(expanded&&scroll){
    const panel=$(`.entry-panel[data-portal="${bloco}"]`);
    requestAnimationFrame(()=>panel?.scrollIntoView({behavior:'smooth',block:'nearest'}));
  }
}

function renderThemes(bloco){
  const base=items.filter(i=>i.bloco===bloco),el=$(`#temas-${bloco}`),sel=state.tema[bloco];
  const buttons=[];
  TEMAS.forEach(t=>{
    const n=base.filter(i=>inTheme(i,t)).length;
    if(n)buttons.push(`<button class="topic-button ${sel===t.id?'active':''}" data-theme="${t.id}">${esc(t.nome)}</button>`);
  });
  buttons.push(`<button class="topic-button ${sel===''?'active':''}" data-theme="">Ver todos</button>`);
  el.innerHTML=buttons.join('');
}

function renderPortal(bloco){
  const sel=state.tema[bloco],base=items.filter(i=>i.bloco===bloco),target=$(`#lista-${bloco}`);
  if(sel===null){target.innerHTML='<p class="portal-prompt">Escolha um subtema para abrir os repertórios relacionados.</p>';return;}

  const out=sel?base.filter(i=>inTheme(i,TEMAS.find(t=>t.id===sel))):base;
  const titulo=sel?TEMAS.find(t=>t.id===sel)?.nome:'Todos os repertórios';
  target.innerHTML=`<div class="portal-result-heading"><h3>${esc(titulo)}</h3><p>${out.length} resultado${out.length===1?'':'s'}</p></div>${out.length?`<div class="card-grid">${out.map(card).join('')}</div>`:'<p class="empty-state">Ainda não há repertórios neste tema.</p>'}`;
}

function renderEntities(){
  const q=norm($('#busca-entidades')?.value),names=entityNames(items,state.tipo).filter(n=>norm(n).includes(q));
  $('#lista-entidades').innerHTML=names.map(n=>`<button class="entity-chip ${state.entidade===n?'active':''}" data-entity-type="${state.tipo}" data-entity-name="${esc(n)}">${esc(n)}</button>`).join('')||'<p class="portal-prompt">Nenhuma entrada encontrada.</p>';
}

function promptEntity(){$('#detalhe-entidade').innerHTML='<p class="portal-prompt">Escolha um conceito, tema, autor ou autora para ver suas conexões disponíveis.</p>';}
function selectEntity(tipo,nome){state.tipo=tipo;state.entidade=nome;setPortal('conceitos',true,false);$$('[data-entity-type]').forEach(x=>x.classList.toggle('active',x.dataset.entityType===tipo));renderEntities();$('#detalhe-entidade').innerHTML=entityDetail(items,tipo,nome);$('#detalhe-entidade').scrollIntoView({behavior:'smooth',block:'nearest'});}

function search(rawQuery,scroll=true){
  const query=String(rawQuery||'').trim();
  if(!query){clearSearch();$('#busca').focus();return;}

  const s=norm(query);
  const matchedItems=items.filter(i=>text(i).includes(s));
  state.search={
    query,
    current:null,
    dados:matchedItems.filter(i=>i.bloco==='dados'),
    cultura:matchedItems.filter(i=>i.bloco==='cultura'),
    conceitos:searchEntities('conceito',matchedItems,s),
    temas:searchEntities('tema',matchedItems,s),
    autores:searchEntities('autor',matchedItems,s)
  };

  $('#repertorios').hidden=false;
  $('#resumo-busca').textContent=`Resultados para “${query}”, organizados pelas três portas do Sociosofia.`;
  renderSearchNodes();
  renderSearchPanels();
  setSearchPortal(null,false);

  const url=new URL(location.href);
  url.searchParams.set('busca',query);
  url.searchParams.delete('origem');
  url.hash='repertorios';
  history.replaceState({},'',url);

  if(scroll)$('#repertorios').scrollIntoView({behavior:'smooth',block:'start'});
}

function searchEntities(tipo,matchedItems,queryNorm){
  const direct=entityNames(items,tipo).filter(nome=>norm(nome).includes(queryNorm));
  const contextual=matchedItems.flatMap(item=>itemEntityNames(item,tipo));
  return uniq([...direct,...contextual]);
}

function renderSearchNodes(){
  const totals={
    dados:state.search.dados.length,
    conceitos:state.search.conceitos.length+state.search.temas.length+state.search.autores.length,
    cultura:state.search.cultura.length
  };

  $$('[data-search-portal]').forEach(button=>{
    const key=button.dataset.searchPortal,total=totals[key]||0,status=button.querySelector('.search-vertex-status');
    button.disabled=total===0;
    button.setAttribute('aria-disabled',String(total===0));
    button.classList.toggle('is-empty',total===0);
    status.textContent=total===0?'Sem resultados':'';
  });
}

function renderSearchPanels(){
  $('#search-results-dados').innerHTML=resultCards(state.search.dados,'dados');
  $('#search-results-cultura').innerHTML=resultCards(state.search.cultura,'cultura');
  $('#search-results-conceitos').innerHTML=conceptualResults();
}

function resultCards(results,origin){
  if(!results.length)return '<p class="empty-state">Nenhum resultado neste vértice.</p>';
  return `<p class="search-branch-summary">${results.length} resultado${results.length===1?'':'s'}.</p><div class="card-grid">${results.map(item=>card(item,{busca:state.search.query,origem:origin})).join('')}</div>`;
}

function conceptualResults(){
  const groups=[
    ['conceito','Conceitos',state.search.conceitos],
    ['tema','Temas',state.search.temas],
    ['autor','Autores e autoras',state.search.autores]
  ].filter(([, ,values])=>values.length);
  if(!groups.length)return '<p class="empty-state">Nenhum resultado neste vértice.</p>';
  return groups.map(([tipo,titulo,values])=>`
    <section class="search-entity-group">
      <h5>${titulo}</h5>
      <ul class="search-entity-list">
        ${values.map(nome=>`<li><a href="${entitySearchUrl(tipo,nome)}">${esc(nome)}</a></li>`).join('')}
      </ul>
    </section>
  `).join('');
}

function entitySearchUrl(tipo,nome){
  const params=new URLSearchParams({tipo,entidade:nome,busca:state.search.query,origem:'conceitos'});
  return `index.html?${params.toString()}#temas`;
}

function setSearchPortal(key,scroll=true){
  state.search.current=key;
  $$('[data-search-portal]').forEach(button=>button.setAttribute('aria-expanded',String(button.dataset.searchPortal===key)));
  $$('[data-search-panel]').forEach(panel=>{panel.hidden=panel.dataset.searchPanel!==key;});
  $('#search-help').hidden=Boolean(key);
  if(key&&scroll){
    const panel=$(`[data-search-panel="${key}"]`);
    requestAnimationFrame(()=>panel?.scrollIntoView({behavior:'smooth',block:'nearest'}));
  }
}

function clearSearch(){
  state.search={query:'',current:null,dados:[],cultura:[],conceitos:[],temas:[],autores:[]};
  $('#busca').value='';
  $('#repertorios').hidden=true;
  setSearchPortal(null,false);
  const url=new URL(location.href);
  url.searchParams.delete('busca');
  url.searchParams.delete('origem');
  if(url.hash==='#repertorios')url.hash='';
  history.replaceState({},'',url);
}

function params(){
  const p=new URLSearchParams(location.search),entity=p.get('entidade'),entityType=p.get('tipo'),c=p.get('conceito'),a=p.get('autor'),b=p.get('bloco'),t=p.get('tema'),q=p.get('busca')||p.get('tag');
  if(q){$('#busca').value=q;search(q,false);}
  if(entity&&['conceito','tema','autor'].includes(entityType)){selectEntity(entityType,entity);return;}
  if(c||a){selectEntity(c?'conceito':'autor',c||a);return;}
  if(['dados','cultura','conceitos'].includes(b)){
    setPortal(b,true,false);
    if(t&&b!=='conceitos'){state.tema[b]=t;renderThemes(b);renderPortal(b);}
  }
}
