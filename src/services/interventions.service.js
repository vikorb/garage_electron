const { getDb } = require('./db.service');
const { trouverVoitureParId } = require('./voitures.service');

const TAUX_TVA = 0.2;

function arrondirPrix(valeur) {
  return Math.round((Number(valeur || 0) + Number.EPSILON) * 100) / 100;
}

function calculerMontantsDepuisInterventions(interventions) {
  const total_ht = interventions.reduce(
    (somme, intervention) => somme + Number(intervention.prix || 0),
    0
  );

  const tva = arrondirPrix(total_ht * TAUX_TVA);
  const total_ttc = arrondirPrix(total_ht + tva);

  return {
    total_ht: arrondirPrix(total_ht),
    tva,
    total_ttc,
    taux_tva: TAUX_TVA
  };
}

function verifierVoitureExiste(voitureId) {
  const voiture = trouverVoitureParId(Number(voitureId));

  if (!voiture) {
    throw new Error('Voiture introuvable.');
  }
}

function validerDonneesIntervention(donneesIntervention) {
  const voitureId = Number(donneesIntervention.voiture_id);

  verifierVoitureExiste(voitureId);

  if (!donneesIntervention.description || !donneesIntervention.description.trim()) {
    throw new Error('La description est obligatoire.');
  }

  const prix = Number(donneesIntervention.prix || 0);

  if (Number.isNaN(prix)) {
    throw new Error('Le prix doit être un nombre.');
  }

  return {
    voiture_id: voitureId,
    description: donneesIntervention.description.trim(),
    prix
  };
}

function trouverInterventionParId(id) {
  const db = getDb();

  return db.prepare(`
    SELECT
      id,
      voiture_id,
      description,
      prix,
      created_at,
      updated_at
    FROM interventions
    WHERE id = ?
  `).get(Number(id));
}

function listerInterventionsParVoiture(voitureId) {
  const db = getDb();
  const idNombre = Number(voitureId);

  verifierVoitureExiste(idNombre);

  const interventions = db.prepare(`
    SELECT
      id,
      voiture_id,
      description,
      prix,
      created_at,
      updated_at
    FROM interventions
    WHERE voiture_id = ?
    ORDER BY id DESC
  `).all(idNombre);

  const montants = calculerMontantsDepuisInterventions(interventions);

  return {
    interventions,
    ...montants
  };
}

function ajouterIntervention(donneesIntervention) {
  const db = getDb();
  const donneesValidees = validerDonneesIntervention(donneesIntervention);

  const resultat = db.prepare(`
    INSERT INTO interventions (
      voiture_id,
      description,
      prix
    )
    VALUES (?, ?, ?)
  `).run(
    donneesValidees.voiture_id,
    donneesValidees.description,
    donneesValidees.prix
  );

  return trouverInterventionParId(resultat.lastInsertRowid);
}

function modifierIntervention(id, donneesIntervention) {
  const db = getDb();
  const idNombre = Number(id);

  const interventionExistante = trouverInterventionParId(idNombre);

  if (!interventionExistante) {
    throw new Error('Intervention introuvable.');
  }

  const donneesFusionnees = {
    ...interventionExistante,
    ...donneesIntervention
  };

  const donneesValidees = validerDonneesIntervention(donneesFusionnees);

  db.prepare(`
    UPDATE interventions
    SET
      voiture_id = ?,
      description = ?,
      prix = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    donneesValidees.voiture_id,
    donneesValidees.description,
    donneesValidees.prix,
    idNombre
  );

  return trouverInterventionParId(idNombre);
}

function supprimerIntervention(id) {
  const db = getDb();
  const idNombre = Number(id);

  const interventionExistante = trouverInterventionParId(idNombre);

  if (!interventionExistante) {
    throw new Error('Intervention introuvable.');
  }

  db.prepare(`
    DELETE FROM interventions
    WHERE id = ?
  `).run(idNombre);

  return {
    success: true,
    id: idNombre
  };
}

function supprimerInterventionsParVoiture(voitureId) {
  const db = getDb();
  const idNombre = Number(voitureId);

  db.prepare(`
    DELETE FROM interventions
    WHERE voiture_id = ?
  `).run(idNombre);

  return {
    success: true,
    voiture_id: idNombre
  };
}

function calculerTotalInterventionsGarage() {
  const db = getDb();

  const interventions = db.prepare(`
    SELECT prix
    FROM interventions
  `).all();

  const montants = calculerMontantsDepuisInterventions(interventions);

  return {
    ...montants,
    nombre: interventions.length
  };
}

function calculerTotauxInterventionsParVoiture() {
  const db = getDb();

  const voitures = db.prepare(`
    SELECT id
    FROM voitures
  `).all();

  const interventions = db.prepare(`
    SELECT voiture_id, prix
    FROM interventions
  `).all();

  const totaux = {};

  voitures.forEach((voiture) => {
    const interventionsVoiture = interventions.filter(
      (intervention) => Number(intervention.voiture_id) === Number(voiture.id)
    );

    totaux[voiture.id] = calculerMontantsDepuisInterventions(interventionsVoiture);
  });

  return totaux;
}

module.exports = {
  listerInterventionsParVoiture,
  ajouterIntervention,
  modifierIntervention,
  supprimerIntervention,
  supprimerInterventionsParVoiture,
  calculerTotalInterventionsGarage,
  calculerTotauxInterventionsParVoiture
};