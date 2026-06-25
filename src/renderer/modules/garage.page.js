import { state } from './state.js';
import { formaterPrix } from './utils.js';
import {
  afficherToast,
  notifierApplication,
  demanderConfirmationNative,
  creerBadgeStatut,
  creerDetailVoiture
} from './ui.js';

let dashboardTotalVoitures = null;
let dashboardRecu = null;
let dashboardReparation = null;
let dashboardPrete = null;
let dashboardLivre = null;
let dashboardTotalInterventions = null;
let dashboardTotalReparations = null;

let btnOuvrirAjoutVoiture = null;
let listeVoituresElement = null;
let btnRecharger = null;
let btnReinitialiserFiltres = null;
let rechercheVoituresInput = null;
let filtreStatutSelect = null;

let actions = {};
let rechercheTimer = null;

export function initGaragePage(options) {
  actions = options;

  dashboardTotalVoitures = document.getElementById('dashboard-total-voitures');
  dashboardRecu = document.getElementById('dashboard-recu');
  dashboardReparation = document.getElementById('dashboard-reparation');
  dashboardPrete = document.getElementById('dashboard-prete');
  dashboardLivre = document.getElementById('dashboard-livre');
  dashboardTotalInterventions = document.getElementById('dashboard-total-interventions');
  dashboardTotalReparations = document.getElementById('dashboard-total-reparations');

  btnOuvrirAjoutVoiture = document.getElementById('btn-ouvrir-ajout-voiture');
  listeVoituresElement = document.getElementById('liste-voitures');
  btnRecharger = document.getElementById('btn-recharger');
  btnReinitialiserFiltres = document.getElementById('btn-reinitialiser-filtres');
  rechercheVoituresInput = document.getElementById('recherche-voitures');
  filtreStatutSelect = document.getElementById('filtre-statut');

  btnOuvrirAjoutVoiture.addEventListener('click', () => {
    actions.ouvrirAjoutVoiture();
  });

  btnRecharger.addEventListener('click', async () => {
    await afficherVoitures();
    afficherToast('Données rechargées.', 'info');
  });

  btnReinitialiserFiltres.addEventListener('click', () => {
    reinitialiserFiltres(true);
  });

  rechercheVoituresInput.addEventListener('input', programmerRechercheSql);
  filtreStatutSelect.addEventListener('change', afficherVoitures);

  listeVoituresElement.addEventListener('click', gererClicListeVoitures);
}

