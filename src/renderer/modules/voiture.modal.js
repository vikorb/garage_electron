import { afficherToast, notifierApplication, ouvrirModal, fermerModal } from './ui.js';
import { t } from './i18n.js';

let modalVoiture = null;
let modalVoitureTitre = null;
let formVoiture = null;
let messageVoiture = null;

let onSaved = async () => {};
let statutInitialVoiture = null;

export function initVoitureModal(options) {
  onSaved = options.onSaved;

  modalVoiture = document.getElementById('modal-voiture');
  modalVoitureTitre = document.getElementById('modal-voiture-titre');
  formVoiture = document.getElementById('form-voiture');
  messageVoiture = document.getElementById('message-voiture');

  document.getElementById('btn-fermer-modal-voiture').addEventListener('click', fermerPopupVoiture);
  document.getElementById('btn-annuler-voiture').addEventListener('click', fermerPopupVoiture);

  formVoiture.addEventListener('submit', enregistrerVoiture);

  window.addEventListener('language-changed', () => {
    mettreAJourTitreModalVoiture();
  });
}

export function ouvrirPopupAjoutVoiture() {
  messageVoiture.textContent = '';
  statutInitialVoiture = null;

  formVoiture.reset();

  document.getElementById('voiture-id').value = '';
  document.getElementById('statut').value = 1;

  mettreAJourTitreModalVoiture();
  ouvrirModal(modalVoiture);
}

export function ouvrirPopupModificationVoiture(voiture) {
  messageVoiture.textContent = '';

  statutInitialVoiture = Number(voiture.statut || 1);

  document.getElementById('voiture-id').value = voiture.id;
  document.getElementById('immatriculation').value = voiture.immatriculation || '';
  document.getElementById('marque').value = voiture.marque || '';
  document.getElementById('modele').value = voiture.modele || '';
  document.getElementById('nom_client').value = voiture.nom_client || '';
  document.getElementById('statut').value = voiture.statut || 1;
  document.getElementById('description').value = voiture.description || '';
  document.getElementById('prix').value = voiture.prix || 0;

  mettreAJourTitreModalVoiture();
  ouvrirModal(modalVoiture);
}

function mettreAJourTitreModalVoiture() {
  const id = document.getElementById('voiture-id')?.value;

  if (!modalVoitureTitre) {
    return;
  }

  modalVoitureTitre.textContent = id ? t('car.editTitle') : t('car.addTitle');
}

function fermerPopupVoiture() {
  formVoiture.reset();
  messageVoiture.textContent = '';
  statutInitialVoiture = null;
  fermerModal(modalVoiture);
}

async function enregistrerVoiture(event) {
  event.preventDefault();

  messageVoiture.textContent = '';

  const id = document.getElementById('voiture-id').value;
  const nouveauStatut = Number(document.getElementById('statut').value);

  const donneesVoiture = {
    immatriculation: document.getElementById('immatriculation').value,
    marque: document.getElementById('marque').value,
    modele: document.getElementById('modele').value,
    nom_client: document.getElementById('nom_client').value,
    statut: nouveauStatut,
    description: document.getElementById('description').value,
    prix: Number(document.getElementById('prix').value || 0)
  };

  try {
    let voitureEnregistree = null;

    if (id) {
      voitureEnregistree = await window.electronAPI.modifierVoiture(Number(id), donneesVoiture);
      await notifierApplication(t('toast.carUpdated'), 'success');

      if (statutInitialVoiture !== 3 && nouveauStatut === 3) {
        await notifierApplication(
          t('notification.carReady', {
            brand: donneesVoiture.marque,
            model: donneesVoiture.modele
          }),
          'success'
        );
      }
    } else {
      voitureEnregistree = await window.electronAPI.ajouterVoiture(donneesVoiture);
      await notifierApplication(t('toast.carAdded'), 'success');

      if (nouveauStatut === 3) {
        await notifierApplication(
          t('notification.carCreatedReady', {
            brand: donneesVoiture.marque,
            model: donneesVoiture.modele
          }),
          'success'
        );
      }
    }

    fermerPopupVoiture();
    await onSaved(voitureEnregistree);
  } catch (error) {
    console.error('Erreur voiture :', error);
    messageVoiture.textContent = error.message || t('error.carSave');
    afficherToast(messageVoiture.textContent, 'error');
  }
}