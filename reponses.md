# Réponses — TP Electron

---

# TP Electron — Chapitre 1

## Partie 1 — Théorie & compréhension

## A. Questions de cours

### 1. Expliquez en 2 phrases ce qu'est l'IPC, et pourquoi il existe

IPC signifie **Inter-Process Communication**, c’est-à-dire communication entre processus.

Dans Electron, l’IPC permet au **Renderer** et au **Main process** d’échanger des messages. Cela existe surtout pour des raisons de sécurité : la page ne doit pas accéder directement à Node.js, au système de fichiers ou aux données sensibles. Elle doit passer par le Main pour demander les actions nécessaires.

---

### 2. Une app Electron a deux types de processus. Lequel a accès à Node.js / au système ? Lequel affiche l'interface ?

Le **Main process** a accès à Node.js et au système.

Le **Renderer process** affiche l’interface utilisateur avec HTML, CSS et JavaScript. Il n’a pas accès directement à Node.js si la configuration de sécurité est correcte.

---

### 3. Donnez le rôle, en une ligne chacun, de : `package.json`, `main.js`, `preload.js`, le fichier de la page

- `package.json` : contient la configuration du projet, les dépendances, les scripts npm et le point d’entrée de l’application.
- `main.js` : démarre l’application, crée la fenêtre Electron et gère la logique côté Main.
- `preload.js` : expose une API sécurisée entre le Renderer et le Main.
- Fichier de la page (`index.html` / `renderer.js`) : affiche l’interface et gère les actions utilisateur côté Renderer.

---

### 4. À quoi sert `contextBridge` ? Que se passerait-il si on mettait `nodeIntegration: true` ?

`contextBridge` permet d’exposer dans la page uniquement les fonctions choisies, par exemple dans `window.electronAPI`.

Il sert à faire communiquer le Renderer avec le Main sans donner accès à tout Node.js.

Si on mettait `nodeIntegration: true`, la page pourrait utiliser directement Node.js avec `require`, `fs`, etc. Ce serait dangereux, car un script malveillant pourrait lire, modifier ou supprimer des fichiers.

La configuration sécurisée est donc :

```js
contextIsolation: true,
nodeIntegration: false
```

---

### 5. Quelle est la différence entre `invoke/handle` et `send/on` ? Donnez un exemple d'usage pour chacun.

`invoke/handle` sert quand le Renderer demande quelque chose au Main et attend une réponse.

Exemple :

```js
ipcRenderer.invoke('charger-voitures');

ipcMain.handle('charger-voitures', () => {
  return chargerVoitures();
});
```

`send/on` sert quand un processus envoie une information sans forcément attendre de réponse.

Exemple :

```js
win.webContents.send('progression-import', 50);

ipcRenderer.on('progression-import', (event, pourcentage) => {
  console.log(pourcentage);
});
```

---

### 6. C'est quoi un canal dans l'IPC ? Quelle règle absolue le concerne ?

Un canal IPC est le nom du message utilisé pour communiquer entre le Renderer, le preload et le Main.

On peut le comparer à une route d’API.

La règle absolue est que le nom du canal doit être strictement identique des deux côtés.

Exemple correct :

```js
ipcRenderer.invoke('charger-voitures');

ipcMain.handle('charger-voitures', () => {});
```

Exemple incorrect :

```js
ipcRenderer.invoke('charger-voitures');

ipcMain.handle('charger-voiture', () => {});
```

---

## B. Le bon outil pour le bon besoin

### 1. La page veut afficher la liste des voitures du garage

Réponse : `invoke/handle`.

Justification : la page demande une information au Main et attend une réponse.

---

### 2. Une sauvegarde longue est terminée → l'app veut afficher « Sauvegardé ✅ » toute seule

Réponse : `send/on`.

Justification : le Main peut prévenir la page quand la sauvegarde est terminée.

---

### 3. L'utilisateur clique « Supprimer » et veut savoir si ça a réussi

Réponse : `invoke/handle`.

Justification : la page demande une suppression au Main et attend une réponse pour savoir si l’action a réussi.

---

