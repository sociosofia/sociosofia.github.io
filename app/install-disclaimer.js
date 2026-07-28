(() => {
  const installButton = document.getElementById('install-button');
  const dialog = document.getElementById('install-disclaimer');
  const confirmButton = document.getElementById('confirm-install');
  const cancelButton = document.getElementById('cancel-install');
  const status = document.getElementById('install-status');

  if (!installButton || !dialog || !confirmButton || !cancelButton || !status) return;

  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    status.hidden = true;
    status.textContent = '';
    dialog.showModal();
  }, true);

  cancelButton.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  confirmButton.addEventListener('click', async () => {
    if (!deferredPrompt) {
      status.textContent = 'A instalação não está disponível neste navegador neste momento.';
      status.hidden = false;
      return;
    }

    dialog.close();
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installButton.hidden = true;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installButton.hidden = true;
    if (dialog.open) dialog.close();
  });
})();
