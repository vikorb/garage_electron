# Garage Manager

Garage Manager est une application desktop développée avec Electron.

Elle permet de gérer un petit garage automobile avec des voitures, des interventions, des statuts, un dashboard, une recherche SQL, des filtres, des notifications, un export de facture, un thème clair/sombre, un changement de langue français/anglais, une météo externe, une icône Tray, une icône d’application personnalisée et un packaging avec `electron-builder`.

---

## Rendus visuels

Le projet contient un dossier `img_rendu` avec des captures de l’application.

Ce dossier sert à montrer :

- l’interface principale ;
- le dashboard ;
- les cartes voitures ;
- les modales ;
- le thème sombre ;
- le thème clair ;
- le bouton de changement d’apparence ;
- le bouton de changement de langue ;
- le panneau météo ;
- le menu Tray ;
- l’icône de l’application.

Sur certaines captures, l’icône du menu peut apparaître légèrement rosée. C’est normal : cette couleur vient du thème macOS utilisé sur la machine, et non d’un problème dans l’application.

---

## Objectif du projet

L’objectif du projet est de comprendre le fonctionnement d’une application Electron avec une séparation propre entre :

- le processus Main ;
- le processus Renderer ;
- le fichier Preload ;
- la communication IPC ;
- les services métier ;
- le stockage local des données ;
- l’utilisation d’API natives Electron ;
- l’appel à une API externe ;
- l’internationalisation ;
- le packaging d’une application desktop.

L’application respecte le principe suivant :

```txt
Renderer
→ preload.js
→ IPC
→ main.js
→ services
→ SQLite dans userData
```

Le Renderer ne lit jamais directement les fichiers ou la base de données.
Il n’a pas accès directement à Node.js, `fs`, `path` ou `require`.

---

## Fonctionnalités principales

L’application permet de :

- ajouter une voiture ;
- lister les voitures ;
- modifier une voiture ;
- supprimer une voiture ;
- ajouter des interventions sur une voiture ;
- modifier une intervention ;
- supprimer une intervention ;
- lister les interventions d’une voiture ;
- calculer le total HT des interventions ;
- calculer la TVA ;
- calculer le total TTC ;
- calculer le total global du garage ;
- rechercher une voiture côté SQL ;
- filtrer les voitures par statut côté SQL ;
- réinitialiser les filtres ;
- afficher un dashboard ;
- exporter une facture HTML ;
- choisir la langue de la facture avant export ;
- afficher des notifications visuelles ;
- tenter d’afficher des notifications système Electron ;
- afficher des confirmations natives Electron ;
- utiliser un menu natif avec raccourcis ;
- utiliser une icône Tray avec un menu rapide ;
- changer l’apparence de l’application ;
- sauvegarder le thème choisi ;
- changer la langue de l’application ;
- sauvegarder la langue choisie ;
- détecter la langue par défaut selon la locale du système ;
- afficher une météo externe via Open-Meteo ;
- stocker les données localement dans une base SQLite située dans `userData` ;
- packager l’application avec `electron-builder` ;
- utiliser une icône d’application personnalisée dans le build.

---

## Architecture du projet

Arborescence principale :

```txt
src/
├─ data/
│  ├─ voitures.json
│  └─ interventions.json
│
├─ models/
│  ├─ voiture.model.js
│  └─ intervention.model.js
│
├─ services/
│  ├─ db.service.js
│  ├─ voitures.service.js
│  ├─ interventions.service.js
│  ├─ factures.service.js
│  └─ meteo.service.js
│
├─ renderer/
│  ├─ modules/
│  │  ├─ constants.js
│  │  ├─ garage.page.js
│  │  ├─ i18n.js
│  │  ├─ interventions.modal.js
│  │  ├─ layout.js
│  │  ├─ meteo.panel.js
│  │  ├─ state.js
│  │  ├─ theme.js
│  │  ├─ ui.js
│  │  ├─ utils.js
│  │  └─ voiture.modal.js
│  │
│  ├─ index.html
│  ├─ renderer.js
│  └─ styles.css
│
├─ main.js
└─ preload.js

build/
└─ icon.png

img_rendu/
└─ captures de l’application
```

Le dossier `src/data` peut servir de base de données de départ en développement.
Les données réelles de l’application sont ensuite stockées dans SQLite, dans le dossier `userData`.

