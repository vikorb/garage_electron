const fs = require('fs');
const path = require('path');

const { creerVoiture, STATUTS_VOITURE } = require('../models/voiture.model');

const voituresFilePath = path.join(__dirname, '../data/voitures.json');

const STATUTS_VALIDES = [
  STATUTS_VOITURE.RECU,
  STATUTS_VOITURE.EN_REPARATION,
  STATUTS_VOITURE.PRETE,
  STATUTS_VOITURE.LIVRE
];

function verifierFichierVoitures() {
  const dossierData = path.dirname(voituresFilePath);

  if (!fs.existsSync(dossierData)) {
    fs.mkdirSync(dossierData, { recursive: true });
  }

  if (!fs.existsSync(voituresFilePath)) {
    fs.writeFileSync(voituresFilePath, '[]', 'utf-8');
  }
}

function lireVoitures() {
  verifierFichierVoitures();

  const contenu = fs.readFileSync(voituresFilePath, 'utf-8');

  if (!contenu.trim()) {
    return [];
  }

  return JSON.parse(contenu);
}

function ecrireVoitures(voitures) {
  verifierFichierVoitures();

  fs.writeFileSync(
    voituresFilePath,
    JSON.stringify(voitures, null, 2),
    'utf-8'
  );
}

function genererNouvelId(voitures) {
  if (voitures.length === 0) {
    return 1;
  }

  const ids = voitures.map((voiture) => Number(voiture.id));
  return Math.max(...ids) + 1;
}

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

  const statut = Number(donneesVoiture.statut || STATUTS_VOITURE.RECU);

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
    prix: convertirNombre(donneesVoiture.prix, 'Le prix'),
    prix_reparation: convertirNombre(donneesVoiture.prix_reparation, 'Le prix de réparation')
  };
}

function listerVoitures() {
  return lireVoitures();
}

function ajouterVoiture(donneesVoiture) {
  const voitures = lireVoitures();

  const donneesValidees = validerDonneesVoiture(donneesVoiture);

  const nouvelleVoiture = creerVoiture({
    id: genererNouvelId(voitures),
    ...donneesValidees
  });

  voitures.push(nouvelleVoiture);
  ecrireVoitures(voitures);

  return nouvelleVoiture;
}

function supprimerVoiture(id) {
  const voitures = lireVoitures();
  const idNombre = Number(id);

  const voitureExiste = voitures.some((voiture) => Number(voiture.id) === idNombre);

  if (!voitureExiste) {
    throw new Error('Voiture introuvable.');
  }

  const voituresMiseAJour = voitures.filter((voiture) => Number(voiture.id) !== idNombre);

  ecrireVoitures(voituresMiseAJour);

  return {
    success: true,
    id: idNombre
  };
}

function modifierVoiture(id, donneesVoiture) {
  const voitures = lireVoitures();
  const idNombre = Number(id);

  const indexVoiture = voitures.findIndex((voiture) => Number(voiture.id) === idNombre);

  if (indexVoiture === -1) {
    throw new Error('Voiture introuvable.');
  }

  const voitureActuelle = voitures[indexVoiture];

  const donneesFusionnees = {
    ...voitureActuelle,
    ...donneesVoiture
  };

  const donneesValidees = validerDonneesVoiture(donneesFusionnees);

  const voitureModifiee = creerVoiture({
    id: voitureActuelle.id,
    ...donneesValidees
  });

  voitures[indexVoiture] = voitureModifiee;

  ecrireVoitures(voitures);

  return voitureModifiee;
}

module.exports = {
  lireVoitures,
  ecrireVoitures,
  genererNouvelId,
  listerVoitures,
  ajouterVoiture,
  supprimerVoiture,
  modifierVoiture
};