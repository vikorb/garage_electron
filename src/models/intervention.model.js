function creerIntervention({
  id,
  voiture_id,
  description,
  prix = 0
}) {
  return {
    id,
    voiture_id,
    description,
    prix
  };
}

module.exports = {
  creerIntervention
};