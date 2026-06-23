export function formaterPrix(valeur) {
  return `${Number(valeur || 0).toFixed(2)} €`;
}

export function normaliserTexte(valeur) {
  return String(valeur || '').toLowerCase().trim();
}