import { state } from './state.js';
import { libellesStatuts } from './constants.js';
import { formaterPrix } from './utils.js';
import {
  afficherToast,
  notifierSysteme,
  demanderConfirmation,
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
}

export async function ouvrirPopupInterventions(voiture) {
  state.voitureSelectionnee = voiture;
  messageIntervention.textContent = '';

  interventionVoitureSelectionnee.textContent = `${voiture.marque} ${voiture.modele}`;
  interventionClient.textContent = voiture.nom_client || 'Non renseigné';
  interventionImmatriculation.textContent = voiture.immatriculation || 'Non renseignée';
  interventionStatut.textContent = libellesStatuts[voiture.statut] || 'Statut inconnu';

  document.getElementById('intervention-voiture-id').value = voiture.id;

  ouvrirModal(modalInterventions);

  await afficherInterventions(voiture.id);
}

export function fermerPopupInterventions() {
  state.voitureSelectionnee = null;
  state.interventionsCourantes = [];

  listeInterventionsElement.innerHTML = '';
  messageIntervention.textContent = '';
  totalInterventionsElement.textContent = 'HT : 0 € | TVA : 0 € | TTC : 0 €';

  fermerPopupFormIntervention();
  fermerModal(modalInterventions);
}

async function afficherInterventions(voitureId) {
  try {
    const resultat = await window.electronAPI.listerInterventionsParVoiture(voitureId);

    state.interventionsCourantes = resultat.interventions;

    listeInterventionsElement.innerHTML = '';

    if (resultat.interventions.length === 0) {
      const li = document.createElement('li');
      li.className = 'intervention-item';
      li.textContent = 'Aucune intervention pour cette voiture.';
      listeInterventionsElement.appendChild(li);
    } else {
      resultat.interventions.forEach((intervention) => {
        listeInterventionsElement.appendChild(creerLigneIntervention(intervention));
      });
    }

    totalInterventionsElement.textContent =
      `HT : ${formaterPrix(resultat.total_ht)} | TVA : ${formaterPrix(resultat.tva)} | TTC : ${formaterPrix(resultat.total_ttc)}`;
  } catch (error) {
    console.error('Erreur interventions :', error);
    messageIntervention.textContent = error.message || 'Erreur lors du chargement des interventions.';
    afficherToast(messageIntervention.textContent, 'error');
  }
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
  btnModifier.textContent = 'Modifier';
  btnModifier.dataset.id = intervention.id;
  btnModifier.classList.add('btn-modifier-intervention');

  const btnSupprimer = document.createElement('button');
  btnSupprimer.textContent = 'Supprimer';
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
    afficherToast('Aucune voiture sélectionnée.', 'error');
    return;
  }

  modalInterventionTitre.textContent = 'Ajouter une intervention';
  messageInterventionForm.textContent = '';

  formIntervention.reset();

  document.getElementById('intervention-id').value = '';
  document.getElementById('intervention-voiture-id').value = state.voitureSelectionnee.id;

  ouvrirModal(modalInterventionForm);
}

function ouvrirPopupModificationIntervention(intervention) {
  modalInterventionTitre.textContent = 'Modifier une intervention';
  messageInterventionForm.textContent = '';

  document.getElementById('intervention-id').value = intervention.id;
  document.getElementById('intervention-voiture-id').value = intervention.voiture_id;
  document.getElementById('intervention-description').value = intervention.description || '';
  document.getElementById('intervention-prix').value = intervention.prix || 0;

  ouvrirModal(modalInterventionForm);
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
      afficherToast('Intervention modifiée avec succès.', 'success');
      await notifierSysteme('Intervention modifiée avec succès.');
    } else {
      await window.electronAPI.ajouterIntervention(donneesIntervention);
      afficherToast('Intervention ajoutée avec succès.', 'success');
      await notifierSysteme('Intervention ajoutée avec succès.');
    }

    fermerPopupFormIntervention();

    await afficherInterventions(voitureId);
    await onChanged();
  } catch (error) {
    console.error('Erreur intervention :', error);
    messageInterventionForm.textContent = error.message || 'Erreur lors de l’enregistrement de l’intervention.';
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
      afficherToast('Intervention introuvable.', 'error');
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

  const confirmation = await demanderConfirmation(
    'Voulez-vous vraiment supprimer cette intervention ?'
  );

  if (!confirmation || !voitureId) {
    return;
  }

  try {
    await window.electronAPI.supprimerIntervention(id);

    afficherToast('Intervention supprimée avec succès.', 'success');
    await notifierSysteme('Intervention supprimée avec succès.');

    await afficherInterventions(voitureId);
    await onChanged();
  } catch (error) {
    console.error('Erreur suppression intervention :', error);
    afficherToast(error.message || 'Erreur lors de la suppression de l’intervention.', 'error');
  }
}