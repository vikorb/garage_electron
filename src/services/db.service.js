const fs = require('fs');
const path = require('path');

const Database = require('better-sqlite3');
const { app } = require('electron');

let db = null;

function getDatabasePath() {
  return path.join(app.getPath('userData'), 'garage.db');
}

function getDb() {
  if (!db) {
    db = new Database(getDatabasePath());

    db.pragma('journal_mode = WAL');

    db.pragma('foreign_keys = ON');

    initialiserSchema();
    migrerJsonVersSqliteSiNecessaire();
  }

  return db;
}

function initialiserSchema() {
  db.exec(`
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
  `);
}

function compterLignes(table) {
  const resultat = db.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get();
  return Number(resultat.total || 0);
}

function lireJsonDev(nomFichier) {
  // Migration de confort pour récupérer les seeds déjà créées en dev.
  // En production, ce fichier peut ne pas exister : dans ce cas on retourne [].
  const chemin = path.join(__dirname, '..', 'data', nomFichier);

  if (!fs.existsSync(chemin)) {
    return [];
  }

  const contenu = fs.readFileSync(chemin, 'utf-8');

  if (!contenu.trim()) {
    return [];
  }

  return JSON.parse(contenu);
}

function migrerJsonVersSqliteSiNecessaire() {
  const nbVoitures = compterLignes('voitures');
  const nbInterventions = compterLignes('interventions');

  // On évite de réimporter les seeds à chaque lancement.
  if (nbVoitures > 0 || nbInterventions > 0) {
    return;
  }

  const voitures = lireJsonDev('voitures.json');
  const interventions = lireJsonDev('interventions.json');

  if (voitures.length === 0 && interventions.length === 0) {
    return;
  }

  const transaction = db.transaction(() => {
    const insertVoiture = db.prepare(`
      INSERT INTO voitures (
        id,
        immatriculation,
        marque,
        modele,
        nom_client,
        statut,
        description,
        prix
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    voitures.forEach((voiture) => {
      insertVoiture.run(
        Number(voiture.id),
        voiture.immatriculation || '',
        voiture.marque,
        voiture.modele,
        voiture.nom_client || '',
        Number(voiture.statut || 1),
        voiture.description || '',
        Number(voiture.prix || 0)
      );
    });

    const insertIntervention = db.prepare(`
      INSERT INTO interventions (
        id,
        voiture_id,
        description,
        prix
      )
      VALUES (?, ?, ?, ?)
    `);

    interventions.forEach((intervention) => {
      insertIntervention.run(
        Number(intervention.id),
        Number(intervention.voiture_id),
        intervention.description,
        Number(intervention.prix || 0)
      );
    });

    // On remet les compteurs AUTOINCREMENT après migration avec IDs imposés.
    db.prepare(`
      INSERT OR REPLACE INTO sqlite_sequence (name, seq)
      VALUES ('voitures', ?)
    `).run(Math.max(0, ...voitures.map((voiture) => Number(voiture.id || 0))));

    db.prepare(`
      INSERT OR REPLACE INTO sqlite_sequence (name, seq)
      VALUES ('interventions', ?)
    `).run(Math.max(0, ...interventions.map((intervention) => Number(intervention.id || 0))));
  });

  transaction();
}

function initialiserBase() {
  getDb();
}

module.exports = {
  getDb,
  initialiserBase,
  getDatabasePath
};