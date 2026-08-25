(() => {
  'use strict';

  function alignApprovedLabels(root = document) {
    const dialog = root.querySelector?.('#study-materials-pilot');
    if (!dialog) return false;
    dialog.querySelectorAll('strong').forEach((label) => {
      if (label.textContent.trim() === 'Preparar-se antes da aula') label.textContent = 'Antes da aula';
    });
    return true;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (alignApprovedLabels()) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (alignApprovedLabels() || attempts >= 20) window.clearInterval(timer);
    }, 50);
  }, {once:true});

  document.addEventListener('change', (event) => {
    const dialog = event.target.closest?.('#study-materials-pilot');
    if (!dialog) return;

    if (event.target.name === 'stage') {
      dialog.querySelectorAll('[data-stage-panel]').forEach((panel) => { panel.hidden = true; });
      const panel = event.target.closest('.study-path-item')?.querySelector('[data-stage-panel]');
      if (panel) panel.hidden = false;
    }

    if (event.target.name === 'chapter') {
      dialog.querySelectorAll('[data-chapter-panel]').forEach((panel) => { panel.hidden = true; });
      const panel = event.target.closest('.study-path-item')?.querySelector('[data-chapter-panel]');
      if (panel) panel.hidden = false;
    }
  });
})();
