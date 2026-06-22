const preloadStatus = document.getElementById('preload-status');

const dashboardTotalVoitures = document.getElementById('dashboard-total-voitures');
const dashboardRecu = document.getElementById('dashboard-recu');
const dashboardReparation = document.getElementById('dashboard-reparation');
const dashboardPrete = document.getElementById('dashboard-prete');
const dashboardLivre = document.getElementById('dashboard-livre');
const dashboardTotalInterventions = document.getElementById('dashboard-total-interventions');
const dashboardTotalReparations = document.getElementById('dashboard-total-reparations');

const btnOuvrirAjoutVoiture = document.getElementById('btn-ouvrir-ajout-voiture');
const listeVoituresElement = document.getElementById('liste-voitures');
const btnRecharger = document.getElementById('btn-recharger');
const btnReinitialiserFiltres = document.getElementById('btn-reinitialiser-filtres');
const rechercheVoituresInput = document.getElementById('recherche-voitures');
const filtreStatutSelect = document.getElementById('filtre-statut');

const modalVoiture = document.getElementById('modal-voiture');
const modalVoitureTitre = document.getElementById('modal-voiture-titre');
const btnFermerModalVoiture = document.getElementById('btn-fermer-modal-voiture');
const btnAnnulerVoiture = document.getElementById('btn-annuler-voiture');
const formVoiture = document.getElementById('form-voiture');
const messageVoiture = document.getElementById('message-voiture');

const modalInterventions = document.getElementById('modal-interventions');
const btnFermerInterventions = document.getElementById('btn-fermer-interventions');
const btnOuvrirAjoutIntervention = document.getElementById('btn-ouvrir-ajout-intervention');
const interventionVoitureSelectionnee = document.getElementById('intervention-voiture-selectionnee');
const interventionClient = document.getElementById('intervention-client');
const interventionImmatriculation = document.getElementById('intervention-immatriculation');
const interventionStatut = document.getElementById('intervention-statut');
const messageIntervention = document.getElementById('message-intervention');
const listeInterventionsElement = document.getElementById('liste-interventions');
const totalInterventionsElement = document.getElementById('total-interventions');

const modalInterventionForm = document.getElementById('modal-intervention-form');
const modalInterventionTitre = document.getElementById('modal-intervention-titre');
const btnFermerFormIntervention = document.getElementById('btn-fermer-form-intervention');
const btnAnnulerFormIntervention = document.getElementById('btn-annuler-form-intervention');
const formIntervention = document.getElementById('form-intervention');
const messageInterventionForm = document.getElementById('message-intervention-form');

const toastContainer = document.getElementById('toast-container');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmationMessage = document.getElementById('confirmation-message');
const confirmationOui = document.getElementById('confirmation-oui');
const confirmationNon = document.getElementById('confirmation-non');

let voituresCourantes = [];
let interventionsCourantes = [];
let totauxInterventionsParVoiture = {};
let voitureSelectionnee = null;
let resolveConfirmation = null;

const libellesStatuts = {
  1: 'Reçu',
  2: 'En réparation',
  3: 'Prête',
  4: 'Livré'
};

if (window.electronAPI) {
  preloadStatus.textContent = window.electronAPI.test();
  console.log('window.electronAPI existe :', window.electronAPI);
} else {
  preloadStatus.textContent = 'Erreur : window.electronAPI est undefined';
  console.error('window.electronAPI est undefined');
}

function formaterPrix(valeur) {
  return `${Number(valeur || 0).toFixed(2)} €`;
}

function normaliserTexte(valeur) {
  return String(valeur || '').toLowerCase().trim();
}

function ouvrirModal(modal) {
  modal.classList.remove('hidden');
}

function fermerModal(modal) {
  modal.classList.add('hidden');
}

function afficherToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

async function notifierSysteme(message) {
  try {
    await window.electronAPI.envoyerNotification({
      title: 'Garage Manager',
      body: message
    });
  } catch (error) {
    console.warn('Notification système impossible :', error);
  }
}

