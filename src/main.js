const fs = require('fs');
const path = require('path');

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification
} = require('electron');

const {
  listerVoitures,
  ajouterVoiture,
  supprimerVoiture,
  modifierVoiture
} = require('./services/voitures.service');

const {
  listerInterventionsParVoiture,
  ajouterIntervention,
  modifierIntervention,
  supprimerIntervention,
  supprimerInterventionsParVoiture,
  calculerTotalInterventionsGarage,
  calculerTotauxInterventionsParVoiture
} = require('./services/interventions.service');

const {
  genererFactureHtml
} = require('./services/factures.service');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 850,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // win.webContents.openDevTools();
}

ipcMain.handle('voitures:lister', () => {
  return listerVoitures();
});

ipcMain.handle('voitures:ajouter', (event, donneesVoiture) => {
  return ajouterVoiture(donneesVoiture);
});

ipcMain.handle('voitures:supprimer', (event, id) => {
  supprimerInterventionsParVoiture(id);
  return supprimerVoiture(id);
});

ipcMain.handle('voitures:modifier', (event, id, donneesVoiture) => {
  return modifierVoiture(id, donneesVoiture);
});

ipcMain.handle('interventions:lister-par-voiture', (event, voitureId) => {
  return listerInterventionsParVoiture(voitureId);
});

ipcMain.handle('interventions:ajouter', (event, donneesIntervention) => {
  return ajouterIntervention(donneesIntervention);
});

ipcMain.handle('interventions:modifier', (event, id, donneesIntervention) => {
  return modifierIntervention(id, donneesIntervention);
});

ipcMain.handle('interventions:supprimer', (event, id) => {
  return supprimerIntervention(id);
});

ipcMain.handle('interventions:total-global', () => {
  return calculerTotalInterventionsGarage();
});

ipcMain.handle('interventions:totaux-par-voiture', () => {
  return calculerTotauxInterventionsParVoiture();
});

ipcMain.handle('factures:exporter', async (event, voitureId) => {
  const facture = genererFactureHtml(voitureId);

  const browserWindow = BrowserWindow.fromWebContents(event.sender);

  const resultat = await dialog.showSaveDialog(browserWindow, {
    title: 'Exporter la facture',
    defaultPath: path.join(app.getPath('documents'), facture.nomFichier),
    filters: [
      {
        name: 'Fichier HTML',
        extensions: ['html']
      }
    ]
  });

  if (resultat.canceled || !resultat.filePath) {
    return {
      success: false,
      canceled: true
    };
  }

  fs.writeFileSync(resultat.filePath, facture.html, 'utf-8');

  return {
    success: true,
    canceled: false,
    filePath: resultat.filePath
  };
});

ipcMain.handle('notifications:envoyer', (event, notification) => {
  if (!Notification.isSupported()) {
    return {
      success: false,
      reason: 'Notifications non supportées.'
    };
  }

  const title = notification?.title || 'Garage Manager';
  const body = notification?.body || '';

  new Notification({
    title,
    body
  }).show();

  return {
    success: true
  };
});

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});