export function buildShell(){
  const main=document.querySelector("#conteudo");
  main.innerHTML=`
  <section id="temas" class="section section-entry container"><div class="section-heading"><p class="eyebrow">Três portas de entrada</p><h2>Escolha por onde começar</h2><p>Você pode começar por um dado, por uma obra cultural ou por uma ferramenta de interpretação e circular entre os três blocos.</p></div>
  <div class="portal-list">
    ${portal("dados","01","Dados, notícias, artigos e pesquisas","Informações verificáveis para compreender como os problemas aparecem na realidade.")}
    ${portal("cultura","02","Filmes, séries e outros repertórios culturais","Obras que tornam os problemas visíveis, sensíveis e discutíveis.")}
    <article class="portal-card" data-portal="conceitos"><button class="portal-toggle" type="button" aria-expanded="false"><span class="portal-number">03</span><span class="portal-copy"><strong>Conceitos, temas, autores e autoras</strong><small>Ideias e referências que ajudam a interpretar repertórios e construir argumentos.</small></span><span id="contador-conceitos" class="portal-count"></span><span class="portal-arrow">⌄</span></button><div class="portal-panel" hidden><div class="entity-toolbar"><div class="entity-tabs"><button class="entity-tab active" data-entity-type="conceito">Conceitos</button><button class="entity-tab" data-entity-type="tema">Temas</button><button class="entity-tab" data-entity-type="autor">Autores e autoras</button></div><label class="entity-search-label"><span class="sr-only">Filtrar lista</span><input id="busca-entidades" type="search" placeholder="Filtrar esta lista..."></label></div><div id="lista-entidades" class="entity-list"></div><div id="detalhe-entidade" class="entity-detail"><p class="portal-prompt">Escolha uma entrada para ver suas conexões com os repertórios disponíveis.</p></div></div></article>
  </div></section>

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

function portal(id,n,titulo,descricao){return `<article class="portal-card" data-portal="${id}"><button class="portal-toggle" type="button" aria-expanded="false"><span class="portal-number">${n}</span><span class="portal-copy"><strong>${titulo}</strong><small>${descricao}</small></span><span id="contador-${id}" class="portal-count"></span><span class="portal-arrow">⌄</span></button><div class="portal-panel" hidden><div class="portal-intro"><h3>Escolha um tema</h3></div><div id="temas-${id}" class="topic-grid"></div><div id="lista-${id}" class="portal-content"></div></div></article>`;}
