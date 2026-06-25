const { getDb } = require('./db.service');

const STATUTS_VALIDES = [1, 2, 3, 4];

function convertirNombre(valeur, nomChamp) {
  const nombre = Number(valeur || 0);

  if (Number.isNaN(nombre)) {
    throw new Error(`${nomChamp} doit être un nombre.`);
  }

  return nombre;
}

function validerDonneesVoiture(donneesVoiture) {
  if (!donneesVoiture.marque || !donneesVoiture.marque.trim()) {
    throw new Error('La marque est obligatoire.');
  }

  if (!donneesVoiture.modele || !donneesVoiture.modele.trim()) {
    throw new Error('Le modèle est obligatoire.');
  }

  const statut = Number(donneesVoiture.statut || 1);

  if (!STATUTS_VALIDES.includes(statut)) {
    throw new Error('Le statut est invalide.');
  }

  return {
    immatriculation: donneesVoiture.immatriculation || '',
    marque: donneesVoiture.marque.trim(),
    modele: donneesVoiture.modele.trim(),
    nom_client: donneesVoiture.nom_client || '',
    statut,
    description: donneesVoiture.description || '',
    prix: convertirNombre(donneesVoiture.prix, 'Le prix')
  };
}

function construireFiltresSql(filtres = {}) {
  const conditions = [];
  const parametres = [];

  const recherche = String(filtres.recherche || '').trim().toLowerCase();
  const statut = filtres.statut;

  if (statut && statut !== 'tous') {
    const statutNombre = Number(statut);

    if (STATUTS_VALIDES.includes(statutNombre)) {
      conditions.push('statut = ?');
      parametres.push(statutNombre);
    }
  }

  if (recherche) {
    const rechercheLike = `%${recherche}%`;

    conditions.push(`
      (
        CAST(id AS TEXT) LIKE ?
        OR LOWER(immatriculation) LIKE ?
        OR LOWER(marque) LIKE ?
        OR LOWER(modele) LIKE ?
        OR LOWER(nom_client) LIKE ?
        OR LOWER(description) LIKE ?
      )
    `);

    parametres.push(
      rechercheLike,
      rechercheLike,
      rechercheLike,
      rechercheLike,
      rechercheLike,
      rechercheLike
    );
  }

  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    parametres
  };
}

function listerVoitures(filtres = {}) {
  const db = getDb();

  const { where, parametres } = construireFiltresSql(filtres);

  return db.prepare(`
    SELECT
      id,
      immatriculation,
      marque,
      modele,
      nom_client,
      statut,
      description,
      prix,
      created_at,
      updated_at
    FROM voitures
    ${where}
    ORDER BY id DESC
  `).all(...parametres);
}

function trouverVoitureParId(id) {
  const db = getDb();

  return db.prepare(`
    SELECT
      id,
      immatriculation,
      marque,
      modele,
      nom_client,
      statut,
      description,
      prix,
      created_at,
      updated_at
    FROM voitures
    WHERE id = ?
  `).get(Number(id));
}

function ajouterVoiture(donneesVoiture) {
  const db = getDb();
  const donneesValidees = validerDonneesVoiture(donneesVoiture);

  const resultat = db.prepare(`
    INSERT INTO voitures (
      immatriculation,
      marque,
      modele,
      nom_client,
      statut,
      description,
      prix
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    donneesValidees.immatriculation,
    donneesValidees.marque,
    donneesValidees.modele,
    donneesValidees.nom_client,
    donneesValidees.statut,
    donneesValidees.description,
    donneesValidees.prix
  );

  return trouverVoitureParId(resultat.lastInsertRowid);
}

function modifierVoiture(id, donneesVoiture) {
  const db = getDb();
  const idNombre = Number(id);

  const voitureExistante = trouverVoitureParId(idNombre);

  if (!voitureExistante) {
    throw new Error('Voiture introuvable.');
  }

  const donneesFusionnees = {
    ...voitureExistante,
    ...donneesVoiture
  };

  const donneesValidees = validerDonneesVoiture(donneesFusionnees);

  db.prepare(`
    UPDATE voitures
    SET
      immatriculation = ?,
      marque = ?,
      modele = ?,
      nom_client = ?,
      statut = ?,
      description = ?,
      prix = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    donneesValidees.immatriculation,
    donneesValidees.marque,
    donneesValidees.modele,
    donneesValidees.nom_client,
    donneesValidees.statut,
    donneesValidees.description,
    donneesValidees.prix,
    idNombre
  );

  return trouverVoitureParId(idNombre);
}

function supprimerVoiture(id) {
  const db = getDb();
  const idNombre = Number(id);

  const voitureExistante = trouverVoitureParId(idNombre);

  if (!voitureExistante) {
    throw new Error('Voiture introuvable.');
  }

  db.prepare(`
    DELETE FROM voitures
    WHERE id = ?
  `).run(idNombre);

  return {
    success: true,
    id: idNombre
  };
}

module.exports = {
  listerVoitures,
  trouverVoitureParId,
  ajouterVoiture,
  modifierVoiture,
  supprimerVoiture
};