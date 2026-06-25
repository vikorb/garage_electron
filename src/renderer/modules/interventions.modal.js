import { state } from './state.js';
import { formaterPrix } from './utils.js';
import { t } from './i18n.js';
import { getStatusTranslationKey } from './constants.js';

import {
  afficherToast,
  notifierApplication,
  demanderConfirmationNative,
  ouvrirModal,
  fermerModal
} from './ui.js';

let modalInterventions = null;
let modalInterventionForm = null;

let interventionVoitureSelectionnee = null;
let interventionClient = null;
let interventionImmatriculation = null;
let interventionStatut = null;
let messageIntervention = null;
let listeInterventionsElement = null;
let totalInterventionsElement = null;

let modalInterventionTitre = null;
let formIntervention = null;
let messageInterventionForm = null;

let onChanged = async () => {};
let dernierResultatInterventions = null;

export function initInterventionsModal(options) {
  onChanged = options.onChanged;

  modalInterventions = document.getElementById('modal-interventions');
  modalInterventionForm = document.getElementById('modal-intervention-form');

  interventionVoitureSelectionnee = document.getElementById('intervention-voiture-selectionnee');
  interventionClient = document.getElementById('intervention-client');
  interventionImmatriculation = document.getElementById('intervention-immatriculation');
  interventionStatut = document.getElementById('intervention-statut');
  messageIntervention = document.getElementById('message-intervention');
  listeInterventionsElement = document.getElementById('liste-interventions');
  totalInterventionsElement = document.getElementById('total-interventions');

  modalInterventionTitre = document.getElementById('modal-intervention-titre');
  formIntervention = document.getElementById('form-intervention');
  messageInterventionForm = document.getElementById('message-intervention-form');

  document.getElementById('btn-fermer-interventions').addEventListener('click', fermerPopupInterventions);
  document.getElementById('btn-ouvrir-ajout-intervention').addEventListener('click', ouvrirPopupAjoutIntervention);
  document.getElementById('btn-fermer-form-intervention').addEventListener('click', fermerPopupFormIntervention);
  document.getElementById('btn-annuler-form-intervention').addEventListener('click', fermerPopupFormIntervention);

  formIntervention.addEventListener('submit', enregistrerIntervention);
  listeInterventionsElement.addEventListener('click', gererClicListeInterventions);

  window.addEventListener('language-changed', () => {
    rafraichirTextesInterventions();
  });
}

export async function ouvrirPopupInterventions(voiture) {
  state.voitureSelectionnee = voiture;
  messageIntervention.textContent = '';

  remplirInfosVoitureSelectionnee(voiture);

  document.getElementById('intervention-voiture-id').value = voiture.id;

  ouvrirModal(modalInterventions);

  await afficherInterventions(voiture.id);
}

export function fermerPopupInterventions() {
  state.voitureSelectionnee = null;
  state.interventionsCourantes = [];
  dernierResultatInterventions = null;

  listeInterventionsElement.innerHTML = '';
  messageIntervention.textContent = '';
  totalInterventionsElement.textContent = t('interventions.totalValue', {
    ht: formaterPrix(0),
    vat: formaterPrix(0),
    ttc: formaterPrix(0)
  });

  fermerPopupFormIntervention();
  fermerModal(modalInterventions);
}

function remplirInfosVoitureSelectionnee(voiture) {
  interventionVoitureSelectionnee.textContent = `${voiture.marque} ${voiture.modele}`;
  interventionClient.textContent = voiture.nom_client || t('car.noClient');
  interventionImmatriculation.textContent = voiture.immatriculation || t('car.noPlate');
  interventionStatut.textContent = t(getStatusTranslationKey(voiture.statut));
}

async function afficherInterventions(voitureId) {
  try {
    const resultat = await window.electronAPI.listerInterventionsParVoiture(voitureId);

    dernierResultatInterventions = resultat;
    state.interventionsCourantes = resultat.interventions;

    afficherInterventionsDepuisCache();
  } catch (error) {
    console.error('Erreur interventions :', error);
    messageIntervention.textContent = error.message || t('interventions.loadError');
    afficherToast(messageIntervention.textContent, 'error');
  }
}

function afficherInterventionsDepuisCache() {
  const resultat = dernierResultatInterventions;

  if (!resultat) {
    return;
  }

  listeInterventionsElement.innerHTML = '';

  if (resultat.interventions.length === 0) {
    const li = document.createElement('li');
    li.className = 'intervention-item';
    li.textContent = t('interventions.empty');
    listeInterventionsElement.appendChild(li);
  } else {
    resultat.interventions.forEach((intervention) => {
      listeInterventionsElement.appendChild(creerLigneIntervention(intervention));
    });
  }

  totalInterventionsElement.textContent = t('interventions.totalValue', {
    ht: formaterPrix(resultat.total_ht),
    vat: formaterPrix(resultat.tva),
    ttc: formaterPrix(resultat.total_ttc)
  });
}