---

## Rôle des fichiers principaux

### `main.js`

Le fichier `main.js` correspond au processus Main.

Il sert à :

- démarrer l’application Electron ;
- créer la fenêtre principale ;
- charger la page HTML ;
- configurer la sécurité Electron ;
- déclarer les canaux IPC ;
- appeler les services métier ;
- accéder au système de fichiers ;
- initialiser la base SQLite ;
- créer le menu natif ;
- créer l’icône Tray ;
- gérer les confirmations natives ;
- gérer les notifications système ;
- gérer le thème clair/sombre ;
- sauvegarder le thème dans `userData` ;
- gérer la langue de l’application ;
- sauvegarder la langue dans `userData` ;
- appeler le service météo ;
- exporter les factures.

---

### `preload.js`

Le fichier `preload.js` sert de pont sécurisé entre le Renderer et le Main.

Il expose uniquement les fonctions autorisées dans :

```js
window.electronAPI
```

Exemple :

```js
contextBridge.exposeInMainWorld('electronAPI', {
  listerVoitures: (filtres = {}) => ipcRenderer.invoke('voitures:lister', filtres)
});
```

Le Renderer peut donc appeler :

```js
window.electronAPI.listerVoitures({ recherche: '', statut: 'tous' });
```

Mais il ne peut pas utiliser directement :

```txt
fs
path
require
better-sqlite3
```

---

### `renderer/index.html`

Le fichier `index.html` contient seulement les points d’entrée de l’interface :

```html
<div id="app"></div>
<div id="modal-root"></div>
<div id="toast-container"></div>
```

L’interface est ensuite générée et organisée depuis les modules JavaScript du Renderer.

