import { COURSE, CHAPTERS } from './content.js';

const STORAGE_KEY = 'sociosofia:pwa:last-chapter';

function openAnnualChapter(chapterId) {
  const chapter = CHAPTERS.find((item) => item.id === chapterId);
  if (!chapter) return;

  localStorage.setItem(STORAGE_KEY, String(chapter.id));
  window.location.assign(`${COURSE.sourcePath}#capitulo-${chapter.id}`);
}

document.addEventListener('click', (event) => {
  const chapterButton = event.target.closest('[data-open-chapter]');
  if (chapterButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    openAnnualChapter(Number(chapterButton.dataset.openChapter));
    return;
  }

  const continueButton = event.target.closest('#continue-button');
  if (continueButton) {
    const chapterId = Number(localStorage.getItem(STORAGE_KEY));
    if (!chapterId) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    openAnnualChapter(chapterId);
  }
}, true);
