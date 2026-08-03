(() => {
  const STYLESHEET_PATH = "/alunos/student-identity-v1.css";

  window.applySociosofiaStudentIdentity = function applySociosofiaStudentIdentity(page) {
    if (typeof page !== "string" || page.includes("student-identity-v1.css")) {
      return page;
    }

    const closingHead = /<\/head>/i;
    if (!closingHead.test(page)) {
      console.warn("Sociosofia: identidade visual não aplicada porque a página não contém </head>.");
      return page;
    }

    const stylesheetUrl = new URL(STYLESHEET_PATH, window.location.origin).href;
    const link = `<link rel="stylesheet" href="${stylesheetUrl}" data-sociosofia-student-identity="v1">`;

    return page.replace(closingHead, `${link}</head>`);
  };
})();