Le fichier contient aussi une CSP :

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';"
/>
```

L’appel à l’API météo est réalisé côté Main, donc le Renderer n’a pas besoin d’autoriser une connexion directe vers l’extérieur.

---

### `renderer/renderer.js`

Le fichier `renderer.js` est le point d’entrée côté interface.

Il sert à :

- initialiser le layout ;
- initialiser l’UI ;
- initialiser l’internationalisation ;
- initialiser le thème ;
- initialiser la météo ;
- initialiser la page garage ;
- initialiser les modales ;
- brancher les actions du menu natif ;
- charger les voitures au démarrage.

---

### `renderer/modules/layout.js`

Ce fichier génère la structure HTML principale de l’application.

Il contient :

- le header ;
- le bouton d’apparence ;
- le bouton de langue ;
- le bouton `Nouvelle voiture` ;
- le dashboard ;
- le panneau météo ;
- la page d’accueil garage ;
- les modales voiture ;
- les modales interventions ;
- la modale de confirmation fallback.

Le HTML utilise des clés de traduction avec `data-i18n`, `data-i18n-placeholder` et `data-i18n-aria`.

---

### `renderer/modules/i18n.js`

Ce fichier gère l’internationalisation de l’application.

Il contient :

- les traductions françaises ;
- les traductions anglaises ;
- la fonction `t()` ;
- la traduction automatique des éléments HTML ;
- la mise à jour dynamique de l’interface quand la langue change.

L’application supporte actuellement :

```txt
fr = français
en = anglais
```

---

### `renderer/modules/theme.js`

Ce fichier gère le thème de l’application côté Renderer.

Il permet de :

- récupérer le thème courant ;
- changer le thème depuis le select ;
- appliquer le thème clair ou sombre sur le `body` ;
- réagir quand le thème est changé depuis le menu natif ou le Tray.

Le choix du thème est sauvegardé côté Main dans `userData`.

---

### `renderer/modules/garage.page.js`

Ce fichier gère la page principale.

Il sert à :

- afficher les voitures ;
- afficher le dashboard ;
- envoyer les critères de recherche au Main ;
- gérer les filtres SQL ;
- réinitialiser les filtres ;
- déclencher la modification d’une voiture ;
- déclencher l’ouverture des interventions ;
- déclencher l’export de facture ;
- déclencher la suppression d’une voiture ;
- retraduire les cartes voiture quand la langue change.

---

### `renderer/modules/voiture.modal.js`

Ce fichier gère la popup d’ajout et de modification d’une voiture.

Il permet de :

- créer une voiture ;
- modifier une voiture ;
- détecter le passage au statut `Prête` ;
- afficher une notification visuelle quand une voiture devient prête ;
- utiliser les clés de langue pour les titres, messages et notifications.

---

### `renderer/modules/interventions.modal.js`

Ce fichier gère les popups liées aux interventions.

Il permet de :

- afficher les interventions d’une voiture ;
- ajouter une intervention ;
- modifier une intervention ;
- supprimer une intervention ;
- recalculer les totaux HT / TVA / TTC ;
- retraduire les textes dynamiques quand la langue change.

---

### `renderer/modules/meteo.panel.js`

Ce fichier gère l’affichage de la météo dans l’interface.

Il permet de :

- demander la météo au Main via IPC ;
- afficher la température ;
- afficher l’humidité ;
- afficher le vent ;
- afficher la probabilité de pluie ;
- afficher un conseil métier adapté au garage ;
- retraduire la météo et le conseil quand la langue change.

---

### `renderer/modules/ui.js`

Ce fichier centralise les fonctions d’interface communes.

Il gère :

- l’ouverture et la fermeture des modales ;
- les toasts ;
- les notifications applicatives ;
- les confirmations natives ;
- le fallback HTML si la confirmation native échoue ;
- la création des badges de statut ;
- la création des lignes de détails voiture.

---

### `renderer/styles.css`

Ce fichier contient le style de l’application.

Le thème choisi est un style garage moderne :

- fond noir ;
- accents rouges ;
- effets néon ;
- thème clair blanc/crème avec rouge vif ;
- cartes voiture ;
- dashboard ;
- boutons stylisés ;
- badges de statut ;
- modales cohérentes ;
- notifications visuelles ;
- header moderne avec groupe `Apparence` / `Langue` / `Nouvelle voiture` ;
- design responsive.

---

## Sécurité Electron

L’application utilise une configuration sécurisée :

```js
webPreferences: {
  preload: path.join(__dirname, 'preload.js'),
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true
}
```

Cela signifie que :

```txt
- le Renderer ne peut pas utiliser Node.js directement ;
- le Renderer ne peut pas utiliser require ;
- le Renderer ne peut pas accéder directement au système de fichiers ;
- les échanges passent par le preload ;
- seules les fonctions exposées dans window.electronAPI sont disponibles.
```

Une CSP est aussi définie dans `index.html`.

---

## Communication IPC

L’application utilise l’IPC pour faire communiquer le Renderer avec le Main.

Le principe est le suivant :

```txt
renderer
→ window.electronAPI
→ preload.js
→ ipcRenderer.invoke()
→ main.js
→ ipcMain.handle()
→ service
→ retour vers le Renderer
```

Pour les actions envoyées depuis le menu natif ou le Tray vers la page, le Main utilise :

```js
mainWindow.webContents.send(...);
```

Puis le preload écoute l’événement et appelle une fonction du Renderer.

---

## Canaux IPC utilisés

### Système

| Action | Canal IPC | Paramètres | Retour |
|---|---|---|---|
| Obtenir le chemin de la base | `systeme:chemin-base` | Aucun | Chemin SQLite |
| Confirmation native | `dialog:confirmation` | Options de dialogue | Confirmation true / false |

---

### Thème

| Action | Canal IPC | Paramètres | Retour |
|---|---|---|---|
| Obtenir le thème | `theme:obtenir` | Aucun | Thème courant |
| Définir le thème | `theme:definir` | `system`, `light` ou `dark` | Thème courant |
| Mise à jour du thème | `theme:mis-a-jour` | Aucun | Événement envoyé au Renderer |

---

### Langue

| Action | Canal IPC | Paramètres | Retour |
|---|---|---|---|
| Obtenir la langue | `language:obtenir` | Aucun | Langue courante |
| Définir la langue | `language:definir` | `fr` ou `en` | Langue courante |
| Mise à jour de la langue | `language:mis-a-jour` | Aucun | Événement envoyé au Renderer |

---

### Voitures

| Action | Canal IPC | Paramètres | Retour |
|---|---|---|---|
| Lister les voitures | `voitures:lister` | Filtres recherche/statut | Tableau de voitures |
| Ajouter une voiture | `voitures:ajouter` | Objet voiture | Voiture créée |
| Modifier une voiture | `voitures:modifier` | ID + données voiture | Voiture modifiée |
| Supprimer une voiture | `voitures:supprimer` | ID | Succès |

---

### Interventions

| Action | Canal IPC | Paramètres | Retour |
|---|---|---|---|
| Lister les interventions d’une voiture | `interventions:lister-par-voiture` | ID voiture | Interventions + totaux |
| Ajouter une intervention | `interventions:ajouter` | Objet intervention | Intervention créée |
| Modifier une intervention | `interventions:modifier` | ID + données intervention | Intervention modifiée |
| Supprimer une intervention | `interventions:supprimer` | ID intervention | Succès |
| Calculer le total global | `interventions:total-global` | Aucun | Total HT / TVA / TTC |
| Calculer les totaux par voiture | `interventions:totaux-par-voiture` | Aucun | Totaux par voiture |

---

### Factures

| Action | Canal IPC | Paramètres | Retour |
|---|---|---|---|
| Exporter une facture | `factures:exporter` | ID voiture | Résultat export |

---

### Météo

| Action | Canal IPC | Paramètres | Retour |
|---|---|---|---|
| Obtenir la météo garage | `meteo:garage` | Aucun | Données météo |
| Actualiser la météo depuis le menu | `menu:actualiser-meteo` | Aucun | Événement Renderer |

---

### Notifications

| Action | Canal IPC | Paramètres | Retour |
|---|---|---|---|
| Envoyer une notification | `notifications:envoyer` | Titre + message | Succès ou échec |

---

### Menu natif et Tray

| Action | Canal | Effet |
|---|---|---|
| Nouvelle voiture | `menu:nouvelle-voiture` | Ouvre la popup d’ajout |
| Recharger les données | `menu:recharger` | Recharge la liste |
| Réinitialiser les filtres | `menu:reinitialiser-filtres` | Vide recherche + filtre |
| Actualiser la météo | `menu:actualiser-meteo` | Recharge le panneau météo |

---

## Entités

## Voiture

Une voiture contient les champs suivants :

```txt
id
immatriculation
marque
modele
nom_client
statut
description
prix
created_at
updated_at
```

Exemple :

```json
{
  "id": 1,
  "immatriculation": "AB-123-CD",
  "marque": "Renault",
  "modele": "Clio",
  "nom_client": "Jean",
  "statut": 1,
  "description": "Problème moteur",
  "prix": 8000
}
```

Le champ `prix_reparation` n’est plus stocké dans la voiture.

Le prix des réparations est calculé à partir des interventions :

```txt
Total HT = somme des interventions
TVA = 20 %
Total TTC = Total HT + TVA
```

---

## Intervention

Une intervention est liée à une voiture grâce au champ `voiture_id`.

```txt
id
voiture_id
description
prix
created_at
updated_at
```

Le champ `prix` correspond au montant HT de l’intervention.

Exemple :

```json
{
  "id": 1,
  "voiture_id": 1,
  "description": "Vidange complète",
  "prix": 120
}
```

---

## Statuts des voitures

Les statuts disponibles sont :

```txt
1 = Reçu / Received
2 = En réparation / Repairing
3 = Prête / Ready
4 = Livré / Delivered
```

Dans l’interface, chaque statut est affiché sous forme de badge coloré.

Quand une voiture passe au statut `Prête`, l’application affiche une notification visuelle.

---

## Stockage des données

Les données sont stockées dans une base SQLite.

La base est créée dans le dossier `userData` d’Electron.

Sur macOS, le chemin ressemble à :

```txt
~/Library/Application Support/gestionnaire-garage/garage.db
```

Cela évite d’écrire les données à côté du code de l’application.

Cette solution permet de conserver les voitures et interventions :

```txt
- après fermeture / réouverture ;
- après packaging ;
- sans dépendre du dossier src/data ;
- sans écrire dans le dossier dist.
```

---

## Préférences utilisateur

L’application sauvegarde aussi certaines préférences dans `userData`.

### Thème

Le thème est sauvegardé dans :

```txt
~/Library/Application Support/gestionnaire-garage/theme-preferences.json
```

Valeurs possibles :

```txt
system
light
dark
```

Au redémarrage, l’application recharge automatiquement le dernier thème choisi.

### Langue

La langue est sauvegardée dans :

```txt
~/Library/Application Support/gestionnaire-garage/language-preferences.json
```

Valeurs possibles :

```txt
fr
en
```

Au premier lancement, la langue est détectée automatiquement :

- français pour une locale française ou un pays francophone ;
- anglais pour les autres cas.

Après un choix utilisateur, la langue est conservée au prochain lancement.

---

## SQLite

Le projet utilise `better-sqlite3`.

Les tables principales sont :

```sql
CREATE TABLE IF NOT EXISTS voitures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  immatriculation TEXT DEFAULT '',
  marque TEXT NOT NULL,
  modele TEXT NOT NULL,
  nom_client TEXT DEFAULT '',
  statut INTEGER NOT NULL DEFAULT 1,
  description TEXT DEFAULT '',
  prix REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interventions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  voiture_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  prix REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (voiture_id)
    REFERENCES voitures(id)
    ON DELETE CASCADE
);
```

Les requêtes utilisent des requêtes préparées avec `?`.

Exemple :

```js
db.prepare('SELECT * FROM voitures WHERE id = ?').get(id);
```

Cela évite les injections SQL.

---

## Services métier

## `db.service.js`

Ce service gère :

- la création de la base SQLite ;
- le chemin vers `userData` ;
- l’initialisation du schéma ;
- l’activation des clés étrangères ;
- la migration depuis les fichiers JSON de développement si la base est vide.

---

## `voitures.service.js`

Ce service gère toute la logique liée aux voitures.

Il contient notamment :

- liste des voitures ;
- recherche d’une voiture par ID ;
- ajout d’une voiture ;
- modification d’une voiture ;
- suppression d’une voiture ;
- validation des données ;
- recherche et filtre côté SQL ;
- requêtes préparées SQLite.

---

## `interventions.service.js`

Ce service gère toute la logique liée aux interventions.

Il contient notamment :

- ajout d’une intervention ;
- modification d’une intervention ;
- suppression d’une intervention ;
- liste des interventions d’une voiture ;
- calcul du total HT ;
- calcul de la TVA ;
- calcul du total TTC ;
- calcul du total global du garage ;
- calcul des totaux par voiture ;
- requêtes préparées SQLite.

---

## `factures.service.js`

Ce service gère la génération de facture.

Il permet de générer une facture HTML à partir :

- des informations de la voiture ;
- du client ;
- des interventions liées à cette voiture ;
- du total HT ;
- de la TVA ;
- du total TTC ;
- de la langue choisie.

La facture peut être générée en français ou en anglais.

Avant l’export, l’application demande la langue de la facture. La langue actuelle de l’application est proposée par défaut.

---

## `meteo.service.js`

Ce service gère l’appel à l’API météo externe.

Il appelle Open-Meteo côté Main process afin d’éviter que le Renderer contacte directement une API externe.

Il retourne :

- la ville ;
- la température ;
- l’humidité ;
- le vent ;
- la pluie ;
- le code météo ;
- un conseil métier adapté au garage.

---

## Suppression en cascade

Lorsqu’une voiture est supprimée, les interventions liées à cette voiture sont également supprimées.

Cette suppression est gérée côté SQLite avec :

```sql
FOREIGN KEY (voiture_id)
  REFERENCES voitures(id)
  ON DELETE CASCADE