### 4. Un import de fichier avance et veut mettre à jour une barre de progression en direct

Réponse : `send/on`.

Justification : le Main peut envoyer régulièrement l’avancement à la page.

---

## C. Trouvez le bug

## C1 — Au clic, rien ne revient

### Code donné

```js
// preload.js
chargerVoitures: () => ipcRenderer.invoke('charger-voitures'),

// main.js
// ... createWindow(), app.whenReady() ...
// (rien d'autre)

// app.js
const liste = await window.electronAPI.chargerVoitures();
```

### Problème

Le preload appelle le canal :

```js
'charger-voitures'
```

Mais le Main n’a aucun `ipcMain.handle` correspondant.

La page attend donc une réponse qui n’arrive jamais.

### Correction

```js
ipcMain.handle('charger-voitures', () => {
  return chargerVoitures();
});
```

---

## C2 — Le bouton « Ajouter » ne fait rien du tout

### Code donné

```js
// preload.js
ajouterVoiture: (v) => ipcRenderer.invoke('ajouter-voiture', v),

// main.js
ipcMain.handle('ajout-voiture', (e, v) => { /* ... */ });
```

### Problème

Les noms des canaux ne sont pas identiques.

Dans le preload :

```js
'ajouter-voiture'
```

Dans le Main :

```js
'ajout-voiture'
```

Electron considère que ce sont deux canaux différents.

### Correction

```js
// preload.js
ajouterVoiture: (v) => ipcRenderer.invoke('ajouter-voiture', v),

// main.js
ipcMain.handle('ajouter-voiture', (e, v) => {
  // logique d'ajout
});
```

---

## C3 — L'écran affiche `[object Promise]`

### Code donné

```js
// app.js
const liste = window.electronAPI.chargerVoitures();
zone.textContent = liste;
```

### Problème

`chargerVoitures()` renvoie une Promise, car elle utilise `invoke`.

Comme il manque `await`, la page affiche l’objet Promise au lieu du résultat.

### Correction

```js
const liste = await window.electronAPI.chargerVoitures();
zone.textContent = JSON.stringify(liste, null, 2);
```

---

## C4 — `window.electronAPI` est `undefined` dans la page

### Code donné

```js
// main.js
const win = new BrowserWindow({
  width: 900, height: 600
  // webPreferences ... ?
});
win.loadFile('index.html');
```

### Problème

Le preload n’est pas branché dans la fenêtre.

Donc `contextBridge` ne peut pas exposer `window.electronAPI`.

### Correction

```js
const path = require('path');

const win = new BrowserWindow({
  width: 900,
  height: 600,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false
  }
});

win.loadFile('index.html');
```

---

## C5 — Ça « marche »… mais c'est une faille de sécurité

### Code donné

```js
// main.js
const win = new BrowserWindow({
  webPreferences: { nodeIntegration: true, contextIsolation: false }
});

// ... et dans la page :
const fs = require('fs');
fs.readFileSync(...);
```

### Problème

Le Renderer a accès directement à Node.js.

C’est une faille de sécurité, car la page peut utiliser `fs`, lire des fichiers ou modifier le système.

### Correction

Il faut garder :

```js
contextIsolation: true,
nodeIntegration: false
```

Puis exposer uniquement les fonctions nécessaires dans `preload.js`.

Exemple :

```js
contextBridge.exposeInMainWorld('electronAPI', {
  chargerVoitures: () => ipcRenderer.invoke('charger-voitures')
});
```

---

## D. Schéma — Trajet complet d'un clic sur « Ajouter une voiture »

