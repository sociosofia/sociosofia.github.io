export function buildShell(){
  const main=document.querySelector("#conteudo");
  main.innerHTML=`
  <section id="temas" class="section section-entry container">
    <div class="section-heading">
      <p class="eyebrow">Três portas de entrada</p>
      <h2>Escolha por onde começar</h2>
      <p>Comece por um dado, por uma ferramenta de interpretação ou por uma obra cultural. Cada vértice abre seus próprios subtemas e conexões.</p>
    </div>

    <div class="entry-elo">
      <div class="entry-map" role="group" aria-label="Escolha uma porta de entrada">
        <svg class="entry-lines" viewBox="0 0 500 425" aria-hidden="true">
          <line x1="250" y1="60" x2="105" y2="330"></line>
          <line x1="250" y1="60" x2="395" y2="330"></line>
          <line x1="105" y1="330" x2="395" y2="330"></line>
        </svg>

        ${entryNode("dados","Dado","contador-dados",dataIcon())}
        ${entryNode("conceitos","Conceito","contador-conceitos",conceptIcon())}
        ${entryNode("cultura","Repertório","contador-cultura",cultureIcon())}
      </div>

      <p class="entry-help">Toque em um vértice para abrir. Toque novamente no mesmo vértice para fechar.</p>

      <div class="entry-panel-stack">
        ${repertoryPanel("dados","Dado","Pesquisas, notícias e dados","Escolha um subtema para ver informações verificáveis e leituras do presente.")}
        <article class="entry-panel" id="painel-conceitos" data-portal="conceitos" hidden>
          <header class="entry-panel-heading">
            <span class="entry-panel-label">Conceito</span>
            <h3>Conceitos, temas, autores e autoras</h3>
            <p>Escolha uma ferramenta de interpretação e veja suas conexões com os repertórios disponíveis.</p>
          </header>
          <div class="entity-toolbar">
            <div class="entity-tabs">
              <button class="entity-tab active" data-entity-type="conceito">Conceitos</button>
              <button class="entity-tab" data-entity-type="tema">Temas</button>
              <button class="entity-tab" data-entity-type="autor">Autores e autoras</button>
            </div>
            <label class="entity-search-label">
              <span class="sr-only">Filtrar lista</span>
              <input id="busca-entidades" type="search" placeholder="Filtrar esta lista...">
            </label>
          </div>
          <div id="lista-entidades" class="entity-list"></div>
          <div id="detalhe-entidade" class="entity-detail">
            <p class="portal-prompt">Escolha uma entrada para ver suas conexões com os repertórios disponíveis.</p>
          </div>
        </article>
        ${repertoryPanel("cultura","Repertório","Filmes, séries e outros repertórios culturais","Escolha um subtema para encontrar obras que tornam os problemas visíveis, sensíveis e discutíveis.")}
      </div>
    </div>
  </section>

  <section id="elo-em-destaque" class="elo-home-section container" aria-labelledby="titulo-elo-em-destaque">
    <a class="elo-home-card" href="elo.html?id=ELO-trabalho-plataformas-controle">
      <svg class="elo-home-symbol" viewBox="0 0 90 78" aria-hidden="true">
        <path d="M45 8 L12 66 L78 66 Z" fill="none" stroke="#A99B88" stroke-width="2" />
        <circle cx="45" cy="8" r="8" fill="#2F6F73" />
        <circle cx="12" cy="66" r="8" fill="#5B2E91" />
        <circle cx="78" cy="66" r="8" fill="#D95D39" />
      </svg>
      <span class="elo-home-copy">
        <span class="elo-home-label">Elo em destaque</span>
        <h2 id="titulo-elo-em-destaque">Quem controla o trabalho por aplicativos?</h2>
        <p>Um percurso entre um dado sobre trabalho por plataformas, o conceito de alienação e o documentário <em>Vidas Entregues</em>.</p>
      </span>
      <span class="elo-home-action">
        Explorar o elo
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </a>
  </section>

  <section class="section keyword-search-section container" aria-labelledby="titulo-palavras-chave">
    <div class="section-heading">
      <p class="eyebrow">Outra forma de explorar</p>
      <h2 id="titulo-palavras-chave">Ou busque por palavras-chave</h2>
      <p>Depois de conhecer a estrutura do Sociosofia, você pode ir diretamente a um tema, conceito, autor, obra ou assunto de interesse.</p>
    </div>
    <form class="search-box keyword-search-box" role="search" aria-label="Busca de repertórios por palavra-chave">
      <label for="busca" class="sr-only">Buscar repertórios</label>
      <input id="busca" type="search" placeholder="Busque por tema, conceito, autor, filme ou atualidade..." autocomplete="off" />
      <button type="submit">
        <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4.4-4.4"></path></svg>
        <span>Buscar</span>
      </button>
    </form>
    <p class="keyword-shortcuts-label">Atalhos por tipo de repertório</p>
    <div class="quick-links keyword-shortcuts" aria-label="Atalhos para busca rápida">
      <button class="chip" data-chip="notícias">Notícias</button>
      <button class="chip" data-chip="dados">Dados</button>
      <button class="chip" data-chip="pesquisa">Pesquisas</button>
      <button class="chip" data-chip="filmes">Filmes</button>
      <button class="chip" data-chip="livros">Livros</button>
    </div>
  </section>

  <section class="section section-feature container" aria-labelledby="titulo-repertorio-semana">
    <div class="section-heading weekly-heading">
      <p class="eyebrow">Repertório da semana</p>
      <h2 id="titulo-repertorio-semana">Para pensar o presente</h2>
      <p>Um repertório ligado a um acontecimento recente, conectado a conceitos, autores e outras leituras.</p>
    </div>
    <div id="repertorio-semana" class="feature-card"></div>
    <section id="destaques-anteriores" class="previous-highlights" aria-labelledby="titulo-destaques-anteriores" hidden>
      <div class="previous-highlights-heading">
        <h3 id="titulo-destaques-anteriores">Destaques anteriores</h3>
        <p>Repertórios que estiveram em evidência nas semanas anteriores.</p>
      </div>
      <div id="lista-destaques-anteriores" class="previous-highlights-grid"></div>
    </section>
  </section>

  <section id="repertorios" class="section container search-results-section" hidden><div class="section-heading split"><div><p class="eyebrow">Busca integrada</p><h2>Resultados</h2><p id="resumo-busca"></p></div><button id="limpar-busca" class="button ghost">Limpar busca</button></div><div id="lista-resultados" class="card-grid"></div><p id="sem-resultados" class="empty-state" hidden>Nenhum repertório encontrado.</p></section>`;
}