```

Cela évite de garder des interventions associées à une voiture supprimée.

---

## Dashboard

Le dashboard affiche :

- le nombre total de voitures ;
- le nombre de voitures reçues ;
- le nombre de voitures en réparation ;
- le nombre de voitures prêtes ;
- le nombre de voitures livrées ;
- le total global HT des interventions ;
- le total global TTC des réparations.

---

## Recherche et filtres SQL

L’interface permet de rechercher une voiture par :

- ID ;
- marque ;
- modèle ;
- immatriculation ;
- nom du client ;
- description.

Elle permet aussi de filtrer les voitures par statut.

La recherche et le filtre sont faits côté Main, dans `voitures.service.js`, avec SQLite.

Le Renderer envoie seulement les critères :

```js
{
  recherche: 'renault',
  statut: 'tous'
}
```

Puis le service construit une requête SQL préparée.

Cela respecte le bonus de recherche côté SQL et évite de filtrer uniquement en JavaScript dans le Renderer.

---

## Thèmes

L’application possède trois modes d’apparence :

```txt
system = suivre le système
light = mode clair
dark = mode sombre
```

Le thème clair utilise un style blanc/crème avec un rouge vif bien distinct.

Le thème sombre utilise un style noir, rouge et néon.

Le choix est sauvegardé dans `userData`, donc l’utilisateur n’a pas besoin de le choisir à chaque ouverture de l’application.

---

## Internationalisation

L’application possède un système simple d’internationalisation.

Les langues disponibles sont :

```txt
fr = français
en = anglais
```

Les textes fixes du layout utilisent des clés comme :

```html
<span data-i18n="header.language">Langue</span>
```

Les textes dynamiques utilisent la fonction :

```js
t('car.edit')
```

La langue est détectée automatiquement au premier lancement selon la locale système.

Si la locale correspond à un pays francophone, l’application démarre en français.
Sinon, elle démarre en anglais.

Le choix de l’utilisateur est ensuite sauvegardé dans `userData`.

---

## Météo externe

L’application affiche un panneau météo dans l’interface.

La météo est récupérée via une API externe Open-Meteo.

L’appel est fait côté Main process dans `meteo.service.js`.

Le Renderer demande simplement les données via IPC :

```txt
Renderer
→ preload
→ IPC
→ main
→ meteo.service.js
→ Open-Meteo
```

Le panneau météo affiche :

- la ville ;
- la température ;
- l’humidité ;
- le vent ;
- la pluie ;
- un conseil garage.

Un bouton permet d’actualiser la météo depuis l’interface.

Le menu natif et le Tray permettent aussi d’actualiser la météo.

---

## Menu natif

L’application possède un menu natif Electron.

Il contient notamment :

```txt
Garage
├─ Véhicules
│  └─ Nouvelle voiture
├─ Données
│  ├─ Recharger les données
│  └─ Réinitialiser les filtres
├─ Factures
└─ Quitter