```mermaid
sequenceDiagram
    participant Page as Page / Renderer<br/>renderer.js
    participant Preload as Preload<br/>preload.js
    participant Main as Main process<br/>main.js
    participant Service as Service<br/>voitures.service.js
    participant Fichier as Fichier<br/>voitures.json

    Page->>Page: 1. L'utilisateur clique sur "Ajouter une voiture"
    Page->>Page: 2. Le formulaire récupère les données
    Page->>Preload: 3. window.electronAPI.ajouterVoiture(voiture)
    Preload->>Main: 4. ipcRenderer.invoke("voitures:ajouter", voiture)
    Main->>Service: 5. ipcMain.handle("voitures:ajouter")
    Service->>Fichier: 6. Lit les voitures existantes
    Fichier-->>Service: 7. Renvoie les voitures
    Service->>Service: 8. Ajoute la nouvelle voiture
    Service->>Fichier: 9. Sauvegarde la liste
    Service-->>Main: 10. Retourne la voiture créée
    Main-->>Preload: 11. Retour IPC
    Preload-->>Page: 12. La Promise se résout
    Page->>Page: 13. L'interface se met à jour
```

Résumé :

1. L’utilisateur clique dans la page.
2. Le Renderer récupère les données.
3. Le Renderer appelle une fonction exposée par le preload.
4. Le preload envoie une demande IPC au Main.
5. Le Main appelle le service.
6. Le service lit et écrit dans le fichier.
7. Le Main renvoie le résultat.
8. Le Renderer met à jour l’interface.

La page ne touche jamais directement au fichier. Tout passe par le Main process via le preload et l’IPC.

---

# TP Electron — Chapitre 2

## Partie 1 — Théorie & compréhension

## A. Questions de cours

### 1. C'est quoi `userData` ? Pourquoi est-ce une mauvaise idée de stocker ses données à côté du code de l'app ?

`userData` est le dossier prévu par Electron pour stocker les données propres à l’application.

On y accède avec :

```js
app.getPath('userData')
```

C’est une mauvaise idée de stocker les données à côté du code de l’application, car une app installée peut être en lecture seule ou rangée dans une archive `asar`.

Si on écrit dans le dossier du code, les données peuvent aussi être perdues ou écrasées lors d’une mise à jour.

La bonne pratique est donc :

```txt
Code de l'application → dossier de l'app
Données utilisateur → userData
```

---

### 2. `electron-store` ou SQLite : pour chacun, donnez un cas où il est le bon choix.

`electron-store` est un bon choix pour stocker de petites données simples.

Exemples :

```txt
- thème choisi
- taille de fenêtre
- préférences utilisateur
- option activée ou désactivée
```

SQLite est un bon choix pour stocker beaucoup de données structurées, avec des relations, des requêtes, des tris et des recherches.

Exemples :

```txt
- voitures
- interventions
- clients
- factures
```

Pour un projet de garage complet, SQLite est plus adapté à long terme.

---

### 3. C'est quoi une requête préparée ? Contre quel risque protège-t-elle ?

Une requête préparée est une requête SQL avec des emplacements réservés, souvent des `?`.

Exemple :

```js
db.prepare('SELECT * FROM voitures WHERE marque = ?').all(marque);
```

La valeur utilisateur est envoyée séparément de la requête SQL.

Cela protège contre les injections SQL.

Mauvais exemple :

```js
db.prepare(`SELECT * FROM voitures WHERE marque = '${marque}'`).all();
```

Si l’utilisateur met du SQL dans `marque`, il peut modifier le comportement de la requête.

---

### 4. Pourquoi vaut-il mieux faire un appel d'API externe depuis le Main plutôt que depuis la page ? Donnez 2 raisons.

Il vaut mieux faire les appels d’API externes depuis le Main pour deux raisons.

Première raison : la sécurité.

Si une clé API est utilisée dans la page, elle peut être visible dans le code front ou dans les DevTools.

Deuxième raison : le contrôle.

Le Main n’est pas une page web classique. Il peut mieux gérer les secrets, les erreurs réseau et les données retournées.

Il évite aussi d’exposer directement l’API ou les clés au Renderer.

Le bon flux est :

```txt
Renderer
→ preload
→ IPC
→ Main
→ API externe
→ Main
→ Renderer
```

---

### 5. Différence entre un raccourci global et un `accelerator` de menu ?

Un `accelerator` est un raccourci clavier associé à une entrée de menu Electron.

Exemple :

```js
{
  label: 'Nouvelle voiture',
  accelerator: 'CmdOrCtrl+N'
}
```

