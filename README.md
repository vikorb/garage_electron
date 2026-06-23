# Garage Manager

Garage Manager est une application desktop développée avec Electron.

Elle permet de gérer un petit garage automobile avec des voitures, des interventions, des statuts, un dashboard, une recherche, des filtres, des notifications et un export de facture.

---

## Objectif du projet

L’objectif du projet est de comprendre le fonctionnement d’une application Electron avec une séparation propre entre :

- le processus Main ;
- le processus Renderer ;
- le fichier Preload ;
- la communication IPC ;
- les services métier ;
- le stockage local des données.

L’application respecte le principe suivant :

```txt
Renderer
→ preload.js
→ IPC
→ main.js
→ services
→ fichiers JSON
```

Le Renderer ne lit jamais directement les fichiers JSON et n’a pas accès directement à Node.js.

---

## Fonctionnalités principales

L’application permet de :

- ajouter une voiture ;
- lister les voitures ;
- modifier une voiture ;
- supprimer une voiture ;
- ajouter des interventions sur une voiture ;
- lister les interventions d’une voiture ;
- supprimer une intervention ;
- calculer le total des interventions d’une voiture ;
- calculer le total global des interventions du garage ;
- rechercher une voiture ;
- filtrer les voitures par statut ;
- afficher un dashboard ;
- exporter une facture HTML ;
- afficher des notifications système ;
- afficher des messages de confirmation personnalisés ;
- stocker les données localement dans des fichiers JSON.

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
│  ├─ voitures.service.js
│  ├─ interventions.service.js
│  └─ factures.service.js
│
├─ renderer/
│  ├─ index.html
│  ├─ renderer.js
│  └─ styles.css
│
├─ main.js
└─ preload.js
```

---

## Rôle des fichiers principaux

### `main.js`

Le fichier `main.js` correspond au processus Main.

Il sert à :

- démarrer l’application Electron ;
- créer la fenêtre principale ;
- charger la page HTML ;
- déclarer les canaux IPC ;
- appeler les services métier ;
- accéder au système de fichiers ;
- afficher les notifications système ;
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

Mais il ne peut pas utiliser directement `fs`, `path`, `require` ou d’autres modules Node.js.

---

### `renderer/index.html`

Ce fichier contient la structure de l’interface utilisateur.

Il contient notamment :

- le formulaire d’ajout d’une voiture ;
- le formulaire de modification ;
- la liste des voitures ;
- la section des interventions ;
- le dashboard ;
- la barre de recherche ;
- le filtre par statut ;
- la modale de confirmation ;
- le conteneur des notifications visuelles.

---

### `renderer/renderer.js`

Ce fichier contient la logique côté interface.

Il sert à :

- écouter les clics utilisateur ;
- récupérer les valeurs des formulaires ;
- appeler les fonctions exposées par `window.electronAPI` ;
- afficher les voitures ;
- afficher les interventions ;
- mettre à jour le dashboard ;
- gérer les filtres ;
- gérer la recherche ;
- afficher les toasts ;
- gérer la modale de confirmation ;
- déclencher l’export de facture.

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
- modale personnalisée ;
- notifications visuelles.

---

## Sécurité Electron

L’application utilise une configuration sécurisée :

```js
contextIsolation: true,
nodeIntegration: false
```

Cela signifie que le Renderer ne peut pas accéder directement à Node.js.

Cette configuration évite qu’un script exécuté dans la page puisse accéder directement au système de fichiers ou à des données sensibles.

Les accès au système de fichiers sont faits uniquement côté Main, via les services.

---

## Communication IPC

L’application utilise l’IPC pour faire communiquer le Renderer avec le Main.

Le principe est le suivant :

```txt
renderer.js
→ window.electronAPI
→ preload.js
→ ipcRenderer.invoke()
→ main.js
→ ipcMain.handle()
→ service
→ retour vers le Renderer
```

---

## Canaux IPC utilisés

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
| Lister les interventions d’une voiture | `interventions:lister-par-voiture` | ID voiture | Interventions + total |
| Ajouter une intervention | `interventions:ajouter` | Objet intervention | Intervention créée |
| Supprimer une intervention | `interventions:supprimer` | ID intervention | Succès |
| Calculer le total global | `interventions:total-global` | Aucun | Total global |

---

### Factures

| Action | Canal IPC | Paramètres | Retour |
|---|---|---|---|
| Exporter une facture | `factures:exporter` | ID voiture | Fichier HTML exporté |

---

### Notifications

| Action | Canal IPC | Paramètres | Retour |
|---|---|---|---|
| Envoyer une notification | `notifications:envoyer` | Titre + message | Succès |

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
prix_reparation
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
  "prix": 8000,
  "prix_reparation": 450
}
```