Affichage
├─ Apparence
│  ├─ Suivre le système
│  ├─ Mode sombre
│  └─ Mode clair
└─ Langue
   ├─ Français
   └─ Anglais

Outils
├─ Actualiser la météo
└─ Informations techniques
```

Les raccourcis utilisés sont :

```txt
Cmd/Ctrl + N = Nouvelle voiture
F5 = Recharger les données
Cmd/Ctrl + Shift + F = Réinitialiser les filtres
Cmd/Ctrl + M = Actualiser la météo
```

Le menu est défini dans le Main process.

Quand l’utilisateur clique sur un élément du menu, le Main envoie un message au Renderer.

---

## Tray

L’application possède une icône Tray dans la barre système.

Sur macOS, elle apparaît dans la barre en haut, près de l’heure, du Wi-Fi et de la batterie.

Sur Windows, elle apparaît près de l’horloge.

Le Tray contient un menu rapide :

```txt
Garage Manager
├─ Ouvrir l’application
├─ Actions rapides
│  ├─ Nouvelle voiture
│  ├─ Recharger les données
│  ├─ Réinitialiser les filtres
│  └─ Actualiser la météo
├─ Préférences
│  ├─ Apparence
│  └─ Langue
└─ Quitter
```

Quand la fenêtre est fermée, l’application peut rester disponible dans le Tray.

L’utilisateur peut ensuite rouvrir l’application depuis ce menu.

---

## Icône d’application personnalisée

L’application utilise une icône personnalisée dans le build.

Le fichier est placé ici :

```txt
build/icon.png
```

Cette icône est utilisée par `electron-builder` avec `build.icon`.

Elle apparaît notamment :

- dans le Finder ;
- dans le Dock ;
- dans l’application packagée ;
- dans les builds Windows/Linux si générés avec les targets correspondantes.

Le bonus `build.icon` est donc réalisé.

---

## Confirmations

L’application utilise une confirmation native Electron avant suppression.

Exemples :

- suppression d’une voiture ;
- suppression d’une intervention.

Si la boîte native échoue, une modale HTML personnalisée peut servir de fallback.

---

## Notifications

L’application utilise deux types de notifications.

### Notifications visuelles

Des messages apparaissent dans l’interface sous forme de toasts.

Exemples :

- voiture ajoutée ;
- voiture modifiée ;
- voiture passée en statut prête ;
- intervention ajoutée ;
- intervention modifiée ;
- intervention supprimée ;
- facture exportée ;
- météo actualisée ;
- erreur.

### Notifications système

L’application tente aussi d’envoyer des notifications système via Electron.

Sur macOS, elles peuvent ne pas apparaître si l’application n’est pas signée ou autorisée dans les réglages système.

Les toasts garantissent donc un retour visuel dans l’application.

---

## Export de facture

Chaque carte voiture possède un bouton `Facture`.

Ce bouton permet d’exporter une facture au format HTML.

Avant l’export, l’application demande la langue de la facture.

La langue actuelle de l’application est proposée par défaut.

La facture contient :

- les informations du véhicule ;
- le client ;
- l’immatriculation ;
- la liste des interventions ;
- le montant HT ;
- la TVA 20 % ;
- le total TTC.

Le fichier HTML peut ensuite être ouvert dans un navigateur ou imprimé en PDF.

---

## Packaging

L’application est packagée avec `electron-builder`.

Le dossier `dist/` contient les fichiers générés automatiquement.

Il ne doit pas être versionné dans Git.

À ajouter dans `.gitignore` :

```gitignore
node_modules/
dist/
*.log
.DS_Store
*.db
*.sqlite
*.sqlite3
```

Le dossier `build/` doit rester versionné car il contient l’icône personnalisée de l’application.

---

## Scripts npm

Installer les dépendances :

```bash
npm install
```

Lancer l’application en développement :

```bash
npm start
```

Générer une version non installée :

```bash
npm run pack
```

Cette commande génère une app dans :

```txt
dist/mac-arm64
```

Générer une archive distribuable :

```bash
npm run dist
```

Dans la configuration actuelle, le build macOS génère un fichier `.zip`.

---

## DMG macOS

Le target `.dmg` est désactivé par défaut.

La raison est que `hdiutil` peut échouer si le Mac manque d’espace disque disponible.

Une commande dédiée existe dans `package.json` :

```bash
npm run dist:dmg
```

Elle permet de tenter la génération du `.zip` et du `.dmg` après avoir libéré de l’espace disque.

---

## Notion d’auto-update

L’auto-update permet à une application Electron de vérifier automatiquement si une nouvelle version est disponible.

Avec `electron-updater`, l’application peut interroger un serveur de publication, par exemple GitHub Releases ou un serveur privé, pour comparer la version installée avec la dernière version disponible.

Si une mise à jour existe, elle peut être téléchargée puis installée au redémarrage de l’application avec `autoUpdater.checkForUpdatesAndNotify()` ou avec une logique personnalisée.

Pour fonctionner correctement, `electron-builder` génère les fichiers de release et les métadonnées nécessaires, comme `latest.yml`, qui permettent à l’application de savoir quelle version télécharger.

Sur macOS, l’application doit normalement être signée pour que l’auto-update fonctionne correctement en production.

---

## Tests à effectuer

Pour valider l’application, il faut tester :

```txt
1. Lancement de l’application
2. Affichage de window.electronAPI
3. Vérification du chemin SQLite dans userData
4. Ajout d’une voiture
5. Fermeture / réouverture de l’application
6. Vérification que la voiture est conservée
7. Affichage des voitures sous forme de cartes
8. Modification d’une voiture
9. Passage d’une voiture au statut Prête
10. Affichage de la notification visuelle
11. Affichage des badges de statut
12. Recherche d’une voiture côté SQL
13. Filtre par statut côté SQL
14. Réinitialisation des filtres
15. Ajout d’une intervention
16. Modification d’une intervention
17. Calcul du total HT / TVA / TTC d’une voiture
18. Calcul du total global du garage
19. Suppression d’une intervention avec confirmation native
20. Suppression d’une voiture avec confirmation native
21. Vérification de la suppression en cascade
22. Export d’une facture HTML en français
23. Export d’une facture HTML en anglais
24. Ouverture de la facture exportée
25. Test du menu natif
26. Test du raccourci Cmd/Ctrl + N
27. Test du changement de thème
28. Fermeture / réouverture pour vérifier le thème sauvegardé
29. Test du changement de langue
30. Fermeture / réouverture pour vérifier la langue sauvegardée
31. Test du panneau météo
32. Test du bouton d’actualisation météo
33. Test du Tray
34. Test du bouton Quitter depuis le Tray
35. Test de npm run pack
36. Test de npm run dist
```

---

## Jalons du chapitre 1 réalisés

### Jalon 0 — Cadrage

Réalisé.

L’entité voiture, ses champs et ses actions ont été définis.

---

### Jalon 1 — Squelette Electron

Réalisé.

L’application Electron démarre correctement et affiche une fenêtre.

---

### Jalon 2 — Lister les voitures

Réalisé.

La liste des voitures est récupérée via IPC et affichée dans l’interface.

---

### Jalon 3 — CRUD voitures

Réalisé.

L’application permet d’ajouter, lister, modifier et supprimer des voitures.

---

### Jalon 4 — Interventions

Réalisé.

L’application permet de gérer les interventions liées aux voitures et de calculer le total à payer.

---

### Jalon 5 — Interface utilisateur

Réalisé.

L’interface a été améliorée avec un thème moderne noir et rouge, des cartes, des badges, un dashboard, une recherche et des filtres.

---

## Jalons du chapitre 2 réalisés

### Jalon 1 — Persistance

Réalisé.

Le stockage JSON a été remplacé par SQLite.

La base est stockée dans `userData`.

Les données sont conservées après fermeture / réouverture de l’application.

---

### Jalon 2 — Menu natif

Réalisé.

Un menu natif Electron a été ajouté.

Il permet notamment :

- d’ouvrir la popup d’ajout de voiture ;
- de recharger les données ;
- de réinitialiser les filtres ;
- d’actualiser la météo ;
- de changer le thème ;
- de changer la langue.

---

### Jalon 3 — Notifications et confirmations

Réalisé.

L’application utilise :

- une confirmation native avant suppression ;
- des toasts applicatifs ;
- des notifications système quand elles sont disponibles ;
- une notification visible quand une voiture passe au statut `Prête`.

---

### Jalon 4 — Export de facture

Réalisé.

L’application exporte une facture HTML via une boîte native `Enregistrer sous`.

La facture contient les interventions, le total HT, la TVA et le total TTC.

La facture peut être générée en français ou en anglais.

---

### Jalon 5 — Packaging

Réalisé.

L’application est packagée avec `electron-builder`.

Les commandes disponibles sont :

```bash
npm run pack
npm run dist
```

---

## Bonus réalisés

Les bonus réalisés sont :

- persistance SQLite ;
- base rangée dans `userData` ;
- migration initiale depuis JSON ;
- factorisation en services ;
- factorisation du Renderer en modules ;
- modèles séparés ;
- suppression en cascade SQLite ;
- validation métier ;
- interface moderne ;
- thème clair/sombre avec `nativeTheme` ;
- sauvegarde du thème dans `userData` ;
- changement de langue français/anglais ;
- détection automatique de la langue ;
- sauvegarde de la langue dans `userData` ;
- dashboard ;
- recherche côté SQL ;
- filtre par statut côté SQL ;
- bouton de réinitialisation des filtres ;
- menu natif ;
- raccourcis clavier ;
- icône Tray avec menu rapide ;
- icône d’application personnalisée avec `build.icon` ;
- notifications visuelles ;
- notifications système ;
- confirmation native Electron ;
- fallback HTML de confirmation ;
- export de facture HTML ;
- choix de la langue de facture ;
- facture avec HT / TVA / TTC ;
- météo externe via Open-Meteo ;
- packaging avec `electron-builder` ;
- notion d’auto-update documentée.

---

## Différence entre `build.icon` et Tray

Le bonus `build.icon` correspond à l’icône officielle de l’application packagée.

Elle apparaît notamment :

- dans le Dock ;
- dans le Finder ;
- dans l’application générée ;
- dans l’installeur ou l’archive distribuable.

Le bonus Tray correspond à une petite icône dans la barre système pendant que l’application tourne.

Elle sert à proposer un menu rapide pour ouvrir l’application, créer une voiture, actualiser la météo, changer les préférences ou quitter.

Les deux bonus sont donc différents et les deux sont réalisés.

---

## Conclusion

Garage Manager est une application Electron complète qui respecte la séparation entre le Main process, le Preload et le Renderer.

Le projet montre l’utilisation de l’IPC, la sécurisation de l’accès à Node.js, la persistance avec SQLite dans `userData`, les requêtes préparées, l’utilisation d’API natives Electron, l’internationalisation, la gestion d’un thème persistant, l’appel à une API externe, la génération de factures et le packaging avec `electron-builder`.

L’application est fonctionnelle et couvre les principaux besoins d’un petit outil de gestion de garage.
