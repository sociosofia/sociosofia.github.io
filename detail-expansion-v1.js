const INITIAL_ITEMS=6;

for(const group of document.querySelectorAll('.entity-path-group, .continuity-vertex')){
  const list=group.querySelector(':scope > ul');
  if(!list)continue;

  const items=[...list.children];
  if(items.length<=INITIAL_ITEMS)continue;

  const hiddenItems=items.slice(INITIAL_ITEMS);
  const details=document.createElement('details');
  details.className='detail-more-paths';

  const summary=document.createElement('summary');
  const closedLabel=`Ver mais ${hiddenItems.length} caminho${hiddenItems.length===1?'':'s'}`;
  const openLabel='Recolher caminhos';
  summary.textContent=closedLabel;

  const extraList=document.createElement('ul');
  extraList.className='detail-more-list';
  hiddenItems.forEach(item=>extraList.appendChild(item));

  details.append(summary,extraList);
  details.addEventListener('toggle',()=>{summary.textContent=details.open?openLabel:closedLabel;});
  group.appendChild(details);
}
