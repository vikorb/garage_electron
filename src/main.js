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
let currentLanguage = 'fr';

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

function getLanguagePreferencesPath() {
  return path.join(app.getPath('userData'), 'language-preferences.json');
}

function detecterLangueParDefaut() {
  const locale = app.getLocale ? app.getLocale().toLowerCase() : 'en';
  const countryCode =
    typeof app.getLocaleCountryCode === 'function'
      ? app.getLocaleCountryCode().toUpperCase()
      : '';

  const paysFrancophones = [
    'FR',
    'BE',
    'CH',
    'LU',
    'MC',
    'CA',
    'SN',
    'CI',
    'MA',
    'DZ',
    'TN',
    'CM',
    'CD',
    'CG',
    'GA',
    'GN',
    'ML',
    'NE',
    'BF',
    'BJ',
    'TG',
    'MG',
    'HT'
  ];

  if (locale.startsWith('fr') || paysFrancophones.includes(countryCode)) {
    return 'fr';
  }

  return 'en';
}

function lireLangueSauvegardee() {
  const languesAutorisees = ['fr', 'en'];

  try {
    const chemin = getLanguagePreferencesPath();

    if (!fs.existsSync(chemin)) {
      return detecterLangueParDefaut();
    }

    const contenu = fs.readFileSync(chemin, 'utf-8');
    const preferences = JSON.parse(contenu);

    if (languesAutorisees.includes(preferences.language)) {
      return preferences.language;
    }

    return detecterLangueParDefaut();
  } catch (error) {
    console.warn('Impossible de lire la langue sauvegardée :', error);
    return detecterLangueParDefaut();
  }
}

