# Garage Manager

Garage Manager est une application desktop développée avec Electron.

Elle permet de gérer un petit garage automobile avec des voitures, des interventions, des statuts, un dashboard, une recherche, des filtres, des notifications, un export de facture et un packaging avec `electron-builder`.

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
- rechercher une voiture ;
- filtrer les voitures par statut ;
- réinitialiser les filtres ;
- afficher un dashboard ;
- exporter une facture HTML ;
- afficher des notifications visuelles ;
- tenter d’afficher des notifications système Electron ;
- afficher des confirmations natives Electron ;
- utiliser un menu natif avec raccourcis ;
- stocker les données localement dans une base SQLite située dans `userData` ;
- packager l’application avec `electron-builder`.

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
│  └─ factures.service.js
│
├─ renderer/
│  ├─ modules/
│  │  ├─ constants.js
│  │  ├─ garage.page.js
│  │  ├─ interventions.modal.js
│  │  ├─ layout.js
│  │  ├─ state.js
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
- gérer les confirmations natives ;
- gérer les notifications système ;
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
  listerVoitures: () => ipcRenderer.invoke('voitures:lister')
});
```

Le Renderer peut donc appeler :

```js
window.electronAPI.listerVoitures()
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

---

### `renderer/renderer.js`

Le fichier `renderer.js` est le point d’entrée côté interface.

Il sert à :

- initialiser le layout ;
- initialiser les modules UI ;
- initialiser la page garage ;
- initialiser les modales ;
- brancher les actions du menu natif ;
- charger les voitures au démarrage.

---

### `renderer/modules/layout.js`

Ce fichier génère la structure HTML principale de l’application.

Il contient :

- le header ;
- le dashboard ;
- la page d’accueil garage ;
- les modales voiture ;
- les modales interventions ;
- la modale de confirmation fallback.

---

### `renderer/modules/garage.page.js`

Ce fichier gère la page principale.

Il sert à :

- afficher les voitures ;
- afficher le dashboard ;
- gérer la recherche ;
- gérer les filtres ;
- réinitialiser les filtres ;
- déclencher la modification d’une voiture ;
- déclencher l’ouverture des interventions ;
- déclencher l’export de facture ;
- déclencher la suppression d’une voiture.

---

### `renderer/modules/voiture.modal.js`

Ce fichier gère la popup d’ajout et de modification d’une voiture.

Il permet de :

- créer une voiture ;
- modifier une voiture ;
- détecter le passage au statut `Prête` ;
- afficher une notification visuelle quand une voiture devient prête.

---

### `renderer/modules/interventions.modal.js`

Ce fichier gère les popups liées aux interventions.

Il permet de :

- afficher les interventions d’une voiture ;
- ajouter une intervention ;
- modifier une intervention ;
- supprimer une intervention ;
- recalculer les totaux HT / TVA / TTC.

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
- cartes voiture ;
- dashboard ;
- boutons stylisés ;
- badges de statut ;
- modales cohérentes ;
- notifications visuelles.

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

Pour les actions envoyées depuis le menu natif vers la page, le Main utilise :

```js
mainWindow.webContents.send(...)
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

### Voitures

| Action | Canal IPC | Paramètres | Retour |
|---|---|---|---|
| Lister les voitures | `voitures:lister` | Aucun | Tableau de voitures |
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

### Notifications

| Action | Canal IPC | Paramètres | Retour |
|---|---|---|---|
| Envoyer une notification | `notifications:envoyer` | Titre + message | Succès ou échec |

---

### Menu natif

| Action | Canal | Effet |
|---|---|---|
| Nouvelle voiture | `menu:nouvelle-voiture` | Ouvre la popup d’ajout |
| Recharger les données | `menu:recharger` | Recharge la liste |
| Réinitialiser les filtres | `menu:reinitialiser-filtres` | Vide recherche + filtre |

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
1 = Reçu
2 = En réparation
3 = Prête
4 = Livré
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
- du total TTC.

La facture peut ensuite être exportée depuis l’application.

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

## Recherche et filtres

L’interface permet de rechercher une voiture par :

- ID ;
- marque ;
- modèle ;
- immatriculation ;
- nom du client ;
- description.

Elle permet aussi de filtrer les voitures par statut.

Un bouton permet de réinitialiser la recherche et les filtres.

Le menu natif contient aussi une action de réinitialisation des filtres.

---

## Menu natif

L’application possède un menu natif Electron.

Il contient notamment :

```txt
Garage
├─ Nouvelle voiture
├─ Recharger les données
├─ Réinitialiser les filtres
└─ Quitter
```

Les raccourcis utilisés sont :

```txt
Cmd/Ctrl + N = Nouvelle voiture
F5 = Recharger les données
Cmd/Ctrl + Shift + F = Réinitialiser les filtres
```

Le menu est défini dans le Main process.

Quand l’utilisateur clique sur un élément du menu, le Main envoie un message au Renderer.

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
- erreur.

### Notifications système

L’application tente aussi d’envoyer des notifications système via Electron.

Sur macOS, elles peuvent ne pas apparaître si l’application n’est pas signée ou autorisée dans les réglages système.

Les toasts garantissent donc un retour visuel dans l’application.

---

## Export de facture

Chaque carte voiture possède un bouton `Facture`.

Ce bouton permet d’exporter une facture au format HTML.

L’export utilise une boîte native `Enregistrer sous`.

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
12. Recherche d’une voiture
13. Filtre par statut
14. Réinitialisation des filtres
15. Ajout d’une intervention
16. Modification d’une intervention
17. Calcul du total HT / TVA / TTC d’une voiture
18. Calcul du total global du garage
19. Suppression d’une intervention avec confirmation native
20. Suppression d’une voiture avec confirmation native
21. Vérification de la suppression en cascade
22. Export d’une facture HTML
23. Ouverture de la facture exportée
24. Test du menu natif
25. Test du raccourci Cmd/Ctrl + N
26. Test de npm run pack
27. Test de npm run dist
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
- de réinitialiser les filtres.

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
- dashboard ;
- recherche ;
- filtre par statut ;
- bouton de réinitialisation des filtres ;
- menu natif ;
- raccourcis clavier ;
- notifications visuelles ;
- notifications système ;
- confirmation native Electron ;
- fallback HTML de confirmation ;
- export de facture HTML ;
- facture avec HT / TVA / TTC ;
- packaging avec `electron-builder`.

---

## Conclusion

Garage Manager est une application Electron complète qui respecte la séparation entre le Main process, le Preload et le Renderer.

Le projet montre l’utilisation de l’IPC, la sécurisation de l’accès à Node.js, la persistance avec SQLite dans `userData`, les requêtes préparées, l’utilisation d’API natives Electron, la génération de factures et le packaging avec `electron-builder`.

L’application est fonctionnelle et couvre les principaux besoins d’un petit outil de gestion de garage.