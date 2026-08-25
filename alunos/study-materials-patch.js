(() => {
  const STYLESHEET_PATHS = [
    '/alunos/study-materials-pilot.css',
    '/alunos/study-materials-pilot-v2.css'
  ];
  const SCRIPT_PATHS = [
    '/alunos/study-materials-pilot-v2.js',
    '/alunos/study-materials-pilot-v2-fix.js'
  ];

  window.applySociosofiaStudyMaterialsPilot = function applySociosofiaStudyMaterialsPilot(page) {
    if (typeof page !== 'string' || page.includes('data-sociosofia-study-materials')) return page;
    const closingHead = /<\/head>/i;
    if (!closingHead.test(page)) return page;
    const stylesheets = STYLESHEET_PATHS.map((path, index) => {
      const stylesheetUrl = new URL(path, window.location.origin).href;
      return `<link rel="stylesheet" href="${stylesheetUrl}" data-sociosofia-study-materials="pilot-css-${index + 1}">`;
    }).join('');
    const scripts = SCRIPT_PATHS.map((path, index) => {
      const scriptUrl = new URL(path, window.location.origin).href;
      return `<script defer src="${scriptUrl}" data-sociosofia-study-materials="pilot-js-${index + 1}"></script>`;
    }).join('');
    return page.replace(closingHead, `${stylesheets}${scripts}</head>`);
  };
})();
