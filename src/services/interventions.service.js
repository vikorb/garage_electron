const fs = require('fs');
const path = require('path');

const { creerIntervention } = require('../models/intervention.model');
const { listerVoitures } = require('./voitures.service');

const interventionsFilePath = path.join(__dirname, '../data/interventions.json');

const TAUX_TVA = 0.2;

function verifierFichierInterventions() {
  const dossierData = path.dirname(interventionsFilePath);

  if (!fs.existsSync(dossierData)) {
    fs.mkdirSync(dossierData, { recursive: true });
  }

  if (!fs.existsSync(interventionsFilePath)) {
    fs.writeFileSync(interventionsFilePath, '[]', 'utf-8');
  }
}

function lireInterventions() {
  verifierFichierInterventions();

  const contenu = fs.readFileSync(interventionsFilePath, 'utf-8');

  if (!contenu.trim()) {
    return [];
  }

  return JSON.parse(contenu);
}

function ecrireInterventions(interventions) {
  verifierFichierInterventions();

  fs.writeFileSync(
    interventionsFilePath,
    JSON.stringify(interventions, null, 2),
    'utf-8'
  );
}

function genererNouvelId(interventions) {
  if (interventions.length === 0) {
    return 1;
  }

  const ids = interventions.map((intervention) => Number(intervention.id));
  return Math.max(...ids) + 1;
}

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
  const voitures = listerVoitures();
  const idNombre = Number(voitureId);

  const voitureExiste = voitures.some(
    (voiture) => Number(voiture.id) === idNombre
  );

  if (!voitureExiste) {
    throw new Error('Voiture introuvable.');
  }
}

function listerInterventionsParVoiture(voitureId) {
  verifierVoitureExiste(voitureId);

  const idNombre = Number(voitureId);
  const interventions = lireInterventions();

  const interventionsVoiture = interventions.filter(
    (intervention) => Number(intervention.voiture_id) === idNombre
  );

  const montants = calculerMontantsDepuisInterventions(interventionsVoiture);

  return {
    interventions: interventionsVoiture,
    ...montants
  };
}

function ajouterIntervention(donneesIntervention) {
  const interventions = lireInterventions();

  const voitureId = Number(donneesIntervention.voiture_id);

  verifierVoitureExiste(voitureId);

  if (!donneesIntervention.description || !donneesIntervention.description.trim()) {
    throw new Error('La description est obligatoire.');
  }

  const prix = Number(donneesIntervention.prix || 0);

  if (Number.isNaN(prix)) {
    throw new Error('Le prix doit être un nombre.');
  }

  const nouvelleIntervention = creerIntervention({
    id: genererNouvelId(interventions),
    voiture_id: voitureId,
    description: donneesIntervention.description.trim(),
    prix
  });

  interventions.push(nouvelleIntervention);
  ecrireInterventions(interventions);

  return nouvelleIntervention;
}

function modifierIntervention(id, donneesIntervention) {
  const interventions = lireInterventions();
  const idNombre = Number(id);

  const indexIntervention = interventions.findIndex(
    (intervention) => Number(intervention.id) === idNombre
  );

  if (indexIntervention === -1) {
    throw new Error('Intervention introuvable.');
  }

  const interventionActuelle = interventions[indexIntervention];

  const voitureId = Number(donneesIntervention.voiture_id || interventionActuelle.voiture_id);

  verifierVoitureExiste(voitureId);

  if (!donneesIntervention.description || !donneesIntervention.description.trim()) {
    throw new Error('La description est obligatoire.');
  }

  const prix = Number(donneesIntervention.prix || 0);

  if (Number.isNaN(prix)) {
    throw new Error('Le prix doit être un nombre.');
  }

  const interventionModifiee = creerIntervention({
    id: interventionActuelle.id,
    voiture_id: voitureId,
    description: donneesIntervention.description.trim(),
    prix
  });

  interventions[indexIntervention] = interventionModifiee;
  ecrireInterventions(interventions);

  return interventionModifiee;
}

function supprimerIntervention(id) {
  const interventions = lireInterventions();
  const idNombre = Number(id);

  const interventionExiste = interventions.some(
    (intervention) => Number(intervention.id) === idNombre
  );

  if (!interventionExiste) {
    throw new Error('Intervention introuvable.');
  }

  const interventionsMiseAJour = interventions.filter(
    (intervention) => Number(intervention.id) !== idNombre
  );

  ecrireInterventions(interventionsMiseAJour);

  return {
    success: true,
    id: idNombre
  };
}

function supprimerInterventionsParVoiture(voitureId) {
  const interventions = lireInterventions();
  const idNombre = Number(voitureId);

  const interventionsMiseAJour = interventions.filter(
    (intervention) => Number(intervention.voiture_id) !== idNombre
  );

  ecrireInterventions(interventionsMiseAJour);

  return {
    success: true,
    voiture_id: idNombre
  };
}

function calculerTotalInterventionsGarage() {
  const interventions = lireInterventions();
  const montants = calculerMontantsDepuisInterventions(interventions);

  return {
    ...montants,
    nombre: interventions.length
  };
}

function calculerTotauxInterventionsParVoiture() {
  const voitures = listerVoitures();
  const interventions = lireInterventions();

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
  lireInterventions,
  ecrireInterventions,
  listerInterventionsParVoiture,
  ajouterIntervention,
  modifierIntervention,
  supprimerIntervention,
  supprimerInterventionsParVoiture,
  calculerTotalInterventionsGarage,
  calculerTotauxInterventionsParVoiture
};