const fs = require('fs');
const path = require('path');

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification,
  shell,
  Menu,
  nativeTheme,
  Tray,
  nativeImage
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

const {
  recupererMeteoGarage
} = require('./services/meteo.service');

let mainWindow = null;
let tray = null;
let isQuitting = false;

function getIconPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'icon.png');
  }

  return path.join(__dirname, '..', 'build', 'icon.png');
}

function getTrayImage() {
  const image = nativeImage.createFromPath(getIconPath());

  if (image.isEmpty()) {
    console.warn('Icône Tray introuvable, icône vide utilisée.');
    return nativeImage.createEmpty();
  }

  const size = process.platform === 'darwin' ? 18 : 22;

  return image.resize({
    width: size,
    height: size
  });
}

function getThemePreferencesPath() {
  return path.join(app.getPath('userData'), 'theme-preferences.json');
}

function lireThemeSauvegarde() {
  const themesAutorises = ['system', 'light', 'dark'];

  try {
    const chemin = getThemePreferencesPath();

    if (!fs.existsSync(chemin)) {
      return 'system';
    }

    const contenu = fs.readFileSync(chemin, 'utf-8');
    const preferences = JSON.parse(contenu);

    if (themesAutorises.includes(preferences.themeSource)) {
      return preferences.themeSource;
    }

    return 'system';
  } catch (error) {
    console.warn('Impossible de lire le thème sauvegardé :', error);
    return 'system';
  }
}

