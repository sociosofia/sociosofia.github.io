(() => {
  'use strict';

  const PILOT_SUBJECT = 'Sociologia';
  const PILOT_YEAR = '2º ano';
  const ROOT_ID = 'study-materials-pilot';
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const unique = (items) => [...new Set(items.filter(Boolean))];

  function readData() {
    const node = document.getElementById('site-data');
    if (!node) return null;
    try { return JSON.parse(node.textContent); }
    catch (error) { console.error('Sociosofia: não foi possível ler a base canônica para o piloto de materiais.', error); return null; }
  }

  const chaptersForStage = (data, stage) => data.chapters.filter((chapter) => chapter.stage === stage);
  const occurrenceFor = (entity, chapterNumber) => entity?.occurrences?.[String(chapterNumber)] || null;
  const selectedMovements = (selection, chapter) => selection.movementsByChapter.get(chapter.number) || chapter.movements;

  function entitiesForSelection(data, selection) {
    const references = [];
    for (const chapter of selection.chapters) for (const movement of selectedMovements(selection, chapter)) references.push(...(movement.cards || []));
    return unique(references).map((id) => data.entities[id]).filter(Boolean);
  }

  function describeSelection(selection) {
    if (selection.scope === 'stage') return selection.all ? `${selection.stage} · todos os capítulos` : `${selection.stage} · capítulos ${selection.chapters.map((c) => c.number).join(', ')}`;
    const chapter = selection.chapters[0];
    if (selection.all) return `Capítulo ${chapter.number} · capítulo completo`;
    const movements = selectedMovements(selection, chapter);
    return `Capítulo ${chapter.number} · movimentos ${movements.map((movement) => chapter.movements.indexOf(movement) + 1).join(', ')}`;
  }

  function selectedPages(selection) {
    const values = [];
    for (const chapter of selection.chapters) {
      const movements = selectedMovements(selection, chapter);
      if (movements.length !== chapter.movements.length) values.push(...movements.map((movement) => `Cap. ${chapter.number}, p. ${movement.pages}`));
      else values.push(`Cap. ${chapter.number}, p. ${chapter.pages}`);
    }
    return values.join(' · ');
  }

  function renderEntityList(data, selection, limit = 12) {
    const entities = entitiesForSelection(data, selection).slice(0, limit);
    if (!entities.length) return '';
    return `<div class="study-material-entities">${entities.map((entity) => {
      const occurrence = selection.chapters.map((chapter) => occurrenceFor(entity, chapter.number)).find(Boolean);
      const detail = occurrence?.chapter_use || entity.short || entity.lead || '';
      return `<article class="study-material-entity"><span>${escapeHtml(entity.type || 'Ficha')}</span><h4>${escapeHtml(entity.title)}</h4><p>${escapeHtml(detail)}</p></article>`;
    }).join('')}</div>`;
  }

  function materialHeader(data, selection, typeLabel, intro) {
    return `<header class="study-material-header"><p class="study-material-kicker">Sociosofia · ${escapeHtml(typeLabel)}</p><h1>${escapeHtml(data.meta.subject)} · ${escapeHtml(data.meta.year)}</h1><p class="study-material-scope">${escapeHtml(describeSelection(selection))}</p><p>${escapeHtml(intro)}</p><dl class="study-material-meta"><div><dt>Referência</dt><dd>${escapeHtml(selectedPages(selection))}</dd></div><div><dt>Material</dt><dd>${escapeHtml(data.meta.edition)}</dd></div></dl><p class="study-material-note">Este material organiza o percurso do Sociosofia para seu estudo. Ele não substitui a leitura do livro nem cria conteúdos fora do recorte selecionado.</p></header>`;
  }

  function renderPreClass(data, selection) {
    const body = selection.chapters.map((chapter) => {
      const movements = selectedMovements(selection, chapter);
      return `<section class="study-material-section"><p class="study-material-section-label">Capítulo ${chapter.number} · páginas ${escapeHtml(chapter.pages)}</p><h2>${escapeHtml(chapter.title)}</h2><p class="study-material-lead">${escapeHtml(chapter.lead)}</p><div class="study-material-callout"><h3>Antes de começar, pense</h3><ul>${movements.map((movement) => `<li>${escapeHtml(movement.question)}</li>`).join('')}</ul></div><h3>O caminho deste recorte</h3><ol class="study-material-movements">${movements.map((movement) => `<li><span>Movimento ${chapter.movements.indexOf(movement) + 1}</span><strong>${escapeHtml(movement.title)}</strong><p>${escapeHtml(movement.text)}</p><small>No livro · páginas ${escapeHtml(movement.pages)}</small></li>`).join('')}</ol><div class="study-material-check"><strong>Ao terminar a leitura, tente explicar:</strong><p>${escapeHtml(chapter.summary)}</p></div></section>`;
    }).join('');
    return `${materialHeader(data, selection, 'Antes da aula', 'Leia este material para chegar à aula conhecendo as perguntas, as ideias e o caminho principal do conteúdo.')}${body}<section class="study-material-section"><h2>Ideias e autores que vão aparecer</h2>${renderEntityList(data, selection)}</section>`;
  }

  function renderReview(data, selection) {
    const body = selection.chapters.map((chapter) => {
      const movements = selectedMovements(selection, chapter);
      return `<section class="study-material-section"><p class="study-material-section-label">Capítulo ${chapter.number} · ${escapeHtml(chapter.stage)}</p><h2>${escapeHtml(chapter.title)}</h2><p class="study-material-lead">${escapeHtml(chapter.summary)}</p><div class="study-review-grid">${movements.map((movement) => `<article class="study-review-card"><span>Movimento ${chapter.movements.indexOf(movement) + 1} · p. ${escapeHtml(movement.pages)}</span><h3>${escapeHtml(movement.title)}</h3><p><strong>Pergunta central:</strong> ${escapeHtml(movement.question)}</p><p>${escapeHtml(movement.text)}</p><p class="study-review-shift"><strong>O que precisa mudar no seu olhar:</strong> ${escapeHtml(movement.shift)}</p></article>`).join('')}</div><div class="study-material-check"><strong>Teste sua revisão</strong><ul>${movements.map((movement) => `<li>Consigo responder: “${escapeHtml(movement.question)}”</li>`).join('')}</ul></div></section>`;
    }).join('');
    const distinctions = entitiesForSelection(data, selection).map((entity) => {
      const occurrence = selection.chapters.map((chapter) => occurrenceFor(entity, chapter.number)).find((item) => item?.confusion);
      return occurrence ? {entity, confusion: occurrence.confusion} : null;
    }).filter(Boolean).slice(0, 8);
    return `${materialHeader(data, selection, 'Revisão para a prova', 'Retome os movimentos, organize os conceitos e verifique o que você já consegue explicar sem consultar o percurso.')}${body}<section class="study-material-section"><h2>Conceitos, autores e repertórios do recorte</h2>${renderEntityList(data, selection)}</section>${distinctions.length ? `<section class="study-material-section"><h2>Não confunda</h2><div class="study-confusions">${distinctions.map(({entity, confusion}) => `<article><h3>${escapeHtml(entity.title)}</h3><p>${escapeHtml(confusion)}</p></article>`).join('')}</div></section>` : ''}`;
  }

  function renderExercises(data, selection) {
    const comprehension = [];
    const application = [];
    const criteria = [];
    for (const chapter of selection.chapters) for (const movement of selectedMovements(selection, chapter)) {
      comprehension.push(`Explique com suas palavras: ${movement.question}`);
      criteria.push(`A resposta sobre “${movement.title}” deve considerar: ${movement.shift}`);
    }
    for (const entity of entitiesForSelection(data, selection)) {
      const occurrence = selection.chapters.map((chapter) => occurrenceFor(entity, chapter.number)).find(Boolean);
      if (occurrence?.confusion && application.length < 4) application.push(`A ficha de ${entity.title} faz o seguinte alerta: “${occurrence.confusion}” Explique por que essa distinção é importante.`);
      else if (occurrence?.example && application.length < 4) application.push(`Leia o exemplo relacionado a ${entity.title}: “${occurrence.example}” Crie outro exemplo que preserve a mesma ideia.`);
    }
    const synthesis = selection.chapters.map((chapter) => chapter.review_text).filter(Boolean);
    const questions = [...comprehension.slice(0, 8), ...application.slice(0, 4), ...synthesis.slice(0, 3)];
    return `${materialHeader(data, selection, 'Lista de exercícios', 'Use as questões para treinar compreensão, aplicação e argumentação. Responda primeiro sem consultar as fichas; depois volte ao percurso para conferir.')}<section class="study-material-section"><h2>Questões</h2><ol class="study-exercise-list">${questions.map((question) => `<li><p>${escapeHtml(question)}</p><div class="study-answer-space" aria-hidden="true"></div></li>`).join('')}</ol></section><section class="study-material-section"><details class="study-answer-guide"><summary>Conferir critérios para revisar suas respostas</summary><p>Estes critérios não são respostas prontas. Use-os somente depois de tentar resolver as questões.</p><ul>${unique(criteria).slice(0, 10).map((criterion) => `<li>${escapeHtml(criterion)}</li>`).join('')}</ul></details></section>`;
  }

  function generateMaterial(data, selection, type) {
    if (type === 'pre_aula') return renderPreClass(data, selection);
    if (type === 'revisao_prova') return renderReview(data, selection);
    return renderExercises(data, selection);
  }

  function createSelectionFromForm(data, form) {
    const scope = form.elements.scope.value;
    const type = form.elements.materialType.value;
    if (!scope || !type) throw new Error('Escolha o recorte e o tipo de material.');
    if (scope === 'stage') {
      const stage = form.elements.stage.value;
      const mode = form.elements.stageMode.value;
      if (!stage || !mode) throw new Error('Escolha a etapa e como deseja usar seus capítulos.');
      const available = chaptersForStage(data, stage);
      const selectedNumbers = new Set(new FormData(form).getAll('stageChapters').map(Number));
      const chapters = mode === 'all' ? available : available.filter((chapter) => selectedNumbers.has(chapter.number));
      if (!chapters.length) throw new Error('Selecione pelo menos um capítulo da etapa.');
      return {scope, type, stage, all: mode === 'all', chapters, movementsByChapter: new Map()};
    }
    const chapterNumber = Number(form.elements.chapter.value);
    const mode = form.elements.chapterMode.value;
    const chapter = data.chapters.find((item) => item.number === chapterNumber);
    if (!chapter || !mode) throw new Error('Escolha o capítulo e como deseja usar seus movimentos.');
    const selectedIds = new Set(new FormData(form).getAll('chapterMovements'));
    const movements = mode === 'all' ? chapter.movements : chapter.movements.filter((movement) => selectedIds.has(movement.id));
    if (!movements.length) throw new Error('Selecione pelo menos um movimento do capítulo.');
    return {scope, type, all: mode === 'all', chapters: [chapter], movementsByChapter: new Map([[chapter.number, movements]])};
  }

  function renderStageChapterOptions(data, stage, container) {
    container.innerHTML = chaptersForStage(data, stage).map((chapter) => `<label class="study-check-card"><input type="checkbox" name="stageChapters" value="${chapter.number}"><span><strong>Capítulo ${chapter.number}</strong>${escapeHtml(chapter.title)}<small>páginas ${escapeHtml(chapter.pages)}</small></span></label>`).join('');
  }

  function renderMovementOptions(data, chapterNumber, container) {
    const chapter = data.chapters.find((item) => item.number === Number(chapterNumber));
    container.innerHTML = chapter ? chapter.movements.map((movement, index) => `<label class="study-check-card"><input type="checkbox" name="chapterMovements" value="${escapeHtml(movement.id)}"><span><strong>Movimento ${index + 1}</strong>${escapeHtml(movement.title)}<small>páginas ${escapeHtml(movement.pages)}</small></span></label>`).join('') : '';
  }

  function buildDialog(data) {
    const dialog = document.createElement('dialog');
    dialog.id = ROOT_ID;
    dialog.className = 'study-dialog';
    dialog.setAttribute('aria-labelledby', 'study-dialog-title');
    dialog.innerHTML = `<div class="study-dialog-shell"><header class="study-dialog-head"><div><p>Sociosofia · piloto</p><h2 id="study-dialog-title">Criar material de estudo</h2></div><button type="button" class="study-close" aria-label="Fechar">×</button></header><div class="study-dialog-body"><form id="study-material-form" class="study-builder"><section class="study-step"><span class="study-step-number">1</span><div><h3>Escolha o recorte</h3><p>Os limites preservam o percurso: capítulos da mesma etapa ou movimentos do mesmo capítulo.</p></div></section><div class="study-choice-grid"><label class="study-radio-card"><input type="radio" name="scope" value="stage"><span><strong>Etapa</strong><small>Todos ou alguns capítulos da mesma etapa</small></span></label><label class="study-radio-card"><input type="radio" name="scope" value="chapter"><span><strong>Capítulo</strong><small>Capítulo completo ou alguns de seus movimentos</small></span></label></div><section id="study-stage-controls" class="study-subcontrols" hidden><label>Etapa<select name="stage"><option value="">Selecione</option>${Object.keys(data.stages).map((stage) => `<option value="${escapeHtml(stage)}">${escapeHtml(stage)} · ${escapeHtml(data.stages[stage].title)}</option>`).join('')}</select></label><div class="study-choice-grid compact"><label class="study-radio-card"><input type="radio" name="stageMode" value="all"><span><strong>Todos os capítulos</strong><small>Revisão da etapa inteira</small></span></label><label class="study-radio-card"><input type="radio" name="stageMode" value="selected"><span><strong>Capítulos selecionados</strong><small>Somente dentro desta etapa</small></span></label></div><div id="study-stage-chapters" class="study-check-grid" hidden></div></section><section id="study-chapter-controls" class="study-subcontrols" hidden><label>Capítulo<select name="chapter"><option value="">Selecione</option>${data.chapters.map((chapter) => `<option value="${chapter.number}">Capítulo ${chapter.number} · ${escapeHtml(chapter.title)}</option>`).join('')}</select></label><div class="study-choice-grid compact"><label class="study-radio-card"><input type="radio" name="chapterMode" value="all"><span><strong>Todo o capítulo</strong><small>Todos os movimentos na ordem original</small></span></label><label class="study-radio-card"><input type="radio" name="chapterMode" value="selected"><span><strong>Movimentos selecionados</strong><small>Somente deste capítulo</small></span></label></div><div id="study-chapter-movements" class="study-check-grid" hidden></div></section><section class="study-step"><span class="study-step-number">2</span><div><h3>O que você quer fazer?</h3><p>Todo material fala diretamente com você, estudante.</p></div></section><div class="study-material-types"><label class="study-radio-card purpose"><input type="radio" name="materialType" value="pre_aula"><span><strong>Preparar-se antes da aula</strong><small>Conhecer as perguntas e ideias principais</small></span></label><label class="study-radio-card purpose"><input type="radio" name="materialType" value="revisao_prova"><span><strong>Revisar para uma prova</strong><small>Retomar conceitos, relações e distinções</small></span></label><label class="study-radio-card purpose"><input type="radio" name="materialType" value="lista_exercicios"><span><strong>Treinar com exercícios</strong><small>Praticar compreensão, aplicação e argumentação</small></span></label></div><p id="study-form-error" class="study-form-error" role="alert" hidden></p><button type="submit" class="study-generate">Gerar material</button></form><section id="study-material-result" class="study-result" hidden><div class="study-result-actions"><button type="button" id="study-edit-selection">Alterar seleção</button><button type="button" id="study-print-material" class="primary">Imprimir ou salvar em PDF</button></div><article id="study-material-document" class="study-document"></article></section></div></div>`;
    document.body.append(dialog);
    return dialog;
  }

  function bindDialog(data, dialog) {
    const form = dialog.querySelector('#study-material-form');
    const result = dialog.querySelector('#study-material-result');
    const documentNode = dialog.querySelector('#study-material-document');
    const errorNode = dialog.querySelector('#study-form-error');
    const stageControls = dialog.querySelector('#study-stage-controls');
    const chapterControls = dialog.querySelector('#study-chapter-controls');
    const stageChapters = dialog.querySelector('#study-stage-chapters');
    const chapterMovements = dialog.querySelector('#study-chapter-movements');
    dialog.querySelector('.study-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    form.addEventListener('change', (event) => {
      if (event.target.name === 'scope') { stageControls.hidden = event.target.value !== 'stage'; chapterControls.hidden = event.target.value !== 'chapter'; }
      if (event.target.name === 'stage') renderStageChapterOptions(data, event.target.value, stageChapters);
      if (event.target.name === 'stageMode') stageChapters.hidden = event.target.value !== 'selected';
      if (event.target.name === 'chapter') renderMovementOptions(data, event.target.value, chapterMovements);
      if (event.target.name === 'chapterMode') chapterMovements.hidden = event.target.value !== 'selected';
      errorNode.hidden = true;
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      try {
        const selection = createSelectionFromForm(data, form);
        documentNode.innerHTML = generateMaterial(data, selection, selection.type);
        form.hidden = true; result.hidden = false; errorNode.hidden = true;
        dialog.querySelector('#study-edit-selection').focus();
      } catch (error) { errorNode.textContent = error.message; errorNode.hidden = false; }
    });
    dialog.querySelector('#study-edit-selection').addEventListener('click', () => { result.hidden = true; form.hidden = false; form.querySelector('input[name="scope"]')?.focus(); });
    dialog.querySelector('#study-print-material').addEventListener('click', () => window.print());
  }

  function addLaunchButton(dialog) {
    const actions = document.querySelector('.header-actions');
    if (!actions || document.getElementById('study-materials-launch')) return;
    const button = document.createElement('button');
    button.id = 'study-materials-launch'; button.type = 'button'; button.className = 'header-btn study-launch'; button.textContent = 'Criar material';
    button.addEventListener('click', () => dialog.showModal());
    actions.prepend(button);
  }

  function init() {
    const data = readData();
    if (!data || data.meta?.subject !== PILOT_SUBJECT || data.meta?.year !== PILOT_YEAR) return;
    const dialog = buildDialog(data); bindDialog(data, dialog); addLaunchButton(dialog);
    document.documentElement.dataset.studyMaterialsPilot = 'active';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