function creerLigneIntervention(intervention) {
  const li = document.createElement('li');
  li.className = 'intervention-item';

  const info = document.createElement('div');

  const title = document.createElement('strong');
  title.textContent = intervention.description;

  const price = document.createElement('span');
  price.textContent = `${formaterPrix(intervention.prix)} HT`;

  info.appendChild(title);
  info.appendChild(price);

  const actions = document.createElement('div');
  actions.className = 'intervention-actions';

  const btnModifier = document.createElement('button');
  btnModifier.textContent = t('car.edit');
  btnModifier.dataset.id = intervention.id;
  btnModifier.classList.add('btn-modifier-intervention');

  const btnSupprimer = document.createElement('button');
  btnSupprimer.textContent = t('car.delete');
  btnSupprimer.dataset.id = intervention.id;
  btnSupprimer.classList.add('btn-supprimer-intervention');

  actions.appendChild(btnModifier);
  actions.appendChild(btnSupprimer);

  li.appendChild(info);
  li.appendChild(actions);

  return li;
}

function ouvrirPopupAjoutIntervention() {
  if (!state.voitureSelectionnee) {
    afficherToast(t('interventions.noCarSelected'), 'error');
    return;
  }

  messageInterventionForm.textContent = '';

  formIntervention.reset();

  document.getElementById('intervention-id').value = '';
  document.getElementById('intervention-voiture-id').value = state.voitureSelectionnee.id;

  mettreAJourTitreInterventionForm();
  ouvrirModal(modalInterventionForm);
}

function ouvrirPopupModificationIntervention(intervention) {
  messageInterventionForm.textContent = '';

  document.getElementById('intervention-id').value = intervention.id;
  document.getElementById('intervention-voiture-id').value = intervention.voiture_id;
  document.getElementById('intervention-description').value = intervention.description || '';
  document.getElementById('intervention-prix').value = intervention.prix || 0;

  mettreAJourTitreInterventionForm();
  ouvrirModal(modalInterventionForm);
}

function mettreAJourTitreInterventionForm() {
  const id = document.getElementById('intervention-id')?.value;

  if (!modalInterventionTitre) {
    return;
  }

  modalInterventionTitre.textContent = id ? t('interventions.editTitle') : t('interventions.addTitle');
}

function fermerPopupFormIntervention() {
  formIntervention.reset();
  messageInterventionForm.textContent = '';
  fermerModal(modalInterventionForm);
}

async function enregistrerIntervention(event) {
  event.preventDefault();

  messageInterventionForm.textContent = '';

  const interventionId = document.getElementById('intervention-id').value;
  const voitureId = Number(document.getElementById('intervention-voiture-id').value);

  const donneesIntervention = {
    voiture_id: voitureId,
    description: document.getElementById('intervention-description').value,
    prix: Number(document.getElementById('intervention-prix').value || 0)
  };

  try {
    if (interventionId) {
      await window.electronAPI.modifierIntervention(Number(interventionId), donneesIntervention);
      await notifierApplication(t('toast.interventionUpdated'), 'success');
    } else {
      await window.electronAPI.ajouterIntervention(donneesIntervention);
      await notifierApplication(t('toast.interventionAdded'), 'success');
    }

    fermerPopupFormIntervention();

    await afficherInterventions(voitureId);
    await onChanged();
  } catch (error) {
    console.error('Erreur intervention :', error);
    messageInterventionForm.textContent = error.message || t('error.interventionSave');
    afficherToast(messageInterventionForm.textContent, 'error');
  }
}

async function gererClicListeInterventions(event) {
  const bouton = event.target;

  if (!(bouton instanceof HTMLButtonElement)) {
    return;
  }

  const id = Number(bouton.dataset.id);

  if (bouton.classList.contains('btn-modifier-intervention')) {
    const intervention = state.interventionsCourantes.find((item) => Number(item.id) === id);

    if (!intervention) {
      afficherToast(t('interventions.notFound'), 'error');
      return;
    }

    ouvrirPopupModificationIntervention(intervention);
  }

  if (bouton.classList.contains('btn-supprimer-intervention')) {
    await supprimerIntervention(id);
  }
}

async function supprimerIntervention(id) {
  const voitureId = state.voitureSelectionnee ? Number(state.voitureSelectionnee.id) : null;

  const confirmation = await demanderConfirmationNative({
    title: t('confirm.deleteInterventionTitle'),
    message: t('confirm.deleteInterventionMessage'),
    detail: t('confirm.deleteInterventionDetail')
  });

  if (!confirmation || !voitureId) {
    return;
  }

  try {
    await window.electronAPI.supprimerIntervention(id);

    await notifierApplication(t('toast.interventionDeleted'), 'success');

    await afficherInterventions(voitureId);
    await onChanged();
  } catch (error) {
    console.error('Erreur suppression intervention :', error);
    afficherToast(error.message || t('error.interventionDelete'), 'error');
  }
}

function rafraichirTextesInterventions() {
  if (state.voitureSelectionnee) {
    remplirInfosVoitureSelectionnee(state.voitureSelectionnee);
  }

  mettreAJourTitreInterventionForm();
  afficherInterventionsDepuisCache();
}