---

## Intervention

Une intervention est liée à une voiture grâce au champ `voiture_id`.

```txt
id
voiture_id
description
prix
```

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

---

## Stockage des données

Les données sont stockées localement dans deux fichiers JSON.

### Voitures

```txt
src/data/voitures.json
```

### Interventions

```txt
src/data/interventions.json
```

Ce choix permet de conserver les données même après la fermeture de l’application.

---

## Services métier

## `voitures.service.js`

Ce service gère toute la logique liée aux voitures.

Il contient notamment :

- lecture du fichier `voitures.json` ;
- écriture dans le fichier `voitures.json` ;
- génération d’un nouvel ID ;
- liste des voitures ;
- ajout d’une voiture ;
- modification d’une voiture ;
- suppression d’une voiture ;
- validation des données.

---

## `interventions.service.js`

Ce service gère toute la logique liée aux interventions.

Il contient notamment :

- lecture du fichier `interventions.json` ;
- écriture dans le fichier `interventions.json` ;
- génération d’un nouvel ID ;
- ajout d’une intervention ;
- suppression d’une intervention ;
- liste des interventions d’une voiture ;
- calcul du total des interventions d’une voiture ;
- calcul du total global des interventions ;
- suppression des interventions liées à une voiture.

---

## `factures.service.js`

Ce service gère la génération de facture.

Il permet de générer une facture HTML à partir :

- des informations de la voiture ;
- des interventions liées à cette voiture ;
- du total à payer.

La facture peut ensuite être exportée depuis l’application.

---

## Suppression en cascade

Lorsqu’une voiture est supprimée, les interventions liées à cette voiture sont également supprimées.

Cela évite de garder dans `interventions.json` des interventions associées à une voiture qui n’existe plus.

---

## Dashboard

Le dashboard affiche :

- le nombre total de voitures ;
- le nombre de voitures reçues ;
- le nombre de voitures en réparation ;
- le nombre de voitures prêtes ;
- le nombre de voitures livrées ;
- le total des réparations déclarées ;
- le total global des interventions.

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

---

## Export de facture

Chaque carte voiture possède un bouton `Facture`.

Ce bouton permet d’exporter une facture au format HTML.

La facture contient :

- les informations du véhicule ;
- le client ;
- l’immatriculation ;
- la liste des interventions ;
- le total à payer.

Le fichier HTML peut ensuite être ouvert dans un navigateur ou imprimé en PDF.

---

## Notifications

L’application utilise deux types de notifications :

### Notifications visuelles

Des messages apparaissent dans l’interface sous forme de toasts.

Exemples :

- voiture ajoutée ;
- voiture modifiée ;
- intervention ajoutée ;
- facture exportée ;
- erreur.

### Notifications système

L’application peut aussi envoyer des notifications système via Electron.

Elles sont déclenchées après certaines actions importantes.

---

## Lancement du projet

Installer les dépendances :

```bash
npm install
```

Lancer l’application :

```bash
npm start
```

---

## Tests à effectuer

Pour valider l’application, il faut tester :

```txt
1. Lancement de l’application
2. Affichage de window.electronAPI
3. Ajout d’une voiture
4. Affichage des voitures sous forme de cartes
5. Modification d’une voiture
6. Changement de statut
7. Affichage des badges de statut
8. Recherche d’une voiture
9. Filtre par statut
10. Ajout d’une intervention
11. Calcul du total d’une voiture
12. Calcul du total global du garage
13. Suppression d’une intervention
14. Suppression d’une voiture
15. Vérification de la suppression en cascade
16. Export d’une facture HTML
17. Ouverture de la facture exportée
18. Affichage des notifications
```

---

## Jalons réalisés

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

## Bonus réalisés

Les bonus réalisés sont :

- persistance JSON ;
- factorisation en services ;
- modèles séparés ;
- suppression en cascade ;
- validation métier ;
- interface moderne ;
- dashboard ;
- recherche ;
- filtre par statut ;
- total global garage ;
- notifications visuelles ;
- notifications système ;
- modale de confirmation personnalisée ;
- export de facture HTML.

---

## Conclusion

Garage Manager est une application Electron complète qui respecte la séparation entre le Main process, le Preload et le Renderer.

Le projet montre l’utilisation de l’IPC, la sécurisation de l’accès à Node.js, la gestion de données locales en JSON, la factorisation en services et la création d’une interface utilisateur moderne.

L’application est fonctionnelle et couvre les principaux besoins d’un petit outil de gestion de garage.