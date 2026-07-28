import { COURSE, CHAPTERS } from './content.js';

const STORAGE_KEY = 'sociosofia:pwa:last-chapter';
const continueButton = document.getElementById('continue-button');

if (continueButton) {
  continueButton.addEventListener('click', (event) => {
    const chapterId = Number(localStorage.getItem(STORAGE_KEY));
    const chapter = CHAPTERS.find((item) => item.id === chapterId);
    if (!chapter) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(`${COURSE.sourcePath}#capitulo-${chapter.id}`);
  }, true);
}
