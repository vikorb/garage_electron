import { renderLayout } from './modules/layout.js';
import { initUi, afficherToast } from './modules/ui.js';
import { initTheme } from './modules/theme.js';
import { initI18n, t } from './modules/i18n.js';
import { initMeteoPanel } from './modules/meteo.panel.js';

import {
  initGaragePage,
  afficherVoitures,
  reinitialiserFiltres
} from './modules/garage.page.js';

import {
  initVoitureModal,
  ouvrirPopupAjoutVoiture,
  ouvrirPopupModificationVoiture
} from './modules/voiture.modal.js';

import {
  initInterventionsModal,
  ouvrirPopupInterventions,
  fermerPopupInterventions
} from './modules/interventions.modal.js';

renderLayout();
initUi();
initTheme();
initMeteoPanel();

initVoitureModal({
  onSaved: afficherVoitures
});

initInterventionsModal({
  onChanged: afficherVoitures
});

initGaragePage({
  ouvrirAjoutVoiture: ouvrirPopupAjoutVoiture,
  ouvrirModificationVoiture: ouvrirPopupModificationVoiture,
  ouvrirInterventions: ouvrirPopupInterventions,
  fermerInterventions: fermerPopupInterventions
});

window.addEventListener('language-changed', async () => {
  await afficherVoitures();
});

initI18n();

const preloadStatus = document.getElementById('preload-status');

if (window.electronAPI) {
  preloadStatus.textContent = t('system.preloadOk');

  window.electronAPI.obtenirCheminBase().then((chemin) => {
    console.log('Base SQLite userData :', chemin);
  });
} else {
  preloadStatus.textContent = t('system.preloadError');
  console.error('window.electronAPI est undefined');
}

window.electronAPI.ecouterNouvelleVoitureDepuisMenu(() => {
  ouvrirPopupAjoutVoiture();
});

window.electronAPI.ecouterRechargementDepuisMenu(async () => {
  await afficherVoitures();
  afficherToast(t('toast.reload'), 'info');
});

window.electronAPI.ecouterReinitialisationFiltresDepuisMenu(() => {
  reinitialiserFiltres(true);
});

afficherVoitures();