import { COURSE, CHAPTERS } from './content.js';

const STORAGE_KEYS = {
  favorites: 'sociosofia:pwa:favorites',
  lastChapter: 'sociosofia:pwa:last-chapter'
};

const LEGACY_FILES = ['page-01.b64', 'page-02.b64', 'page-03.b64', 'page-04.b64'];
const state = {
  query: '',
  favoritesOnly: false,
  favorites: new Set(readJson(STORAGE_KEYS.favorites, [])),
  annualHtml: null,
  annualDocument: null,
  installPrompt: null,
  activeChapter: null
};

const stagesContainer = document.getElementById('stages');
const emptyState = document.getElementById('empty-state');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const favoritesFilter = document.getElementById('favorites-filter');
const continueCard = document.getElementById('continue-card');
const continueTitle = document.getElementById('continue-title');
const continuePages = document.getElementById('continue-pages');
const continueButton = document.getElementById('continue-button');
const installButton = document.getElementById('install-button');
const reader = document.getElementById('reader');
const readerTitle = document.getElementById('reader-title');
const readerStage = document.getElementById('reader-stage');
const readerMeta = document.getElementById('reader-meta');
const readerStatus = document.getElementById('reader-status');
const readerFrame = document.getElementById('reader-frame');
const readerFavorite = document.getElementById('reader-favorite');
const legacyLink = document.getElementById('legacy-link');
const connectionStatus = document.getElementById('connection-status');

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normalize(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function chapterMatches(chapter) {
  if (state.favoritesOnly && !state.favorites.has(chapter.id)) return false;
  if (!state.query) return true;
  const haystack = normalize(`${chapter.title} ${chapter.pages} ${chapter.stageName}`);
  return haystack.includes(normalize(state.query));
}

function render() {
  let totalVisible = 0;
  stagesContainer.innerHTML = COURSE.stages.map((stage) => {
    const chapters = stage.chapters
      .map((chapter) => ({ ...chapter, stageId: stage.id, stageName: stage.name }))
      .filter(chapterMatches);
    totalVisible += chapters.length;
    if (!chapters.length) return '';
    return `
      <section class="stage" aria-labelledby="${stage.id}-title">
        <header class="stage-heading">
          <div>
            <p class="eyebrow">${stage.name}</p>
            <h2 id="${stage.id}-title">${stage.description}</h2>
          </div>
          <span class="stage-count">${chapters.length} capítulo${chapters.length === 1 ? '' : 's'}</span>
        </header>
        <div class="chapter-grid">
          ${chapters.map(chapterCard).join('')}
        </div>
      </section>`;
  }).join('');

  emptyState.hidden = totalVisible > 0;
  bindChapterCards();
}

function chapterCard(chapter) {
  const favorite = state.favorites.has(chapter.id);
  return `
    <article class="chapter-card">
      <button class="chapter-open" type="button" data-open-chapter="${chapter.id}" aria-label="Abrir capítulo ${chapter.id}: ${escapeHtml(chapter.title)}"></button>
      <span class="chapter-number">${String(chapter.id).padStart(2, '0')}</span>
      <div class="chapter-copy">
        <small>Páginas ${chapter.pages}</small>
        <h3>${escapeHtml(chapter.title)}</h3>
        <p>${chapter.stageName} · toque para abrir o percurso.</p>
      </div>
      <button class="card-favorite" type="button" data-favorite="${chapter.id}" aria-pressed="${favorite}" aria-label="${favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${favorite ? '★' : '☆'}</button>
    </article>`;
}

function bindChapterCards() {
  document.querySelectorAll('[data-open-chapter]').forEach((button) => {
    button.addEventListener('click', () => openChapter(Number(button.dataset.openChapter)));
  });
  document.querySelectorAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleFavorite(Number(button.dataset.favorite));
    });
  });
}

function toggleFavorite(chapterId) {
  if (state.favorites.has(chapterId)) state.favorites.delete(chapterId);
  else state.favorites.add(chapterId);
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([...state.favorites]));
  updateReaderFavorite();
  render();
}

function updateReaderFavorite() {
  if (!state.activeChapter) return;
  const favorite = state.favorites.has(state.activeChapter.id);
  readerFavorite.setAttribute('aria-pressed', String(favorite));
  readerFavorite.textContent = favorite ? '★ Favorito' : '☆ Favoritar';
}

function updateContinueCard() {
  const id = Number(localStorage.getItem(STORAGE_KEYS.lastChapter));
  const chapter = CHAPTERS.find((item) => item.id === id);
  if (!chapter) {
    continueCard.hidden = true;
    return;
  }
  continueTitle.textContent = `Capítulo ${chapter.id} · ${chapter.title}`;
  continuePages.textContent = `${chapter.stageName} · páginas ${chapter.pages}`;
  continueButton.onclick = () => openChapter(chapter.id);
  continueCard.hidden = false;
}