function sauvegarderLangue(language) {
  try {
    const chemin = getLanguagePreferencesPath();

    fs.mkdirSync(path.dirname(chemin), {
      recursive: true
    });

    fs.writeFileSync(
      chemin,
      JSON.stringify(
        {
          language,
          updated_at: new Date().toISOString()
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch (error) {
    console.warn('Impossible de sauvegarder la langue :', error);
  }
}

function initialiserLangueDepuisCache() {
  currentLanguage = lireLangueSauvegardee();
}

function obtenirLangueCourante() {
  return {
    language: currentLanguage,
    locale: app.getLocale ? app.getLocale() : null
  };
}

function envoyerLangueAuRenderer() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.webContents.send('language:mis-a-jour', obtenirLangueCourante());
}

function definirLangue(language) {
  const languesAutorisees = ['fr', 'en'];

  if (!languesAutorisees.includes(language)) {
    return obtenirLangueCourante();
  }

  currentLanguage = language;
  sauvegarderLangue(language);

  createApplicationMenu();
  mettreAJourTrayMenu();
  envoyerLangueAuRenderer();

  return obtenirLangueCourante();
}

function createApplicationMenu() {
  const isMac = process.platform === 'darwin';
  const isFr = currentLanguage === 'fr';

  const labels = {
    garage: isFr ? 'Garage' : 'Garage',
    vehicles: isFr ? 'Véhicules' : 'Vehicles',
    data: isFr ? 'Données' : 'Data',
    invoice: isFr ? 'Factures' : 'Invoices',
    tools: isFr ? 'Outils' : 'Tools',
    display: isFr ? 'Affichage' : 'Display',
    preferences: isFr ? 'Préférences' : 'Preferences',

    newCar: isFr ? 'Nouvelle voiture' : 'New car',
    reload: isFr ? 'Recharger les données' : 'Reload data',
    resetFilters: isFr ? 'Réinitialiser les filtres' : 'Reset filters',
    refreshWeather: isFr ? 'Actualiser la météo' : 'Refresh weather',

    appearance: isFr ? 'Apparence' : 'Appearance',
    systemTheme: isFr ? 'Suivre le système' : 'Follow system',
    darkTheme: isFr ? 'Mode sombre' : 'Dark mode',
    lightTheme: isFr ? 'Mode clair' : 'Light mode',

    language: isFr ? 'Langue' : 'Language',
    french: isFr ? 'Français' : 'French',
    english: isFr ? 'Anglais' : 'English',

    openApp: isFr ? 'Ouvrir l’application' : 'Open app',
    quit: isFr ? 'Quitter' : 'Quit'
  };

  const template = [
    ...(isMac
      ? [
          {
            label: 'Garage Manager',
            submenu: [
              {
                label: labels.openApp,
                click: () => {
                  afficherFenetrePrincipale();
                }
              },
              {
                type: 'separator'
              },
              {
                role: 'about'
              },
              {
                type: 'separator'
              },
              {
                label: labels.preferences,
                submenu: [
                  {
                    label: labels.appearance,
                    submenu: [
                      {
                        label: labels.systemTheme,
                        type: 'radio',
                        checked: nativeTheme.themeSource === 'system',
                        click: () => {
                          definirThemeSource('system');
                        }
                      },
                      {
                        label: labels.darkTheme,
                        type: 'radio',
                        checked: nativeTheme.themeSource === 'dark',
                        click: () => {
                          definirThemeSource('dark');
                        }
                      },
                      {
                        label: labels.lightTheme,
                        type: 'radio',
                        checked: nativeTheme.themeSource === 'light',
                        click: () => {
                          definirThemeSource('light');
                        }
                      }
                    ]
                  },
                  {
                    label: labels.language,
                    submenu: [
                      {
                        label: labels.french,
                        type: 'radio',
                        checked: currentLanguage === 'fr',
                        click: () => {
                          definirLangue('fr');
                        }
                      },
                      {
                        label: labels.english,
                        type: 'radio',
                        checked: currentLanguage === 'en',
                        click: () => {
                          definirLangue('en');
                        }
                      }
                    ]
                  }
                ]
              },
              {
                type: 'separator'
              },
              {
                role: 'hide'
              },
              {
                role: 'hideOthers'
              },
              {
                role: 'unhide'
              },
              {
                type: 'separator'
              },
              {
                label: labels.quit,
                accelerator: 'Cmd+Q',
                click: () => {
                  isQuitting = true;
                  app.quit();
                }
              }
            ]
          }
        ]
      : []),

    {
      label: labels.garage,
      submenu: [
        {
          label: labels.vehicles,
          submenu: [
            {
              label: labels.newCar,
              accelerator: 'CmdOrCtrl+N',
              click: () => {
                envoyerActionAuRenderer('menu:nouvelle-voiture');
              }
            }
          ]
        },
        {
          label: labels.data,
          submenu: [
            {
              label: labels.reload,
              accelerator: 'F5',
              click: () => {
                envoyerActionAuRenderer('menu:recharger');
              }
            },
            {
              label: labels.resetFilters,
              accelerator: 'CmdOrCtrl+Shift+F',
              click: () => {
                envoyerActionAuRenderer('menu:reinitialiser-filtres');
              }
            }
          ]
        },
        {
          label: labels.invoice,
          submenu: [
            {
              label: isFr ? 'Exporter depuis une voiture' : 'Export from a car',
              enabled: false
            },
            {
              label: isFr
                ? 'Utilisez le bouton Facture sur une carte véhicule'
                : 'Use the Invoice button on a vehicle card',
              enabled: false
            }
          ]
        },
        {
          type: 'separator'
        },
        ...(!isMac
          ? [
              {
                label: labels.quit,
                accelerator: 'Alt+F4',
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
      label: labels.display,
      submenu: [
        {
          label: labels.appearance,
          submenu: [
            {
              label: labels.systemTheme,
              type: 'radio',
              checked: nativeTheme.themeSource === 'system',
              click: () => {
                definirThemeSource('system');
              }
            },
            {
              label: labels.darkTheme,
              type: 'radio',
              checked: nativeTheme.themeSource === 'dark',
              click: () => {
                definirThemeSource('dark');
              }
            },
            {
              label: labels.lightTheme,
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
          label: labels.language,
          submenu: [
            {
              label: labels.french,
              type: 'radio',
              checked: currentLanguage === 'fr',
              click: () => {
                definirLangue('fr');
              }
            },
            {
              label: labels.english,
              type: 'radio',
              checked: currentLanguage === 'en',
              click: () => {
                definirLangue('en');
              }
            }
          ]
        }
      ]
    },

    {
      label: labels.tools,
      submenu: [
        {
          label: labels.refreshWeather,
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            envoyerActionAuRenderer('menu:actualiser-meteo');
          }
        },
        {
          type: 'separator'
        },
        {
          label: isFr ? 'Informations techniques' : 'Technical information',
          submenu: [
            {
              label: isFr ? 'Base SQLite dans userData' : 'SQLite database in userData',
              click: () => {
                dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: isFr ? 'Base de données' : 'Database',
                  message: getDatabasePath()
                });
              }
            }
          ]
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
  const isFr = currentLanguage === 'fr';

  const labels = {
    title: 'Garage Manager',
    open: isFr ? 'Ouvrir l’application' : 'Open app',
    newCar: isFr ? 'Nouvelle voiture' : 'New car',
    reload: isFr ? 'Recharger les données' : 'Reload data',
    resetFilters: isFr ? 'Réinitialiser les filtres' : 'Reset filters',
    weather: isFr ? 'Actualiser la météo' : 'Refresh weather',
    quickActions: isFr ? 'Actions rapides' : 'Quick actions',
    preferences: isFr ? 'Préférences' : 'Preferences',
    appearance: isFr ? 'Apparence' : 'Appearance',
    language: isFr ? 'Langue' : 'Language',
    systemTheme: isFr ? 'Suivre le système' : 'Follow system',
    darkTheme: isFr ? 'Mode sombre' : 'Dark mode',
    lightTheme: isFr ? 'Mode clair' : 'Light mode',
    french: isFr ? 'Français' : 'French',
    english: isFr ? 'Anglais' : 'English',
    quit: isFr ? 'Quitter' : 'Quit'
  };

  return Menu.buildFromTemplate([
    {
      label: labels.title,
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: labels.open,
      click: () => {
        afficherFenetrePrincipale();
      }
    },
    {
      type: 'separator'
    },
    {
      label: labels.quickActions,
      submenu: [
        {
          label: labels.newCar,
          click: () => {
            envoyerActionAuRenderer('menu:nouvelle-voiture');
          }
        },
        {
          label: labels.reload,
          click: () => {
            envoyerActionAuRenderer('menu:recharger');
          }
        },
        {
          label: labels.resetFilters,
          click: () => {
            envoyerActionAuRenderer('menu:reinitialiser-filtres');
          }
        },
        {
          label: labels.weather,
          click: () => {
            envoyerActionAuRenderer('menu:actualiser-meteo');
          }
        }
      ]
    },
    {
      label: labels.preferences,
      submenu: [
        {
          label: labels.appearance,
          submenu: [
            {
              label: labels.systemTheme,
              type: 'radio',
              checked: nativeTheme.themeSource === 'system',
              click: () => {
                definirThemeSource('system');
              }
            },
            {
              label: labels.darkTheme,
              type: 'radio',
              checked: nativeTheme.themeSource === 'dark',
              click: () => {
                definirThemeSource('dark');
              }
            },
            {
              label: labels.lightTheme,
              type: 'radio',
              checked: nativeTheme.themeSource === 'light',
              click: () => {
                definirThemeSource('light');
              }
            }
          ]
        },
        {
          label: labels.language,
          submenu: [
            {
              label: labels.french,
              type: 'radio',
              checked: currentLanguage === 'fr',
              click: () => {
                definirLangue('fr');
              }
            },
            {
              label: labels.english,
              type: 'radio',
              checked: currentLanguage === 'en',
              click: () => {
                definirLangue('en');
              }
            }
          ]
        }
      ]
    },
    {
      type: 'separator'
    },
    {
      label: labels.quit,
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
    envoyerLangueAuRenderer();
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
  const browserWindow = BrowserWindow.fromWebContents(event.sender);

  const langueParDefaut = currentLanguage === 'en' ? 'en' : 'fr';

  const choixLangue = await dialog.showMessageBox(browserWindow, {
    type: 'question',
    title: langueParDefaut === 'fr' ? 'Langue de la facture' : 'Invoice language',
    message:
      langueParDefaut === 'fr'
        ? 'Dans quelle langue voulez-vous générer la facture ?'
        : 'Which language do you want to use for the invoice?',
    buttons:
      langueParDefaut === 'fr'
        ? ['Français', 'Anglais', 'Annuler']
        : ['English', 'French', 'Cancel'],
    defaultId: 0,
    cancelId: 2
  });

  if (choixLangue.response === 2) {
    return {
      success: false,
      canceled: true
    };
  }

  const langueFacture =
    langueParDefaut === 'fr'
      ? choixLangue.response === 0
        ? 'fr'
        : 'en'
      : choixLangue.response === 0
        ? 'en'
        : 'fr';

  const facture = genererFactureHtml(voitureId, langueFacture);

  const resultat = await dialog.showSaveDialog(browserWindow, {
    title: langueFacture === 'fr' ? 'Exporter la facture' : 'Export invoice',
    defaultPath: path.join(app.getPath('documents'), facture.nomFichier),
    filters: [
      {
        name: langueFacture === 'fr' ? 'Fichier HTML' : 'HTML file',
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
    filePath: resultat.filePath,
    language: langueFacture
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

ipcMain.handle('language:obtenir', () => {
  return obtenirLangueCourante();
});

ipcMain.handle('language:definir', (event, language) => {
  return definirLangue(language);
});

app.whenReady().then(() => {
  initialiserBase();
  initialiserThemeDepuisCache();
  initialiserLangueDepuisCache();
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