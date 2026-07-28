import { COURSES, DEFAULT_COURSE_ID, getCourseById, flattenChapters } from './content.js?v=14';

const COURSE_KEY='sociosofia:pwa:course';
const courseSelect=document.getElementById('course-select');
const breadcrumb=document.getElementById('course-breadcrumb');
const courseTitle=document.getElementById('course-title');
const courseDescription=document.getElementById('course-description');
const stagesContainer=document.getElementById('stages');
const emptyState=document.getElementById('empty-state');
const searchForm=document.getElementById('search-form');
const searchInput=document.getElementById('search-input');
const favoritesFilter=document.getElementById('favorites-filter');
const continueCard=document.getElementById('continue-card');
const continueTitle=document.getElementById('continue-title');
const continuePages=document.getElementById('continue-pages');
const continueButton=document.getElementById('continue-button');
const connectionStatus=document.getElementById('connection-status');

const queryCourse=new URLSearchParams(location.search).get('course');
let course=getCourseById(queryCourse||localStorage.getItem(COURSE_KEY)||DEFAULT_COURSE_ID);
let chapters=flattenChapters(course);
let query='';
let favoritesOnly=false;
let favorites=readFavorites();

function favoriteKey(){return `sociosofia:pwa:favorites:${course.id}`}
function lastKey(){return `sociosofia:pwa:last-chapter:${course.id}`}
function readFavorites(){try{return new Set(JSON.parse(localStorage.getItem(`sociosofia:pwa:favorites:${course.id}`)||'[]'))}catch{return new Set()}}
function normalize(value){return String(value).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function chapterMatches(chapter){if(favoritesOnly&&!favorites.has(chapter.id))return false;if(!query)return true;return normalize(`${chapter.title} ${chapter.pages} ${chapter.stageName}`).includes(normalize(query))}
function openChapter(id){const chapter=chapters.find(item=>item.id===id);if(!chapter)return;localStorage.setItem(lastKey(),String(id));window.location.assign(`${course.sourcePath}#capitulo-${id}`)}
function chapterCard(chapter){const favorite=favorites.has(chapter.id);return `<article class="chapter-card"><button class="chapter-open" type="button" data-open-chapter="${chapter.id}" aria-label="Abrir capítulo ${chapter.id}: ${escapeHtml(chapter.title)}"></button><span class="chapter-number">${String(chapter.id).padStart(2,'0')}</span><div class="chapter-copy"><small>Páginas ${chapter.pages}</small><h3>${escapeHtml(chapter.title)}</h3><p>${chapter.stageName} · toque para abrir o percurso.</p></div><button class="card-favorite" type="button" data-favorite="${chapter.id}" aria-pressed="${favorite}" aria-label="${favorite?'Remover dos favoritos':'Adicionar aos favoritos'}">${favorite?'★':'☆'}</button></article>`}
function renderHeader(){breadcrumb.innerHTML=`<span>${escapeHtml(course.school)}</span><span>›</span><span>${escapeHtml(course.year)}</span><span>›</span><strong>${escapeHtml(course.discipline)}</strong>`;courseTitle.textContent=course.hero;courseDescription.textContent=course.description;document.title=`SocioSofia Alunos · ${course.discipline} ${course.year}`}
function render(){let total=0;stagesContainer.innerHTML=course.stages.map(stage=>{const visible=stage.chapters.map(ch=>({...ch,stageId:stage.id,stageName:stage.name})).filter(chapterMatches);total+=visible.length;if(!visible.length)return'';return `<section class="stage" aria-labelledby="${stage.id}-title"><header class="stage-heading"><div><p class="eyebrow">${stage.name}</p><h2 id="${stage.id}-title">${escapeHtml(stage.description)}</h2></div><span class="stage-count">${visible.length} capítulo${visible.length===1?'':'s'}</span></header><div class="chapter-grid">${visible.map(chapterCard).join('')}</div></section>`}).join('');emptyState.hidden=total>0;document.querySelectorAll('[data-open-chapter]').forEach(btn=>btn.addEventListener('click',()=>openChapter(Number(btn.dataset.openChapter))));document.querySelectorAll('[data-favorite]').forEach(btn=>btn.addEventListener('click',event=>{event.stopPropagation();const id=Number(btn.dataset.favorite);favorites.has(id)?favorites.delete(id):favorites.add(id);localStorage.setItem(favoriteKey(),JSON.stringify([...favorites]));render()}))}
function updateContinue(){const id=Number(localStorage.getItem(lastKey()));const chapter=chapters.find(item=>item.id===id);if(!chapter){continueCard.hidden=true;return}continueTitle.textContent=`Capítulo ${chapter.id} · ${chapter.title}`;continuePages.textContent=`${chapter.stageName} · páginas ${chapter.pages}`;continueButton.onclick=()=>openChapter(chapter.id);continueCard.hidden=false}
function switchCourse(id){course=getCourseById(id);chapters=flattenChapters(course);localStorage.setItem(COURSE_KEY,course.id);favorites=readFavorites();query='';favoritesOnly=false;searchInput.value='';favoritesFilter.setAttribute('aria-pressed','false');favoritesFilter.textContent='★ Ver favoritos';renderHeader();render();updateContinue();history.replaceState(null,'',`?course=${encodeURIComponent(course.id)}`)}
function populateCourses(){courseSelect.innerHTML=COURSES.map(item=>`<option value="${item.id}">${escapeHtml(item.school)} · ${escapeHtml(item.year)} · ${escapeHtml(item.discipline)}</option>`).join('');courseSelect.value=course.id;courseSelect.addEventListener('change',()=>switchCourse(courseSelect.value))}
function updateConnectionStatus(){connectionStatus.textContent=navigator.onLine?'Online · capítulos podem ser atualizados.':'Offline · abra os capítulos já visitados pelo histórico do navegador.'}
searchForm.addEventListener('submit',event=>{event.preventDefault();query=searchInput.value.trim();render()});searchInput.addEventListener('input',()=>{query=searchInput.value.trim();render()});favoritesFilter.addEventListener('click',()=>{favoritesOnly=!favoritesOnly;favoritesFilter.setAttribute('aria-pressed',String(favoritesOnly));favoritesFilter.textContent=favoritesOnly?'★ Mostrando favoritos':'★ Ver favoritos';render()});window.addEventListener('online',updateConnectionStatus);window.addEventListener('offline',updateConnectionStatus);if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(console.error));
populateCourses();renderHeader();render();updateContinue();updateConnectionStatus();
