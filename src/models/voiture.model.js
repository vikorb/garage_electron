const STATUTS_VOITURE = {
  RECU: 1,
  EN_REPARATION: 2,
  PRETE: 3,
  LIVRE: 4
};

function creerVoiture({
  id,
  immatriculation = "",
  marque,
  modele,
  nom_client = "",
  statut = STATUTS_VOITURE.RECU,
  description = "",
  prix = 0,
  prix_reparation = 0
}) {
  return {
    id,
    immatriculation,
    marque,
    modele,
    nom_client,
    statut,
    description,
    prix,
    prix_reparation
  };
}

module.exports = {
  STATUTS_VOITURE,
  creerVoiture
};