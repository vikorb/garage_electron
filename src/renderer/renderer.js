import { renderLayout } from './modules/layout.js';
import { initUi, afficherToast } from './modules/ui.js';
import { initTheme } from './modules/theme.js';

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

const preloadStatus = document.getElementById('preload-status');

if (window.electronAPI) {
  preloadStatus.textContent = window.electronAPI.test();

  window.electronAPI.obtenirCheminBase().then((chemin) => {
    console.log('Base SQLite userData :', chemin);
  });
} else {
  preloadStatus.textContent = 'Erreur : window.electronAPI est undefined';
  console.error('window.electronAPI est undefined');
}

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

window.electronAPI.ecouterNouvelleVoitureDepuisMenu(() => {
  ouvrirPopupAjoutVoiture();
});

window.electronAPI.ecouterRechargementDepuisMenu(async () => {
  await afficherVoitures();
  afficherToast('Données rechargées.', 'info');
});

window.electronAPI.ecouterReinitialisationFiltresDepuisMenu(() => {
  reinitialiserFiltres(true);
});

afficherVoitures();