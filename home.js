import {TEMAS,loadItems,inTheme,text,norm,esc} from './site-shared.js';
import {prepareHeader,buildShell} from './home-shell.js';
import {card,feature,entityDetail,entityNames} from './home-cards.js';

prepareHeader();buildShell();
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let items=[],state={tema:{dados:'',cultura:''},tipo:'conceito',entidade:'',aberto:''};

init();
async function init(){
  menu();events();
  try{items=await loadItems();renderAll();params();}
  catch(e){['#lista-dados','#lista-cultura'].forEach(s=>$(s).innerHTML='<p class="empty-state">Não foi possível carregar o banco de repertórios.</p>');console.error(e);}
}

function menu(){const b=$('.nav-toggle'),l=$('#menu-principal');b?.addEventListener('click',()=>{const a=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!a));l?.classList.toggle('open');});}

function events(){
  $('#explorar').addEventListener('click',e=>{
    const choice=e.target.closest('.portal-choice');if(choice){togglePortal(choice.dataset.portal);return;}
    const t=e.target.closest('[data-theme]');if(t){const b=t.closest('[data-panel]').dataset.panel;state.tema[b]=t.dataset.theme;renderThemes(b);renderPortal(b);return;}
    const tab=e.target.closest('[data-entity-type]');if(tab){state.tipo=tab.dataset.entityType;state.entidade='';$$('[data-entity-type]').forEach(x=>x.classList.toggle('active',x===tab));$('#busca-entidades').value='';renderEntities();promptEntity();return;}
    const ent=e.target.closest('[data-entity-name]');if(ent)selectEntity(ent.dataset.entityType,ent.dataset.entityName);
  });
  $('#busca-entidades').addEventListener('input',renderEntities);
  $('#header-search-toggle').addEventListener('click',toggleSearch);
  $('#header-search-form').addEventListener('submit',e=>{e.preventDefault();search($('#header-search-input').value);});
  $('#header-search-input').addEventListener('keydown',e=>{if(e.key==='Escape')closeSearch();});
  $('#limpar-busca').addEventListener('click',()=>{$('#header-search-input').value='';$('#repertorios').hidden=true;});
}

function renderAll(){
  const d=items.filter(i=>i.bloco==='dados'),c=items.filter(i=>i.bloco==='cultura');
  $('#contador-dados').textContent=`${d.length} repertório${d.length===1?'':'s'}`;
  $('#contador-cultura').textContent=`${c.length} repertório${c.length===1?'':'s'}`;
  $('#contador-conceitos').textContent=`${entityNames(items,'conceito').length+entityNames(items,'autor').length} entradas`;
  $('#curadoria').innerHTML=feature(items.find(i=>i.destaque)||items[0]);
  ['dados','cultura'].forEach(b=>{renderThemes(b);renderPortal(b);});renderEntities();
}

function togglePortal(bloco){state.aberto=state.aberto===bloco?'':bloco;applyPortal(true);}
function openPortal(bloco,scroll=true){state.aberto=bloco;applyPortal(scroll);}
function applyPortal(scroll){
  const open=state.aberto;$('#portal-expanded').hidden=!open;
  $$('.portal-choice').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.portal===open)));
  $$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==open);
  if(open&&scroll)$('#portal-expanded').scrollIntoView({behavior:'smooth',block:'nearest'});
}

function renderThemes(bloco){
  const base=items.filter(i=>i.bloco===bloco),el=$(`#temas-${bloco}`),sel=state.tema[bloco];
  const buttons=[`<button class="topic-button ${!sel?'active':''}" data-theme="">Todos <small>${base.length}</small></button>`];
  TEMAS.forEach(t=>{const n=base.filter(i=>inTheme(i,t)).length;if(n)buttons.push(`<button class="topic-button ${sel===t.id?'active':''}" data-theme="${t.id}">${esc(t.nome)} <small>${n}</small></button>`);});
  el.innerHTML=buttons.join('');
}

function renderPortal(bloco){
  const sel=state.tema[bloco],base=items.filter(i=>i.bloco===bloco),out=sel?base.filter(i=>inTheme(i,TEMAS.find(t=>t.id===sel))):base;
  const titulo=sel?TEMAS.find(t=>t.id===sel)?.nome:'Todos os repertórios';
  $(`#lista-${bloco}`).innerHTML=`<div class="portal-result-heading"><h3>${esc(titulo)}</h3><p>${out.length} resultado${out.length===1?'':'s'}</p></div>${out.length?`<div class="card-grid">${out.map(card).join('')}</div>`:'<p class="empty-state">Ainda não há repertórios neste tema.</p>'}`;
}

function renderEntities(){const q=norm($('#busca-entidades')?.value),names=entityNames(items,state.tipo).filter(n=>norm(n).includes(q));$('#lista-entidades').innerHTML=names.map(n=>`<button class="entity-chip ${state.entidade===n?'active':''}" data-entity-type="${state.tipo}" data-entity-name="${esc(n)}">${esc(n)}</button>`).join('')||'<p class="portal-prompt">Nenhuma entrada encontrada.</p>';}
function promptEntity(){$('#detalhe-entidade').innerHTML='<p class="portal-prompt">Escolha uma entrada para ver as conexões com os outros dois blocos.</p>';}
function selectEntity(tipo,nome){state.tipo=tipo;state.entidade=nome;openPortal('conceitos',false);$$('[data-entity-type]').forEach(x=>x.classList.toggle('active',x.dataset.entityType===tipo));renderEntities();$('#detalhe-entidade').innerHTML=entityDetail(items,tipo,nome);$('#detalhe-entidade').scrollIntoView({behavior:'smooth',block:'nearest'});}

function toggleSearch(){const form=$('#header-search-form'),open=form.hidden;form.hidden=!open;$('#header-search-toggle').setAttribute('aria-expanded',String(open));document.querySelector('.header-search').classList.toggle('open',open);if(open)$('#header-search-input').focus();}
function closeSearch(){const form=$('#header-search-form');form.hidden=true;$('#header-search-toggle').setAttribute('aria-expanded','false');document.querySelector('.header-search').classList.remove('open');$('#header-search-toggle').focus();}
function search(q,scroll=true){const s=norm(q.trim()),out=items.filter(i=>!s||text(i).includes(s));$('#repertorios').hidden=false;$('#resumo-busca').textContent=q.trim()?`${out.length} resultado${out.length===1?'':'s'} para “${q.trim()}”.`:`${out.length} repertórios disponíveis.`;$('#lista-resultados').innerHTML=out.map(card).join('');$('#sem-resultados').hidden=out.length>0;if(scroll)$('#repertorios').scrollIntoView({behavior:'smooth'});}

function params(){const p=new URLSearchParams(location.search),c=p.get('conceito'),a=p.get('autor'),b=p.get('bloco'),t=p.get('tema'),q=p.get('busca')||p.get('tag');if(c||a){selectEntity(c?'conceito':'autor',c||a);return;}if(['dados','cultura','conceitos'].includes(b)){openPortal(b,false);if(t&&b!=='conceitos'){state.tema[b]=t;renderThemes(b);renderPortal(b);}}if(q){$('#header-search-input').value=q;search(q,false);}}
