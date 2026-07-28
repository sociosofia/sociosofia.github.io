(() => {
  const installButton = document.getElementById('install-button');
  const dialog = document.getElementById('install-disclaimer');
  const confirmButton = document.getElementById('confirm-install');
  const cancelButton = document.getElementById('cancel-install');
  const status = document.getElementById('install-status');

  if (!installButton || !dialog || !confirmButton || !cancelButton || !status) return;

  const installRequested = new URLSearchParams(window.location.search).get('install') === '1';
  let deferredPrompt = null;
  let promptResolver = null;

  function clearStatus() {
    status.hidden = true;
    status.textContent = '';
  }

  function openDisclaimer() {
    clearStatus();
    if (!dialog.open) dialog.showModal();
  }

  function waitForPrompt(timeout = 6000) {
    if (deferredPrompt) return Promise.resolve(deferredPrompt);
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => {
        promptResolver = null;
        resolve(null);
      }, timeout);
      promptResolver = (prompt) => {
        window.clearTimeout(timer);
        promptResolver = null;
        resolve(prompt);
      };
    });
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.hidden = false;
    promptResolver?.(event);
    if (installRequested) openDisclaimer();
  });

  installButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    openDisclaimer();
  }, true);

  cancelButton.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  confirmButton.addEventListener('click', async () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      status.textContent = 'O SocioSofia já está instalado neste aparelho.';
      status.hidden = false;
      return;
    }

    confirmButton.disabled = true;
    status.textContent = 'Preparando a instalação…';
    status.hidden = false;

    const prompt = deferredPrompt || await waitForPrompt();
    confirmButton.disabled = false;

    if (!prompt) {
      status.textContent = 'O navegador não ofereceu a instalação automática. Abra este endereço no Chrome e toque novamente em Instalar SocioSofia.';
      status.hidden = false;
      return;
    }

    dialog.close();
    prompt.prompt();
    await prompt.userChoice;
    deferredPrompt = null;
    installButton.hidden = true;
    window.history.replaceState({}, '', './');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installButton.hidden = true;
    if (dialog.open) dialog.close();
    window.history.replaceState({}, '', './');
  });

  if (installRequested) {
    window.setTimeout(openDisclaimer, 0);
  }
})();