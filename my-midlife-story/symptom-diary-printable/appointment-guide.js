'use strict';
(() => {
  const button = document.getElementById('copy-appointment-agenda');
  const template = document.getElementById('appointment-template');
  const status = document.getElementById('appointment-copy-status');
  button.addEventListener('click', async () => {
    const text = template.textContent;
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = 'Blank agenda copied. Paste it into a notes tool you choose and add details there.';
    } catch {
      status.textContent = 'Copy did not run. Select the blank agenda text, or use the text download.';
      template.focus();
    }
  });
})();