function demanderConfirmation(message) {
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

confirmationOui.addEventListener('click', () => {
  fermerConfirmation(true);
});

confirmationNon.addEventListener('click', () => {
  fermerConfirmation(false);
});

function creerBadgeStatut(statut) {
  const badge = document.createElement('span');
  badge.className = `badge-status status-${statut}`;
  badge.textContent = libellesStatuts[statut] || 'Statut inconnu';

  return badge;
}

function creerDetailVoiture(label, valeur) {
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

async function mettreAJourDashboard(voitures) {
  dashboardTotalVoitures.textContent = voitures.length;
  dashboardRecu.textContent = voitures.filter((voiture) => Number(voiture.statut) === 1).length;
  dashboardReparation.textContent = voitures.filter((voiture) => Number(voiture.statut) === 2).length;
  dashboardPrete.textContent = voitures.filter((voiture) => Number(voiture.statut) === 3).length;
  dashboardLivre.textContent = voitures.filter((voiture) => Number(voiture.statut) === 4).length;

  try {
    const resultat = await window.electronAPI.calculerTotalGlobalInterventions();

    dashboardTotalInterventions.textContent = formaterPrix(resultat.total_ht);
    dashboardTotalReparations.textContent = formaterPrix(resultat.total_ttc);
  } catch (error) {
    console.error('Erreur total interventions :', error);

    dashboardTotalInterventions.textContent = 'Erreur';
    dashboardTotalReparations.textContent = 'Erreur';
  }
}

function filtrerVoitures() {
  const recherche = normaliserTexte(rechercheVoituresInput.value);
  const statutFiltre = filtreStatutSelect.value;

  return voituresCourantes.filter((voiture) => {
    const correspondStatut =
      statutFiltre === 'tous' || Number(voiture.statut) === Number(statutFiltre);

    const texteRecherche = [
      voiture.id,
      voiture.immatriculation,
      voiture.marque,
      voiture.modele,
      voiture.nom_client,
      voiture.description
    ]
      .map(normaliserTexte)
      .join(' ');

    const correspondRecherche = !recherche || texteRecherche.includes(recherche);

    return correspondStatut && correspondRecherche;
  });
}

function afficherVoituresDepuisCache() {
  const voitures = filtrerVoitures();

  listeVoituresElement.innerHTML = '';

  if (voitures.length === 0) {
    const li = document.createElement('li');
    li.className = 'voiture-card empty-card';
    li.textContent = 'Aucune voiture ne correspond à la recherche.';
    listeVoituresElement.appendChild(li);
    return;
  }

  voitures.forEach((voiture) => {
    const totauxVoiture = totauxInterventionsParVoiture[voiture.id] || {
      total_ht: 0,
      tva: 0,
      total_ttc: 0
    };

    const li = document.createElement('li');
    li.className = 'voiture-card';

    const header = document.createElement('div');
    header.className = 'voiture-card-header';

    const titleZone = document.createElement('div');

    const title = document.createElement('h3');
    title.className = 'voiture-title';
    title.textContent = `${voiture.marque} ${voiture.modele}`;

    const subtitle = document.createElement('p');
    subtitle.className = 'voiture-subtitle';
    subtitle.textContent = `#${voiture.id} • ${voiture.immatriculation || 'Sans immatriculation'}`;

    titleZone.appendChild(title);
    titleZone.appendChild(subtitle);

    header.appendChild(titleZone);
    header.appendChild(creerBadgeStatut(voiture.statut));

    const details = document.createElement('div');
    details.className = 'voiture-details';

    details.appendChild(creerDetailVoiture('Client', voiture.nom_client || 'Non renseigné'));
    details.appendChild(creerDetailVoiture('Prix véhicule', formaterPrix(voiture.prix)));
    details.appendChild(creerDetailVoiture('Réparations HT', formaterPrix(totauxVoiture.total_ht)));
    details.appendChild(creerDetailVoiture('TVA réparation', formaterPrix(totauxVoiture.tva)));
    details.appendChild(creerDetailVoiture('Total réparations TTC', formaterPrix(totauxVoiture.total_ttc)));

    const description = document.createElement('p');
    description.className = 'voiture-description';
    description.textContent = voiture.description || 'Aucune description.';

    const actions = document.createElement('div');
    actions.className = 'voiture-actions';

    const btnModifier = document.createElement('button');
    btnModifier.textContent = 'Modifier';
    btnModifier.dataset.id = voiture.id;
    btnModifier.classList.add('btn-modifier');

    const btnInterventions = document.createElement('button');
    btnInterventions.textContent = 'Interventions';
    btnInterventions.dataset.id = voiture.id;
    btnInterventions.classList.add('btn-interventions');

    const btnFacture = document.createElement('button');
    btnFacture.textContent = 'Facture';
    btnFacture.dataset.id = voiture.id;
    btnFacture.classList.add('btn-facture');

    const btnSupprimer = document.createElement('button');
    btnSupprimer.textContent = 'Supprimer';
    btnSupprimer.dataset.id = voiture.id;
    btnSupprimer.classList.add('btn-supprimer');

    actions.appendChild(btnModifier);
    actions.appendChild(btnInterventions);
    actions.appendChild(btnFacture);
    actions.appendChild(btnSupprimer);

    li.appendChild(header);
    li.appendChild(details);
    li.appendChild(description);
    li.appendChild(actions);

    listeVoituresElement.appendChild(li);
  });
}

async function afficherVoitures() {
  try {
    const voitures = await window.electronAPI.listerVoitures();
    const totaux = await window.electronAPI.calculerTotauxParVoiture();

    voituresCourantes = voitures;
    totauxInterventionsParVoiture = totaux;

    await mettreAJourDashboard(voituresCourantes);
    afficherVoituresDepuisCache();
  } catch (error) {
    console.error('Erreur lors du chargement des voitures :', error);

    listeVoituresElement.innerHTML = '';

    const li = document.createElement('li');
    li.className = 'voiture-card';
    li.textContent = 'Erreur lors du chargement des voitures.';
    listeVoituresElement.appendChild(li);

    afficherToast('Erreur lors du chargement des voitures.', 'error');
  }
}

function ouvrirPopupAjoutVoiture() {
  modalVoitureTitre.textContent = 'Ajouter une voiture';
  messageVoiture.textContent = '';

  formVoiture.reset();

  document.getElementById('voiture-id').value = '';
  document.getElementById('statut').value = 1;

  ouvrirModal(modalVoiture);
}

function ouvrirPopupModificationVoiture(voiture) {
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

btnOuvrirAjoutVoiture.addEventListener('click', ouvrirPopupAjoutVoiture);
btnFermerModalVoiture.addEventListener('click', fermerPopupVoiture);
btnAnnulerVoiture.addEventListener('click', fermerPopupVoiture);

formVoiture.addEventListener('submit', async (event) => {
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
    await afficherVoitures();
  } catch (error) {
    console.error('Erreur voiture :', error);
    messageVoiture.textContent = error.message || 'Erreur lors de l’enregistrement.';
    afficherToast(messageVoiture.textContent, 'error');
  }
});

listeVoituresElement.addEventListener('click', async (event) => {
  const bouton = event.target;

  if (bouton.classList.contains('btn-modifier')) {
    const id = Number(bouton.dataset.id);
    const voiture = voituresCourantes.find((v) => Number(v.id) === id);

    if (!voiture) {
      afficherToast('Voiture introuvable.', 'error');
      return;
    }

    ouvrirPopupModificationVoiture(voiture);
  }

  if (bouton.classList.contains('btn-interventions')) {
    const id = Number(bouton.dataset.id);
    const voiture = voituresCourantes.find((v) => Number(v.id) === id);

    if (!voiture) {
      afficherToast('Voiture introuvable.', 'error');
      return;
    }

    await ouvrirPopupInterventions(voiture);
  }

  if (bouton.classList.contains('btn-facture')) {
    const id = Number(bouton.dataset.id);

    try {
      const resultat = await window.electronAPI.exporterFacture(id);

      if (resultat.canceled) {
        afficherToast('Export de facture annulé.', 'info');
        return;
      }

      afficherToast('Facture exportée avec succès.', 'success');
      await notifierSysteme('Facture exportée avec succès.');
    } catch (error) {
      console.error('Erreur export facture :', error);
      afficherToast(error.message || 'Erreur lors de l’export de la facture.', 'error');
    }
  }

  if (bouton.classList.contains('btn-supprimer')) {
    const id = Number(bouton.dataset.id);

    const confirmation = await demanderConfirmation(
      'Voulez-vous vraiment supprimer cette voiture et toutes ses interventions ?'
    );

    if (!confirmation) {
      return;
    }

    try {
      await window.electronAPI.supprimerVoiture(id);

      if (voitureSelectionnee && Number(voitureSelectionnee.id) === id) {
        fermerPopupInterventions();
      }

      afficherToast('Voiture supprimée avec succès.', 'success');
      await notifierSysteme('Voiture supprimée avec succès.');

      await afficherVoitures();
    } catch (error) {
      console.error('Erreur suppression voiture :', error);
      afficherToast(error.message || 'Erreur lors de la suppression de la voiture.', 'error');
    }
  }
});

async function ouvrirPopupInterventions(voiture) {
  voitureSelectionnee = voiture;
  messageIntervention.textContent = '';

  interventionVoitureSelectionnee.textContent = `${voiture.marque} ${voiture.modele}`;
  interventionClient.textContent = voiture.nom_client || 'Non renseigné';
  interventionImmatriculation.textContent = voiture.immatriculation || 'Non renseignée';
  interventionStatut.textContent = libellesStatuts[voiture.statut] || 'Statut inconnu';

  document.getElementById('intervention-voiture-id').value = voiture.id;

  ouvrirModal(modalInterventions);

  await afficherInterventions(voiture.id);
}

function fermerPopupInterventions() {
  voitureSelectionnee = null;
  interventionsCourantes = [];

  listeInterventionsElement.innerHTML = '';
  messageIntervention.textContent = '';
  totalInterventionsElement.textContent = 'HT : 0 € | TVA : 0 € | TTC : 0 €';

  fermerPopupFormIntervention();
  fermerModal(modalInterventions);
}

btnFermerInterventions.addEventListener('click', fermerPopupInterventions);

async function afficherInterventions(voitureId) {
  try {
    const resultat = await window.electronAPI.listerInterventionsParVoiture(voitureId);

    interventionsCourantes = resultat.interventions;

    listeInterventionsElement.innerHTML = '';

    if (resultat.interventions.length === 0) {
      const li = document.createElement('li');
      li.className = 'intervention-item';
      li.textContent = 'Aucune intervention pour cette voiture.';
      listeInterventionsElement.appendChild(li);
    } else {
      resultat.interventions.forEach((intervention) => {
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

        listeInterventionsElement.appendChild(li);
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

function ouvrirPopupAjoutIntervention() {
  if (!voitureSelectionnee) {
    afficherToast('Aucune voiture sélectionnée.', 'error');
    return;
  }

  modalInterventionTitre.textContent = 'Ajouter une intervention';
  messageInterventionForm.textContent = '';

  formIntervention.reset();

  document.getElementById('intervention-id').value = '';
  document.getElementById('intervention-voiture-id').value = voitureSelectionnee.id;

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

btnOuvrirAjoutIntervention.addEventListener('click', ouvrirPopupAjoutIntervention);
btnFermerFormIntervention.addEventListener('click', fermerPopupFormIntervention);
btnAnnulerFormIntervention.addEventListener('click', fermerPopupFormIntervention);

formIntervention.addEventListener('submit', async (event) => {
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
    await afficherVoitures();
  } catch (error) {
    console.error('Erreur intervention :', error);
    messageInterventionForm.textContent = error.message || 'Erreur lors de l’enregistrement de l’intervention.';
    afficherToast(messageInterventionForm.textContent, 'error');
  }
});

listeInterventionsElement.addEventListener('click', async (event) => {
  const bouton = event.target;

  if (bouton.classList.contains('btn-modifier-intervention')) {
    const id = Number(bouton.dataset.id);
    const intervention = interventionsCourantes.find((item) => Number(item.id) === id);

    if (!intervention) {
      afficherToast('Intervention introuvable.', 'error');
      return;
    }

    ouvrirPopupModificationIntervention(intervention);
  }

  if (bouton.classList.contains('btn-supprimer-intervention')) {
    const id = Number(bouton.dataset.id);
    const voitureId = voitureSelectionnee ? Number(voitureSelectionnee.id) : null;

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
      await afficherVoitures();
    } catch (error) {
      console.error('Erreur suppression intervention :', error);
      afficherToast(error.message || 'Erreur lors de la suppression de l’intervention.', 'error');
    }
  }
});

btnRecharger.addEventListener('click', afficherVoitures);

btnReinitialiserFiltres.addEventListener('click', () => {
  rechercheVoituresInput.value = '';
  filtreStatutSelect.value = 'tous';

  afficherVoituresDepuisCache();
  afficherToast('Filtres réinitialisés.', 'info');
});

rechercheVoituresInput.addEventListener('input', afficherVoituresDepuisCache);
filtreStatutSelect.addEventListener('change', afficherVoituresDepuisCache);

afficherVoitures();