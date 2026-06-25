export function initTheme() {
  const themeSelect = document.getElementById('theme-select');

  if (!themeSelect || !window.electronAPI) {
    return;
  }

  themeSelect.addEventListener('change', async () => {
    const theme = await window.electronAPI.definirTheme(themeSelect.value);
    appliquerTheme(theme);
  });

  window.electronAPI.obtenirTheme().then((theme) => {
    appliquerTheme(theme);
  });

  window.electronAPI.ecouterThemeMisAJour((theme) => {
    appliquerTheme(theme);
  });
}

function appliquerTheme(theme) {
  if (!theme) {
    return;
  }

  const themeSelect = document.getElementById('theme-select');

  if (themeSelect) {
    themeSelect.value = theme.themeSource;
  }

  document.body.classList.toggle('theme-light', !theme.shouldUseDarkColors);
  document.body.classList.toggle('theme-dark', theme.shouldUseDarkColors);

  document.documentElement.dataset.theme = theme.shouldUseDarkColors
    ? 'dark'
    : 'light';
}