Il fonctionne dans le contexte de l’application.

Un raccourci global est enregistré avec `globalShortcut`.

Exemple :

```js
globalShortcut.register('CommandOrControl+Shift+N', () => {});
```

Il peut fonctionner même quand l’application n’est pas au premier plan.

Un raccourci global doit être désenregistré à la fermeture de l’application.

---

### 6. Que fait `electron-builder` ? Pourquoi l'installeur fait-il environ 100 Mo même pour une petite app ?

`electron-builder` permet de transformer un projet Electron en application installable.

Il peut générer par exemple :

```txt
- un .exe sur Windows
- un .dmg sur macOS
- une AppImage sur Linux
```

L’installeur est lourd même pour une petite application, car il embarque Electron, Chromium, Node.js et les dépendances nécessaires.

Même si le code de l’application est petit, le runtime Electron prend de la place.

---

## B. Trouvez le problème

## B1 — Une faille classique de base de données

### Code donné

```js
// main.js
ipcMain.handle('chercher', (e, terme) => {
  return db.prepare(`SELECT * FROM voitures WHERE marque = '${terme}'`).all();
});
```

### Problème

Le code met directement la valeur `terme` dans la requête SQL.

Un utilisateur peut donc injecter du SQL.

Exemple :

```txt
Renault' OR 1=1 --
```

Cela peut modifier la requête et retourner des données qui ne devraient pas être retournées.

### Correction

Il faut utiliser une requête préparée avec un paramètre :

```js
ipcMain.handle('chercher', (e, terme) => {
  return db.prepare('SELECT * FROM voitures WHERE marque = ?').all(terme);
});
```

---

## B2 — Ça marche en dev, mais l'app installée plante / perd les données

### Code donné

```js
// main.js
const fs = require('fs');

fs.writeFileSync(__dirname + '/voitures.json', JSON.stringify(voitures));
```

### Problème

Le code écrit les données à côté du code de l’application.

En développement, cela peut marcher.

Mais une fois l’application installée, le dossier peut être en lecture seule ou dans une archive `asar`.

Les données peuvent donc ne pas être écrites, être perdues ou être écrasées lors d’une mise à jour.

### Correction

Il faut écrire dans `userData`.

```js
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const filePath = path.join(app.getPath('userData'), 'voitures.json');

fs.writeFileSync(filePath, JSON.stringify(voitures));
```

---

## B3 — La clé API se retrouve exposée

### Code donné

```js
// app.js (la PAGE)
const res = await fetch('https://api.exemple.com/pieces', {
  headers: { Authorization: 'Bearer SK-MA-CLE-SECRETE-123' }
});
```

### Problème

Le code est dans la page, donc côté Renderer.

La clé API est exposée dans le code front et peut être vue dans les DevTools.

### Correction

L’appel API doit être fait côté Main.

La page demande seulement l’action via IPC.

Flux correct :

```txt
Renderer
→ preload
→ IPC
→ Main
→ API externe
```

Exemple :

```js
// preload.js
rechercherPieces: (terme) => ipcRenderer.invoke('pieces:rechercher', terme)
```

```js
// main.js
ipcMain.handle('pieces:rechercher', async (event, terme) => {
  const res = await fetch('https://api.exemple.com/pieces', {
    headers: {
      Authorization: `Bearer ${process.env.API_KEY}`
    }
  });

  return res.json();
});
```

La clé API reste côté Main.

---

## B4 — Un raccourci qui « reste coincé »

### Code donné

```js
// main.js
app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+Shift+N', creerVoiture);
});
```

Il n’y a rien d’autre concernant `globalShortcut`.

### Problème

Le raccourci global est enregistré, mais il n’est jamais désenregistré.

Cela peut créer un comportement indésirable ou garder le raccourci bloqué.

### Correction

Il faut désenregistrer les raccourcis globaux avant de quitter l’application.

```js
const { app, globalShortcut } = require('electron');

app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+Shift+N', creerVoiture);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
```

Pour une action comme “Nouvelle voiture”, un `accelerator` de menu est souvent plus simple et suffisant.