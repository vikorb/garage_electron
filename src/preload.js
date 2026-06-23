const { contextBridge, ipcRenderer } = require('electron');

function exposerEcouteurMenu(canal, callback) {
  if (typeof callback !== 'function') {
    return;
  }

  const listener = () => {
    callback();
  };

  ipcRenderer.on(canal, listener);
}

contextBridge.exposeInMainWorld('electronAPI', {
  test: () =>
    'preload OK',

  obtenirCheminBase: () =>
    ipcRenderer.invoke('systeme:chemin-base'),

  listerVoitures: () =>
    ipcRenderer.invoke('voitures:lister'),

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
    exposerEcouteurMenu('menu:reinitialiser-filtres', callback)
});