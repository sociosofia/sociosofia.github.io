(() => {
  window.applySociosofiaSoc1Etapa1V8 = function applySociosofiaSoc1Etapa1V8(page) {
    const V8 = window.__SOCIOSOFIA_V8_DATA__;
    if (typeof page !== 'string' || !V8 || page.includes('data-sociosofia-content="soc1-e1-v8"')) {
      return page;
    }

    const dataPattern = /(<script id="site-data" type="application\/json">)([\s\S]*?)(<\/script>)/i;
    const match = page.match(dataPattern);
    if (!match) {
      console.warn('Sociosofia v8: #site-data não encontrado; conteúdo anterior preservado.');
      return page;
    }

    let data;
    try {
      data = JSON.parse(match[2]);
    } catch (error) {
      console.error('Sociosofia v8: não foi possível ler #site-data.', error);
      return page;
    }

    const primary = V8.primary || {};
    const chaptersByNumber = new Map(data.chapters.map(chapter => [Number(chapter.number), chapter]));

    for (const c8 of V8.c || []) {
      const chapter = chaptersByNumber.get(Number(c8.n));
      if (!chapter) continue;

      chapter.title = c8.title;
      chapter.pages = c8.pages;
      if (c8.lead) chapter.lead = c8.lead;

      const oldById = new Map((chapter.movements || []).map(movement => [movement.id, movement]));
      chapter.movements = (c8.movements || []).map(m8 => {
        const id = `c${c8.n}-m${m8.n}`;
        const old = oldById.get(id) || {};
        const visible = (m8.o || []).filter(occ => occ[3] !== 'absorbed');

        return {
          ...old,
          id,
          title: m8.title,
          pages: m8.pages,
          question: m8.q,
          text: (m8.p || []).join('\n\n'),
          shift: '',
          next: m8.t,
          cards: visible.map(occ => occ[0]),
          v8: {
            paragraphs: m8.p || [],
            occurrences: m8.o || [],
            links: m8.l || [],
            transition: m8.t
          }
        };
      });
    }

    data.v8 = {
      content: 'soc1-e1-v8',
      version: V8.v || 'v8-final-aprovada',
      primary
    };

    const safeJson = JSON.stringify(data).replace(/</g, '\\u003c');
    let output = page.replace(dataPattern, `$1${safeJson}$3`);

    const css = `
<style data-sociosofia-content="soc1-e1-v8">
  .v8-reading-flow{max-width:900px}
  .v8-reading-flow>p{margin:0 0 1em}
  .v8-entity-zone{display:grid;gap:10px;margin-top:16px}
  .v8-independent-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  .v8-linked-set{border:1px dashed rgba(91,46,145,.24);border-radius:15px;background:rgba(91,46,145,.025);padding:10px}
  .v8-linked-label{display:block;margin:0 0 8px;color:var(--primary,#5B2E91);font-size:.63rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase}
  .v8-linked-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  .v8-contextual-use{width:100%;min-height:100%;border:1px solid rgba(47,111,115,.22);border-left:3px solid var(--support,#2F6F73);border-radius:13px;background:rgba(47,111,115,.055);padding:12px 13px;text-align:left;color:var(--text,#1F1F1F);cursor:pointer;font:inherit;line-height:1.5}
  .v8-contextual-use:hover,.v8-contextual-use:focus-visible{border-color:var(--support,#2F6F73);background:rgba(47,111,115,.085)}
  .v8-contextual-label{display:block;margin-bottom:4px;color:var(--support,#2F6F73);font-size:.62rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase}
  .v8-contextual-title{display:block;margin-bottom:5px;font-weight:800;color:var(--text,#1F1F1F)}
  .v8-contextual-text{display:block;color:#514A54;font-size:.9rem}
  .v8-full-trigger{width:100%;min-height:44px;text-align:left;white-space:normal}
  .v8-transition{margin-top:16px}
  @media(max-width:620px){
    .v8-independent-list,.v8-linked-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
    .v8-contextual-use{padding:10px}
  }
  @media(max-width:350px){.v8-independent-list,.v8-linked-grid{grid-template-columns:1fr}}
</style>`;

    const behavior = `
<script data-sociosofia-content="soc1-e1-v8">
(() => {
  document.documentElement.dataset.sociosofiaContent='soc1-e1-v8';

  const v8Occurrence = (raw) => ({
    id: raw[0],
    title: raw[1],
    type: raw[2],
    treatment: raw[3],
    contextualText: raw[4]
  });

  const v8EntityNode = (occ, chapterNumber) => {
    const entity = DATA.entities[occ.id];
    if (!entity) return '';

    if (occ.treatment === 'full') {
      return '<button class="entity-btn v8-full-trigger" data-v8-treatment="full" onclick="openEntity(&quot;' +
        esc(occ.id) + '&quot;,' + Number(chapterNumber) + ')">' + esc(entity.title) + '</button>';
    }

    if (occ.treatment === 'contextual') {
      return '<button class="v8-contextual-use" data-v8-treatment="contextual" data-v8-entity="' + esc(occ.id) +
        '" onclick="openEntity(&quot;' + esc(occ.id) + '&quot;,' + Number(chapterNumber) + ')">' +
        '<span class="v8-contextual-label">Retomada contextual · ' + esc(entity.type) + '</span>' +
        '<span class="v8-contextual-title">' + esc(entity.title) + '</span>' +
        '<span class="v8-contextual-text">' + esc(occ.contextualText || entity.short || '') + '</span>' +
        '</button>';
    }
    return '';
  };

  renderMovement = function renderMovementV8(m, i, ch) {
    if (!m.v8) {
      const buttons=(m.cards||[]).map(id=>{const e=DATA.entities[id];return e?'<button class="entity-btn" onclick="openEntity(&quot;' + esc(id) + '&quot;,' + ch + ')">' + esc(e.title) + '</button>':''}).join('');
      return '<article class="movement" id="' + esc(m.id) + '" data-index="' + (i+1) + '"><header class="movement-head"><div><p class="eyebrow">Movimento de aprendizagem</p><h3>' + esc(m.title) + '</h3><p class="question">' + esc(m.question) + '</p></div><span class="pages">Livro: p. ' + esc(m.pages) + '</span></header><div class="movement-body"><p>' + esc(m.text) + '</p><p class="shift"><strong>O que muda no nosso olhar:</strong> ' + esc(m.shift) + '</p><p class="bridge"><strong>Passagem:</strong> ' + esc(m.next) + '</p>' + (buttons?'<div class="entity-row">'+buttons+'</div>':'') + '</div></article>';
    }

    const occurrences=(m.v8.occurrences||[]).map(v8Occurrence).filter(occ=>occ.treatment!=='absorbed');
    const links=m.v8.links||[];
    const used=new Set();
    const units=[];

    for (const occ of occurrences) {
      if (used.has(occ.id)) continue;
      const link=links.find(pair=>pair[0]===occ.id||pair[1]===occ.id);
      if (link) {
        const partnerId=link[0]===occ.id?link[1]:link[0];
        const partner=occurrences.find(item=>item.id===partnerId);
        if (partner && !used.has(partner.id)) {
          const a=v8EntityNode(occ,ch), b=v8EntityNode(partner,ch);
          if (a && b) {
            units.push('<section class="v8-linked-set" data-v8-link="' + esc(occ.id+'--'+partner.id) + '"><span class="v8-linked-label">Unidade editorial vinculada</span><div class="v8-linked-grid">'+a+b+'</div></section>');
            used.add(occ.id); used.add(partner.id); continue;
          }
        }
      }
      const node=v8EntityNode(occ,ch);
      if (node) units.push('<div class="v8-independent-list">'+node+'</div>');
      used.add(occ.id);
    }

    const paragraphs=(m.v8.paragraphs||[]).map(text=>'<p>'+esc(text)+'</p>').join('');
    const entities=units.length?'<div class="v8-entity-zone">'+units.join('')+'</div>':'';
    const transition=m.v8.transition?'<p class="bridge v8-transition"><strong>Passagem:</strong> '+esc(m.v8.transition)+'</p>':'';

    return '<article class="movement" id="' + esc(m.id) + '" data-index="' + (i+1) + '" data-sociosofia-v8="true">' +
      '<header class="movement-head"><div><p class="eyebrow">Movimento de aprendizagem</p><h3>'+esc(m.title)+'</h3><p class="question">'+esc(m.question)+'</p></div><span class="pages">Livro: p. '+esc(m.pages)+'</span></header>' +
      '<div class="movement-body"><div class="v8-reading-flow">'+paragraphs+'</div>'+entities+transition+'</div></article>';
  };

  route();
})();
</script>`;

    output = output.replace(/<\/head>/i, `${css}</head>`);
    output = output.replace(/<\/body>/i, `${behavior}</body>`);
    return output;
  };
})();
