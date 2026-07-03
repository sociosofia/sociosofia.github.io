export function prepareHeader(){
  document.querySelector('.search-box')?.remove();
  document.querySelector('.quick-links')?.remove();
  const nav=document.querySelector('.nav');
  const list=document.querySelector('#menu-principal');
  if(list)list.innerHTML='<li><a href="index.html" aria-current="page">Início</a></li><li><a href="#explorar">Explorar</a></li><li><a href="#como-usar">Como usar</a></li><li><a href="sobre.html">Sobre</a></li>';
  if(nav&&!document.querySelector('.header-search'))nav.insertAdjacentHTML('beforeend',`<div class="header-search"><button id="header-search-toggle" class="header-search-toggle" type="button" aria-expanded="false" aria-controls="header-search-form"><span aria-hidden="true">⌕</span><span>Procure por um assunto, obra ou conceito</span></button><form id="header-search-form" class="header-search-form" role="search" hidden><label class="sr-only" for="header-search-input">Buscar no Sociosofia</label><input id="header-search-input" type="search" placeholder="Digite sua busca..."><button type="submit">Buscar</button></form></div>`);
}

export function buildShell(){
  const main=document.querySelector('#conteudo');
  main.innerHTML=`
  <section id="explorar" class="section portal-home-section container"><div class="section-heading"><p class="eyebrow">Explore o Sociosofia</p><h2>Três caminhos que se encontram</h2><p>Comece por informações, por obras culturais ou por ferramentas teóricas. Os três blocos conversam entre si.</p></div>
    <div class="portal-choice-grid">
      ${choice('dados','01','Dados, notícias, artigos e pesquisas','Problemas do presente em fontes verificáveis.')}
      ${choice('cultura','02','Filmes, séries e repertórios culturais','Obras que tornam os problemas visíveis e sensíveis.')}
      ${choice('conceitos','03','Conceitos, autores e autoras','Ferramentas para interpretar e argumentar.')}
    </div>
    <div id="portal-expanded" class="portal-expanded" hidden>
      ${panel('dados','Escolha um tema para ver dados, notícias, artigos e pesquisas.')}
      ${panel('cultura','Escolha um tema para ver filmes, séries e outros repertórios culturais.')}
      <div class="portal-panel" data-panel="conceitos" hidden><div class="portal-intro"><h3>Conceitos, autores e autoras</h3><p>Escolha uma entrada para ver como ela se relaciona aos outros dois blocos.</p></div><div class="entity-toolbar"><div class="entity-tabs"><button class="entity-tab active" data-entity-type="conceito">Conceitos</button><button class="entity-tab" data-entity-type="autor">Autores e autoras</button></div><label class="entity-search-label"><span class="sr-only">Filtrar lista</span><input id="busca-entidades" type="search" placeholder="Filtrar esta lista..."></label></div><div id="lista-entidades" class="entity-list"></div><div id="detalhe-entidade" class="entity-detail"><p class="portal-prompt">Escolha uma entrada para ver suas conexões.</p></div></div>
    </div>
  </section>
  <section id="como-usar" class="section container"><div class="section-heading"><p class="eyebrow">Como usar o Sociosofia</p><h2>Do repertório ao argumento</h2><p>O site foi pensado para ajudar você a encontrar, compreender e relacionar repertórios, não apenas colecioná-los.</p></div><div class="how-grid"><article><span>1</span><h3>Comece por onde fizer sentido</h3><p>Um dado ajuda a enxergar o problema, uma obra cultural ajuda a senti-lo e um conceito ajuda a interpretá-lo.</p></article><article><span>2</span><h3>Siga as conexões</h3><p>Cada ficha conduz aos outros blocos: pesquisas levam a filmes e conceitos; filmes levam a dados e autores; conceitos reúnem os dois.</p></article><article><span>3</span><h3>Transforme em argumento</h3><p>Explique o repertório, relacione-o ao tema e mostre o que ele prova ou ajuda a compreender.</p></article></div><div class="ifmg-note"><strong>Um repertório bem utilizado é:</strong><div><span><b>Legitimado</b> — apresenta origem, autoria e contexto.</span><span><b>Pertinente</b> — relaciona-se de fato ao problema discutido.</span><span><b>Produtivo</b> — sustenta e desenvolve a argumentação.</span></div></div></section>
  <section class="section weekly-section container"><div class="section-heading"><p class="eyebrow">Repertório da semana</p><h2>Uma conexão para começar</h2><p>Um filme, pesquisa, notícia ou conceito em destaque para circular pelos três blocos.</p></div><div id="curadoria" class="feature-card"></div></section>
  <section id="repertorios" class="section container search-results-section" hidden><div class="section-heading split"><div><p class="eyebrow">Busca integrada</p><h2>Resultados</h2><p id="resumo-busca"></p></div><button id="limpar-busca" class="button ghost">Limpar busca</button></div><div id="lista-resultados" class="card-grid"></div><p id="sem-resultados" class="empty-state" hidden>Nenhum repertório encontrado.</p></section>`;
}

function choice(id,n,titulo,descricao){return `<button class="portal-choice" type="button" data-portal="${id}" aria-expanded="false"><span class="portal-number">${n}</span><strong>${titulo}</strong><small>${descricao}</small><span id="contador-${id}" class="portal-count"></span><span class="portal-arrow">⌄</span></button>`;}
function panel(id,texto){return `<div class="portal-panel" data-panel="${id}" hidden><div class="portal-intro"><h3>Escolha um tema</h3><p>${texto}</p></div><div id="temas-${id}" class="topic-grid"></div><div id="lista-${id}" class="portal-content"></div></div>`;}
