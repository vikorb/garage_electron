const fs = require('fs');
const path = require('path');

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification,
  shell,
  Menu
} = require('electron');

const {
  initialiserBase,
  getDatabasePath
} = require('./services/db.service');

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
  calculerTotalInterventionsGarage,
  calculerTotauxInterventionsParVoiture
} = require('./services/interventions.service');

const {
  genererFactureHtml
} = require('./services/factures.service');

let mainWindow = null;

function envoyerActionAuRenderer(canal) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.webContents.send(canal);
}

function createApplicationMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac
      ? [
          {
            role: 'appMenu'
          }
        ]
      : []),

    {
      label: 'Garage',
      submenu: [
        {
          label: 'Nouvelle voiture',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Le menu vit côté Main, donc il demande au Renderer d’ouvrir la popup.
            envoyerActionAuRenderer('menu:nouvelle-voiture');
          }
        },
        {
          label: 'Recharger les données',
          accelerator: 'F5',
          click: () => {
            envoyerActionAuRenderer('menu:recharger');
          }
        },
        {
          label: 'Réinitialiser les filtres',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: () => {
            envoyerActionAuRenderer('menu:reinitialiser-filtres');
          }
        },
        {
          type: 'separator'
        },
        ...(!isMac
          ? [
              {
                role: 'quit'
              }
            ]
          : [])
      ]
    },

    {
      role: 'editMenu'
    },

    {
      role: 'viewMenu'
    },

    {
      role: 'windowMenu'
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    title: 'Garage Manager',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),

      // Contraintes de sécurité du TP chapitre 2.
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // mainWindow.webContents.openDevTools();
}

ipcMain.handle('systeme:chemin-base', () => {
  return getDatabasePath();
});

ipcMain.handle('voitures:lister', () => {
  return listerVoitures();
});

ipcMain.handle('voitures:ajouter', (event, donneesVoiture) => {
  return ajouterVoiture(donneesVoiture);
});

ipcMain.handle('voitures:supprimer', (event, id) => {
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
  initialiserBase();
  createApplicationMenu();
  createWindow();

  console.log('Base SQLite :', getDatabasePath());
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