async function loadAnnualPage() {
  if (state.annualHtml) return state.annualHtml;
  if (!('DecompressionStream' in window)) {
    throw new Error('Este navegador não oferece o recurso necessário para abrir o material integrado.');
  }

  const parts = await Promise.all(LEGACY_FILES.map(async (filename) => {
    const response = await fetch(`${COURSE.sourcePath}${filename}`);
    if (!response.ok) throw new Error(`Falha ao carregar ${filename}.`);
    return (await response.text()).trim();
  }));

  const raw = atob(parts.join(''));
  const bytes = Uint8Array.from(raw, (character) => character.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const html = await new Response(stream).text();
  state.annualHtml = html;
  state.annualDocument = new DOMParser().parseFromString(html, 'text/html');
  return html;
}

function prepareSrcdoc(html, chapterId) {
  const base = `<base href="${location.origin}${COURSE.sourcePath}">`;
  const bridgeStyle = `
    <style>
      html { scroll-behavior: smooth; }
      body { padding-bottom: 80px !important; }
      .app-bridge-note { position: sticky; top: 0; z-index: 9999; padding: 9px 14px; background: #F2C14E; color: #1F1F1F; font: 700 13px Inter, system-ui, sans-serif; border-bottom: 1px solid rgba(31,31,31,.16); }
    </style>`;
  const bridgeScript = `<script>
    addEventListener('DOMContentLoaded', () => {
      const target = document.getElementById('capitulo-${chapterId}');
      if (target) target.scrollIntoView({ block: 'start' });
    });
  <\/script>`;
  const note = `<div class="app-bridge-note">Capítulo ${chapterId} · conteúdo anual integrado ao aplicativo</div>`;
  let output = html.includes('<head>') ? html.replace('<head>', `<head>${base}${bridgeStyle}`) : `${base}${bridgeStyle}${html}`;
  output = output.includes('<body>') ? output.replace('<body>', `<body>${note}`) : `${note}${output}`;
  return output.replace('</body>', `${bridgeScript}</body>`);
}

async function openChapter(chapterId) {
  const chapter = CHAPTERS.find((item) => item.id === chapterId);
  if (!chapter) return;

  state.activeChapter = chapter;
  localStorage.setItem(STORAGE_KEYS.lastChapter, String(chapter.id));
  updateContinueCard();

  readerTitle.textContent = chapter.title;
  readerStage.textContent = chapter.stageName;
  readerMeta.textContent = `Capítulo ${chapter.id} · páginas ${chapter.pages}`;
  legacyLink.href = `${COURSE.sourcePath}#capitulo-${chapter.id}`;
  readerStatus.textContent = 'Preparando o capítulo…';
  readerStatus.hidden = false;
  readerFrame.hidden = true;
  readerFrame.removeAttribute('src');
  readerFrame.srcdoc = '';
  updateReaderFavorite();

  if (!reader.open) reader.showModal();
  document.body.style.overflow = 'hidden';

  try {
    const html = await loadAnnualPage();
    readerFrame.onload = () => {
      try {
        const target = readerFrame.contentDocument?.getElementById(`capitulo-${chapter.id}`);
        if (target) target.scrollIntoView({ block: 'start' });
      } catch {
        // O srcdoc continua utilizável mesmo quando o navegador restringe o acesso ao documento interno.
      }
      readerStatus.hidden = true;
      readerFrame.hidden = false;
    };
    readerFrame.srcdoc = prepareSrcdoc(html, chapter.id);
  } catch (error) {
    console.error(error);
    readerStatus.innerHTML = `Não foi possível abrir o conteúdo integrado. <a href="${COURSE.sourcePath}#capitulo-${chapter.id}" target="_blank" rel="noopener">Abra a versão anual</a>.`;
  }
}

function closeReader() {
  if (reader.open) reader.close();
  document.body.style.overflow = '';
  readerFrame.srcdoc = '';
  state.activeChapter = null;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function updateConnectionStatus() {
  const online = navigator.onLine;
  connectionStatus.textContent = online
    ? 'Online · capítulos podem ser atualizados.'
    : 'Offline · usando o conteúdo guardado no aparelho.';
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  state.query = searchInput.value.trim();
  render();
});
searchInput.addEventListener('input', () => {
  state.query = searchInput.value.trim();
  render();
});
favoritesFilter.addEventListener('click', () => {
  state.favoritesOnly = !state.favoritesOnly;
  favoritesFilter.setAttribute('aria-pressed', String(state.favoritesOnly));
  favoritesFilter.textContent = state.favoritesOnly ? '★ Mostrando favoritos' : '★ Ver favoritos';
  render();
});
readerFavorite.addEventListener('click', () => {
  if (state.activeChapter) toggleFavorite(state.activeChapter.id);
});
document.getElementById('close-reader').addEventListener('click', closeReader);
reader.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeReader();
});
reader.addEventListener('click', (event) => {
  if (event.target === reader) closeReader();
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  state.installPrompt = event;
  installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
  if (!state.installPrompt) return;
  state.installPrompt.prompt();
  await state.installPrompt.userChoice;
  state.installPrompt = null;
  installButton.hidden = true;
});
window.addEventListener('appinstalled', () => {
  state.installPrompt = null;
  installButton.hidden = true;
});
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(console.error));
}

render();
updateContinueCard();
updateConnectionStatus();
loadAnnualPage().catch(() => {});
