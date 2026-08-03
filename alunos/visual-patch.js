(() => {
  const STYLESHEET_PATHS = [
    "/alunos/student-identity-v1.css",
    "/alunos/student-identity-v1-refinements.css"
  ];

  window.applySociosofiaStudentIdentity = function applySociosofiaStudentIdentity(page) {
    if (typeof page !== "string" || page.includes("data-sociosofia-student-identity")) {
      return page;
    }

    const closingHead = /<\/head>/i;
    if (!closingHead.test(page)) {
      console.warn("Sociosofia: identidade visual não aplicada porque a página não contém </head>.");
      return page;
    }

    const links = STYLESHEET_PATHS.map((path, index) => {
      const stylesheetUrl = new URL(path, window.location.origin).href;
      return `<link rel="stylesheet" href="${stylesheetUrl}" data-sociosofia-student-identity="v1-${index + 1}">`;
    }).join("");

    return page.replace(closingHead, `${links}</head>`);
  };
})();