export async function afficherVoitures() {
  try {
    const filtres = obtenirFiltresCourants();

    const voitures = await window.electronAPI.listerVoitures(filtres);
    const totaux = await window.electronAPI.calculerTotauxParVoiture();

    state.voituresCourantes = voitures;
    state.totauxInterventionsParVoiture = totaux;

    afficherVoituresDepuisResultatsSql();

    await mettreAJourDashboardGlobal();
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

export async function reinitialiserFiltres(afficherMessage = false) {
  rechercheVoituresInput.value = '';
  filtreStatutSelect.value = 'tous';

  await afficherVoitures();

  if (afficherMessage) {
    afficherToast('Filtres réinitialisés.', 'info');
  }
}

function obtenirFiltresCourants() {
  return {
    recherche: rechercheVoituresInput.value,
    statut: filtreStatutSelect.value
  };
}

function programmerRechercheSql() {
  clearTimeout(rechercheTimer);

  rechercheTimer = setTimeout(() => {
    afficherVoitures();
  }, 250);
}

async function mettreAJourDashboardGlobal() {
  try {
    const toutesLesVoitures = await window.electronAPI.listerVoitures({
      recherche: '',
      statut: 'tous'
    });

    dashboardTotalVoitures.textContent = toutesLesVoitures.length;
    dashboardRecu.textContent = toutesLesVoitures.filter((voiture) => Number(voiture.statut) === 1).length;
    dashboardReparation.textContent = toutesLesVoitures.filter((voiture) => Number(voiture.statut) === 2).length;
    dashboardPrete.textContent = toutesLesVoitures.filter((voiture) => Number(voiture.statut) === 3).length;
    dashboardLivre.textContent = toutesLesVoitures.filter((voiture) => Number(voiture.statut) === 4).length;

    const resultat = await window.electronAPI.calculerTotalGlobalInterventions();

    dashboardTotalInterventions.textContent = formaterPrix(resultat.total_ht);
    dashboardTotalReparations.textContent = formaterPrix(resultat.total_ttc);
  } catch (error) {
    console.error('Erreur dashboard global :', error);

    dashboardTotalInterventions.textContent = 'Erreur';
    dashboardTotalReparations.textContent = 'Erreur';
  }
}

function afficherVoituresDepuisResultatsSql() {
  const voitures = state.voituresCourantes;

  listeVoituresElement.innerHTML = '';

  if (voitures.length === 0) {
    const li = document.createElement('li');
    li.className = 'voiture-card empty-card';
    li.textContent = 'Aucune voiture ne correspond à la recherche SQL.';
    listeVoituresElement.appendChild(li);
    return;
  }

  voitures.forEach((voiture) => {
    listeVoituresElement.appendChild(creerCarteVoiture(voiture));
  });
}

function creerCarteVoiture(voiture) {
  const totauxVoiture = state.totauxInterventionsParVoiture[voiture.id] || {
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

  const actionZone = document.createElement('div');
  actionZone.className = 'voiture-actions';

  actionZone.appendChild(creerBoutonAction('Modifier', 'btn-modifier', voiture.id));
  actionZone.appendChild(creerBoutonAction('Interventions', 'btn-interventions', voiture.id));
  actionZone.appendChild(creerBoutonAction('Facture', 'btn-facture', voiture.id));
  actionZone.appendChild(creerBoutonAction('Supprimer', 'btn-supprimer', voiture.id));

  li.appendChild(header);
  li.appendChild(details);
  li.appendChild(description);
  li.appendChild(actionZone);

  return li;
}

function creerBoutonAction(texte, classe, id) {
  const bouton = document.createElement('button');
  bouton.textContent = texte;
  bouton.dataset.id = id;
  bouton.classList.add(classe);

  return bouton;
}

async function gererClicListeVoitures(event) {
  const bouton = event.target;

  if (!(bouton instanceof HTMLButtonElement)) {
    return;
  }

  const id = Number(bouton.dataset.id);
  const voiture = state.voituresCourantes.find((v) => Number(v.id) === id);

  if (!voiture) {
    afficherToast('Voiture introuvable.', 'error');
    return;
  }

  if (bouton.classList.contains('btn-modifier')) {
    actions.ouvrirModificationVoiture(voiture);
  }

  if (bouton.classList.contains('btn-interventions')) {
    await actions.ouvrirInterventions(voiture);
  }

  if (bouton.classList.contains('btn-facture')) {
    await exporterFacture(id);
  }

  if (bouton.classList.contains('btn-supprimer')) {
    await supprimerVoiture(id);
  }
}

async function exporterFacture(id) {
  try {
    const resultat = await window.electronAPI.exporterFacture(id);

    if (resultat.canceled) {
      afficherToast('Export de facture annulé.', 'info');
      return;
    }

    console.log('Facture exportée :', resultat.filePath);

    await notifierApplication('Facture exportée avec succès.', 'success');
  } catch (error) {
    console.error('Erreur export facture :', error);
    afficherToast(error.message || 'Erreur lors de l’export de la facture.', 'error');
  }
}

async function supprimerVoiture(id) {
  const confirmation = await demanderConfirmationNative({
    title: 'Supprimer la voiture',
    message: 'Voulez-vous vraiment supprimer cette voiture ?',
    detail: 'Toutes les interventions liées à cette voiture seront aussi supprimées.'
  });

  if (!confirmation) {
    return;
  }

  try {
    await window.electronAPI.supprimerVoiture(id);

    if (state.voitureSelectionnee && Number(state.voitureSelectionnee.id) === id) {
      actions.fermerInterventions();
    }

    await notifierApplication('Voiture supprimée avec succès.', 'success');

    await afficherVoitures();
  } catch (error) {
    console.error('Erreur suppression voiture :', error);
    afficherToast(error.message || 'Erreur lors de la suppression de la voiture.', 'error');
  }
}