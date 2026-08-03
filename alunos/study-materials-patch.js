(() => {
  const STYLESHEET_PATH = '/alunos/study-materials-pilot.css';
  const SCRIPT_PATH = '/alunos/study-materials-pilot.js';

  window.applySociosofiaStudyMaterialsPilot = function applySociosofiaStudyMaterialsPilot(page) {
    if (typeof page !== 'string' || page.includes('data-sociosofia-study-materials')) return page;
    const closingHead = /<\/head>/i;
    if (!closingHead.test(page)) return page;
    const stylesheetUrl = new URL(STYLESHEET_PATH, window.location.origin).href;
    const scriptUrl = new URL(SCRIPT_PATH, window.location.origin).href;
    const assets = `<link rel="stylesheet" href="${stylesheetUrl}" data-sociosofia-study-materials="pilot-css"><script defer src="${scriptUrl}" data-sociosofia-study-materials="pilot-js"></script>`;
    return page.replace(closingHead, `${assets}</head>`);
  };
})();
