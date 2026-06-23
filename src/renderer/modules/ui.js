import { libellesStatuts } from './constants.js';

let toastContainer = null;
let confirmationModal = null;
let confirmationMessage = null;
let confirmationOui = null;
let confirmationNon = null;
let resolveConfirmation = null;

export function initUi() {
  toastContainer = document.getElementById('toast-container');
  confirmationModal = document.getElementById('confirmation-modal');
  confirmationMessage = document.getElementById('confirmation-message');
  confirmationOui = document.getElementById('confirmation-oui');
  confirmationNon = document.getElementById('confirmation-non');

  confirmationOui.addEventListener('click', () => {
    fermerConfirmation(true);
  });

  confirmationNon.addEventListener('click', () => {
    fermerConfirmation(false);
  });
}

export function ouvrirModal(modal) {
  modal.classList.remove('hidden');
}

export function fermerModal(modal) {
  modal.classList.add('hidden');
}

export function afficherToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

export async function notifierSysteme(message) {
  try {
    await window.electronAPI.envoyerNotification({
      title: 'Garage Manager',
      body: message
    });
  } catch (error) {
    console.warn('Notification système impossible :', error);
  }
}

export function demanderConfirmation(message) {
  confirmationMessage.textContent = message;
  ouvrirModal(confirmationModal);

  return new Promise((resolve) => {
    resolveConfirmation = resolve;
  });
}

function fermerConfirmation(resultat) {
  fermerModal(confirmationModal);

  if (resolveConfirmation) {
    resolveConfirmation(resultat);
    resolveConfirmation = null;
  }
}

export function creerBadgeStatut(statut) {
  const badge = document.createElement('span');
  badge.className = `badge-status status-${statut}`;
  badge.textContent = libellesStatuts[statut] || 'Statut inconnu';

  return badge;
}

export function creerDetailVoiture(label, valeur) {
  const ligne = document.createElement('div');
  ligne.className = 'voiture-detail';

  const labelElement = document.createElement('span');
  labelElement.textContent = label;

  const valeurElement = document.createElement('strong');
  valeurElement.textContent = valeur;

  ligne.appendChild(labelElement);
  ligne.appendChild(valeurElement);

  return ligne;
}