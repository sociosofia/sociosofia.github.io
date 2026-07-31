(function () {
  'use strict';

  window.applySociosofiaAccessibilityPatch = function (source) {
    let html = String(source);

    if (!html.includes('--terra-text:')) {
      if (html.includes('--terra:#D95D39;')) {
        html = html.replace('--terra:#D95D39;', '--terra:#D95D39;--terra-text:#B34727;');
      } else if (html.includes('--terra: #D95D39;')) {
        html = html.replace('--terra: #D95D39;', '--terra: #D95D39;\n      --terra-text: #B34727;');
      }
    }

    html = html
      .replaceAll('color:var(--terra)', 'color:var(--terra-text)')
      .replaceAll('color: var(--terra)', 'color: var(--terra-text)');

    html = html.replace(
      /<aside class="drawer"([^>]*?)aria-hidden="true"([^>]*?)>/,
      function (full, before, after) {
        return full.includes(' inert')
          ? full
          : '<aside class="drawer"' + before + 'aria-hidden="true" inert' + after + '>';
      }
    );

    if (!html.includes("drawer.removeAttribute('inert');drawer.classList.add('open')")) {
      html = html.replace(
        "drawer.classList.add('open');backdrop.classList.add('open');drawer.setAttribute('aria-hidden','false');",
        "drawer.removeAttribute('inert');drawer.classList.add('open');backdrop.classList.add('open');drawer.setAttribute('aria-hidden','false');"
      );
    }

    html = html.replace(
      /function closeDrawer\(restore=true\)\{\s*drawer\.classList\.remove\('open'\);backdrop\.classList\.remove\('open'\);drawer\.setAttribute\('aria-hidden','true'\);document\.body\.style\.overflow='';\s*if\(restore&&lastFocus\)lastFocus\.focus\(\);\s*\}/,
      "function closeDrawer(restore=true){\n  if(restore&&lastFocus)lastFocus.focus();\n  drawer.classList.remove('open');backdrop.classList.remove('open');drawer.setAttribute('aria-hidden','true');drawer.setAttribute('inert','');document.body.style.overflow='';\n}"
    );

    return html;
  };
})();
