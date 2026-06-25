const { contextBridge, ipcRenderer } = require('electron');

function exposerEcouteurMenu(canal, callback) {
  if (typeof callback !== 'function') {
    return;
  }

  ipcRenderer.on(canal, () => {
    callback();
  });
}

function exposerEcouteurAvecPayload(canal, callback) {
  if (typeof callback !== 'function') {
    return;
  }

  ipcRenderer.on(canal, (event, payload) => {
    callback(payload);
  });
}

contextBridge.exposeInMainWorld('electronAPI', {
  test: () =>
    'preload OK',

  obtenirCheminBase: () =>
    ipcRenderer.invoke('systeme:chemin-base'),

  obtenirTheme: () =>
    ipcRenderer.invoke('theme:obtenir'),

  definirTheme: (themeSource) =>
    ipcRenderer.invoke('theme:definir', themeSource),

  ecouterThemeMisAJour: (callback) =>
    exposerEcouteurAvecPayload('theme:mis-a-jour', callback),

  confirmerAction: (options) =>
    ipcRenderer.invoke('dialog:confirmation', options),

  listerVoitures: (filtres = {}) =>
    ipcRenderer.invoke('voitures:lister', filtres),

  ajouterVoiture: (donneesVoiture) =>
    ipcRenderer.invoke('voitures:ajouter', donneesVoiture),

  supprimerVoiture: (id) =>
    ipcRenderer.invoke('voitures:supprimer', id),

  modifierVoiture: (id, donneesVoiture) =>
    ipcRenderer.invoke('voitures:modifier', id, donneesVoiture),

  listerInterventionsParVoiture: (voitureId) =>
    ipcRenderer.invoke('interventions:lister-par-voiture', voitureId),

  ajouterIntervention: (donneesIntervention) =>
    ipcRenderer.invoke('interventions:ajouter', donneesIntervention),

  modifierIntervention: (id, donneesIntervention) =>
    ipcRenderer.invoke('interventions:modifier', id, donneesIntervention),

  supprimerIntervention: (id) =>
    ipcRenderer.invoke('interventions:supprimer', id),

  calculerTotalGlobalInterventions: () =>
    ipcRenderer.invoke('interventions:total-global'),

  calculerTotauxParVoiture: () =>
    ipcRenderer.invoke('interventions:totaux-par-voiture'),

  exporterFacture: (voitureId) =>
    ipcRenderer.invoke('factures:exporter', voitureId),

  envoyerNotification: (notification) =>
    ipcRenderer.invoke('notifications:envoyer', notification),

  ecouterNouvelleVoitureDepuisMenu: (callback) =>
    exposerEcouteurMenu('menu:nouvelle-voiture', callback),

  ecouterRechargementDepuisMenu: (callback) =>
    exposerEcouteurMenu('menu:recharger', callback),

  ecouterReinitialisationFiltresDepuisMenu: (callback) =>
    exposerEcouteurMenu('menu:reinitialiser-filtres', callback),

  obtenirMeteoGarage: () =>
    ipcRenderer.invoke('meteo:garage'),

  ecouterActualisationMeteoDepuisMenu: (callback) =>
    exposerEcouteurMenu('menu:actualiser-meteo', callback),
});