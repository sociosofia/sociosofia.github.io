const STORAGE_PREFIX='sociosofia-elo:';

function clearSavedEloState(){
  for(let index=localStorage.length-1;index>=0;index--){
    const key=localStorage.key(index);
    if(key?.startsWith(STORAGE_PREFIX))localStorage.removeItem(key);
  }
}

clearSavedEloState();

if(!Storage.prototype.__sociosofiaEloPersistenceSuspended){
  const originalSetItem=Storage.prototype.setItem;
  Object.defineProperty(Storage.prototype,'__sociosofiaEloPersistenceSuspended',{value:true});
  Storage.prototype.setItem=function(key,value){
    if(String(key).startsWith(STORAGE_PREFIX))return;
    return originalSetItem.call(this,key,value);
  };
}

document.getElementById('resumeBanner')?.remove();
window.addEventListener('pagehide',clearSavedEloState);

const entityRoutes={
  conceito:{
    Alienação:'index.html?tipo=conceito&entidade=Aliena%C3%A7%C3%A3o#temas'
  },
  autor:{
    'Karl Marx':'index.html?tipo=autor&entidade=Karl%20Marx#temas'
  },
  repertorio:{
    'Vidas Entregues':'repertorio.html?id=CUL-0014'
  }
};

function linkEntity(element,href,label){
  if(!element||element.querySelector('a'))return;
  const content=element.innerHTML;
  element.innerHTML=`<a class="elo-entity-link" href="${href}" aria-label="${label}">${content}</a>`;
}

function enhancePanel(){
  const panel=document.getElementById('dynamicPanel');
  if(!panel||panel.hidden)return;

  const type=panel.querySelector('.elo-panel-type')?.textContent.trim().toLowerCase();
  const titleElement=panel.querySelector('.elo-panel-title');
  const plainTitle=titleElement?.textContent.trim();

  if(type==='conceito'&&plainTitle&&entityRoutes.conceito[plainTitle]){
    linkEntity(titleElement,entityRoutes.conceito[plainTitle],`Abrir o card completo do conceito ${plainTitle}`);
  }

  if(type==='repertório'&&plainTitle&&entityRoutes.repertorio[plainTitle]){
    linkEntity(titleElement,entityRoutes.repertorio[plainTitle],`Abrir o card completo de ${plainTitle}`);
  }

  panel.querySelectorAll('.elo-callout').forEach(callout=>{
    const label=callout.querySelector('.elo-callout-label')?.textContent.trim().toLowerCase()||'';
    const title=callout.querySelector('strong');
    const name=title?.textContent.trim();
    if(label.includes('autor')&&name&&entityRoutes.autor[name]){
      linkEntity(title,entityRoutes.autor[name],`Abrir o card de ${name}`);
    }
  });
}

const dynamicPanel=document.getElementById('dynamicPanel');
if(dynamicPanel){
  new MutationObserver(enhancePanel).observe(dynamicPanel,{childList:true,subtree:true});
  enhancePanel();
}