function entryNode(id,label,countId,icon){
  return `<button class="entry-node" type="button" data-entry-portal="${id}" aria-expanded="false" aria-controls="painel-${id}"><span class="entry-node-disc" aria-hidden="true">${icon}</span><span class="entry-node-title">${label}</span><span class="entry-node-count" id="${countId}"></span></button>`;
}

function repertoryPanel(id,label,title,description){
  return `<article class="entry-panel" id="painel-${id}" data-portal="${id}" hidden><header class="entry-panel-heading"><span class="entry-panel-label">${label}</span><h3>${title}</h3><p>${description}</p></header><div id="temas-${id}" class="topic-grid"></div><div id="lista-${id}" class="portal-content"></div></article>`;
}

function dataIcon(){
  return `<svg viewBox="0 0 48 48" fill="none"><circle cx="15" cy="15" r="6.2" stroke="currentColor" stroke-width="3"/><circle cx="33" cy="33" r="6.2" stroke="currentColor" stroke-width="3"/><path d="M34 12L14 36" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg>`;
}

function conceptIcon(){
  return `<svg viewBox="0 0 48 48" fill="none"><path d="M8 13.5C14.5 11.4 19.2 12.2 24 16V38C19.2 34.2 14.5 33.4 8 35.5V13.5Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M40 13.5C33.5 11.4 28.8 12.2 24 16V38C28.8 34.2 33.5 33.4 40 35.5V13.5Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M31.5 7.5L39.8 15.8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;
}

function cultureIcon(){
  return `<svg viewBox="0 0 48 48" fill="none"><path d="M8 18H40V39H8V18Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M8 18L12 9H43L39 18H8Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M17 9L13 18M27 9L23 18M37 9L33 18" stroke="currentColor" stroke-width="2.2"/><path d="M20 25.5L31 31L20 36.5V25.5Z" fill="currentColor"/></svg>`;
}
