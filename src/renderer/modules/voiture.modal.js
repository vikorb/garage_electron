import { afficherToast, notifierSysteme, ouvrirModal, fermerModal } from './ui.js';

let modalVoiture = null;
let modalVoitureTitre = null;
let formVoiture = null;
let messageVoiture = null;

let onSaved = async () => {};

export function initVoitureModal(options) {
  onSaved = options.onSaved;

  modalVoiture = document.getElementById('modal-voiture');
  modalVoitureTitre = document.getElementById('modal-voiture-titre');
  formVoiture = document.getElementById('form-voiture');
  messageVoiture = document.getElementById('message-voiture');

  document.getElementById('btn-fermer-modal-voiture').addEventListener('click', fermerPopupVoiture);
  document.getElementById('btn-annuler-voiture').addEventListener('click', fermerPopupVoiture);

  formVoiture.addEventListener('submit', enregistrerVoiture);
}

export function ouvrirPopupAjoutVoiture() {
  modalVoitureTitre.textContent = 'Ajouter une voiture';
  messageVoiture.textContent = '';

  formVoiture.reset();

  document.getElementById('voiture-id').value = '';
  document.getElementById('statut').value = 1;

  ouvrirModal(modalVoiture);
}

export function ouvrirPopupModificationVoiture(voiture) {
  modalVoitureTitre.textContent = 'Modifier une voiture';
  messageVoiture.textContent = '';

  document.getElementById('voiture-id').value = voiture.id;
  document.getElementById('immatriculation').value = voiture.immatriculation || '';
  document.getElementById('marque').value = voiture.marque || '';
  document.getElementById('modele').value = voiture.modele || '';
  document.getElementById('nom_client').value = voiture.nom_client || '';
  document.getElementById('statut').value = voiture.statut || 1;
  document.getElementById('description').value = voiture.description || '';
  document.getElementById('prix').value = voiture.prix || 0;

  ouvrirModal(modalVoiture);
}

function fermerPopupVoiture() {
  formVoiture.reset();
  messageVoiture.textContent = '';
  fermerModal(modalVoiture);
}

async function enregistrerVoiture(event) {
  event.preventDefault();

  messageVoiture.textContent = '';

  const id = document.getElementById('voiture-id').value;

  const donneesVoiture = {
    immatriculation: document.getElementById('immatriculation').value,
    marque: document.getElementById('marque').value,
    modele: document.getElementById('modele').value,
    nom_client: document.getElementById('nom_client').value,
    statut: Number(document.getElementById('statut').value),
    description: document.getElementById('description').value,
    prix: Number(document.getElementById('prix').value || 0)
  };

  try {
    if (id) {
      await window.electronAPI.modifierVoiture(Number(id), donneesVoiture);
      afficherToast('Voiture modifiée avec succès.', 'success');
      await notifierSysteme('Voiture modifiée avec succès.');
    } else {
      await window.electronAPI.ajouterVoiture(donneesVoiture);
      afficherToast('Voiture ajoutée avec succès.', 'success');
      await notifierSysteme('Voiture ajoutée avec succès.');
    }

    fermerPopupVoiture();
    await onSaved();
  } catch (error) {
    console.error('Erreur voiture :', error);
    messageVoiture.textContent = error.message || 'Erreur lors de l’enregistrement.';
    afficherToast(messageVoiture.textContent, 'error');
  }
}