function sauvegarderTheme(themeSource) {
  try {
    const chemin = getThemePreferencesPath();

    fs.mkdirSync(path.dirname(chemin), {
      recursive: true
    });

    fs.writeFileSync(
      chemin,
      JSON.stringify(
        {
          themeSource,
          updated_at: new Date().toISOString()
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch (error) {
    console.warn('Impossible de sauvegarder le thème :', error);
  }
}

function initialiserThemeDepuisCache() {
  nativeTheme.themeSource = lireThemeSauvegarde();
}

function obtenirThemeCourant() {
  return {
    themeSource: nativeTheme.themeSource,
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors
  };
}

function envoyerThemeAuRenderer() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.webContents.send('theme:mis-a-jour', obtenirThemeCourant());
}

function mettreAJourTrayMenu() {
  if (!tray || tray.isDestroyed()) {
    return;
  }

  tray.setContextMenu(createTrayContextMenu());
}

function definirThemeSource(themeSource) {
  const themesAutorises = ['system', 'light', 'dark'];

  if (!themesAutorises.includes(themeSource)) {
    return obtenirThemeCourant();
  }

  nativeTheme.themeSource = themeSource;
  sauvegarderTheme(themeSource);

  createApplicationMenu();
  mettreAJourTrayMenu();
  envoyerThemeAuRenderer();

  return obtenirThemeCourant();
}

function afficherFenetrePrincipale() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
  }

  if (process.platform === 'darwin' && app.dock) {
    app.dock.show();
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
}

function envoyerActionAuRenderer(canal) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
  }

  afficherFenetrePrincipale();

  const envoyer = () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    mainWindow.webContents.send(canal);
  };

  if (mainWindow.webContents.isLoading()) {
    mainWindow.webContents.once('did-finish-load', envoyer);
  } else {
    envoyer();
  }
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
          label: 'Actualiser la météo',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            envoyerActionAuRenderer('menu:actualiser-meteo');
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
                label: 'Quitter',
                click: () => {
                  isQuitting = true;
                  app.quit();
                }
              }
            ]
          : [])
      ]
    },

    {
      label: 'Apparence',
      submenu: [
        {
          label: 'Suivre le système',
          type: 'radio',
          checked: nativeTheme.themeSource === 'system',
          click: () => {
            definirThemeSource('system');
          }
        },
        {
          label: 'Mode sombre',
          type: 'radio',
          checked: nativeTheme.themeSource === 'dark',
          click: () => {
            definirThemeSource('dark');
          }
        },
        {
          label: 'Mode clair',
          type: 'radio',
          checked: nativeTheme.themeSource === 'light',
          click: () => {
            definirThemeSource('light');
          }
        }
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

function createTrayContextMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Garage Manager',
      click: () => {
        afficherFenetrePrincipale();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Ouvrir l’application',
      click: () => {
        afficherFenetrePrincipale();
      }
    },
    {
      label: '+ Nouvelle voiture',
      click: () => {
        envoyerActionAuRenderer('menu:nouvelle-voiture');
      }
    },
    {
      label: 'Actualiser météo',
      click: () => {
        envoyerActionAuRenderer('menu:actualiser-meteo');
      }
    },
    {
      label: 'Recharger les données',
      click: () => {
        envoyerActionAuRenderer('menu:recharger');
      }
    },
    {
      label: 'Réinitialiser les filtres',
      click: () => {
        envoyerActionAuRenderer('menu:reinitialiser-filtres');
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Apparence',
      submenu: [
        {
          label: 'Suivre le système',
          type: 'radio',
          checked: nativeTheme.themeSource === 'system',
          click: () => {
            definirThemeSource('system');
          }
        },
        {
          label: 'Mode sombre',
          type: 'radio',
          checked: nativeTheme.themeSource === 'dark',
          click: () => {
            definirThemeSource('dark');
          }
        },
        {
          label: 'Mode clair',
          type: 'radio',
          checked: nativeTheme.themeSource === 'light',
          click: () => {
            definirThemeSource('light');
          }
        }
      ]
    },
    {
      type: 'separator'
    },
    {
      label: 'Quitter',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
}

function createTray() {
  if (tray) {
    return;
  }

  tray = new Tray(getTrayImage());

  tray.setToolTip('Garage Manager');
  tray.setContextMenu(createTrayContextMenu());

  tray.on('click', () => {
    afficherFenetrePrincipale();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    title: 'Garage Manager',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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

  mainWindow.webContents.on('did-finish-load', () => {
    envoyerThemeAuRenderer();
  });

  mainWindow.on('close', (event) => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();
    mainWindow.hide();

    if (process.platform === 'darwin' && app.dock) {
      app.dock.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // mainWindow.webContents.openDevTools();
}

ipcMain.handle('systeme:chemin-base', () => {
  return getDatabasePath();
});

ipcMain.handle('theme:obtenir', () => {
  return obtenirThemeCourant();
});

ipcMain.handle('theme:definir', (event, themeSource) => {
  return definirThemeSource(themeSource);
});

ipcMain.handle('dialog:confirmation', async (event, options) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);

  const resultat = await dialog.showMessageBox(browserWindow, {
    type: 'warning',
    buttons: ['Annuler', 'Confirmer'],
    defaultId: 0,
    cancelId: 0,
    title: options?.title || 'Confirmation',
    message: options?.message || 'Voulez-vous vraiment continuer ?',
    detail: options?.detail || ''
  });

  return {
    confirmed: resultat.response === 1
  };
});

ipcMain.handle('voitures:lister', (event, filtres = {}) => {
  return listerVoitures(filtres);
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

ipcMain.handle('meteo:garage', async () => {
  return recupererMeteoGarage();
});

app.whenReady().then(() => {
  initialiserBase();
  initialiserThemeDepuisCache();
  createApplicationMenu();
  createWindow();
  createTray();

  nativeTheme.on('updated', () => {
    envoyerThemeAuRenderer();
  });

  console.log('Base SQLite :', getDatabasePath());
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  if (tray && !tray.isDestroyed()) {
    tray.destroy();
  }
});

app.on('window-all-closed', () => {
  // On ne quitte pas automatiquement : l'application reste disponible dans le Tray.
});

app.on('activate', () => {
  if (!isQuitting) {
    afficherFenetrePrincipale();
  }
});