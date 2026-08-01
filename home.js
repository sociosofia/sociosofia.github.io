import {TEMAS,loadItems,loadEntityRegistry,loadHighlights,inTheme,text,norm,esc,entityNames} from './site-shared.js';
import {buildShell} from './home-shell.js';
import {card,feature,previousHighlight,entityDetail} from './home-cards.js';

buildShell();
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let items=[],highlights={atual:null,anteriores:[]},state={tema:{dados:null,cultura:null},tipo:'conceito',entidade:''};

init();
async function init(){
  menu();events();
  try{
    const [loadedItems,loadedHighlights]=await Promise.all([loadItems(),loadHighlights(),loadEntityRegistry()]);
    items=loadedItems;
    highlights=loadedHighlights;
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
  $('.search-box')?.addEventListener('submit',e=>{e.preventDefault();search($('#busca').value);});
  $$('[data-chip],[data-search]').forEach(b=>b.addEventListener('click',()=>{const q=b.dataset.chip||b.dataset.search;$('#busca').value=q;search(q);}));
  $('#limpar-busca').addEventListener('click',()=>{$('#busca').value='';$('#repertorios').hidden=true;});
}

function renderAll(){
  renderWeekly();
  ['dados','cultura'].forEach(b=>{renderThemes(b);renderPortal(b);});
  renderEntities();
}

function renderWeekly(){
  const currentMeta=highlights.atual||{};
  const current=items.find(i=>i.id===currentMeta.id)||items.find(i=>i.destaque)||items[0];
  $('#repertorio-semana').innerHTML=feature(current,currentMeta);

  const previous=(highlights.anteriores||[]).map(meta=>({meta,item:items.find(i=>i.id===meta.id)})).filter(x=>x.item);
  const section=$('#destaques-anteriores');
  section.hidden=previous.length===0;
  $('#lista-destaques-anteriores').innerHTML=previous.map(({item,meta})=>previousHighlight(item,meta)).join('');
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

function search(q,scroll=true){
  const s=norm(q.trim()),out=items.filter(i=>!s||text(i).includes(s));$('#repertorios').hidden=false;
  $('#resumo-busca').textContent=q.trim()?`${out.length} resultado${out.length===1?'':'s'} para “${q.trim()}”.`:`${out.length} repertórios disponíveis.`;
  $('#lista-resultados').innerHTML=out.map(card).join('');$('#sem-resultados').hidden=out.length>0;if(scroll)$('#repertorios').scrollIntoView({behavior:'smooth'});
}

function params(){
  const p=new URLSearchParams(location.search),entity=p.get('entidade'),entityType=p.get('tipo'),c=p.get('conceito'),a=p.get('autor'),b=p.get('bloco'),t=p.get('tema'),q=p.get('busca')||p.get('tag');
  if(entity&&['conceito','tema','autor'].includes(entityType)){selectEntity(entityType,entity);return;}
  if(c||a){selectEntity(c?'conceito':'autor',c||a);return;}
  if(['dados','cultura','conceitos'].includes(b)){
    setPortal(b,true,false);
    if(t&&b!=='conceitos'){state.tema[b]=t;renderThemes(b);renderPortal(b);}
  }
  if(q){$('#busca').value=q;search(q,false);}
}
