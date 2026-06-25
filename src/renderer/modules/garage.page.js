import { state } from './state.js';
import { formaterPrix } from './utils.js';
import { t } from './i18n.js';

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
    afficherToast(t('toast.reload'), 'info');
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
    li.textContent = t('garage.loadError');
    listeVoituresElement.appendChild(li);

    afficherToast(t('garage.loadError'), 'error');
  }
}

export async function reinitialiserFiltres(afficherMessage = false) {
  rechercheVoituresInput.value = '';
  filtreStatutSelect.value = 'tous';

  await afficherVoitures();

  if (afficherMessage) {
    afficherToast(t('toast.filtersReset'), 'info');
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
    dashboardRecu.textContent = toutesLesVoitures.filter(
      (voiture) => Number(voiture.statut) === 1
    ).length;
    dashboardReparation.textContent = toutesLesVoitures.filter(
      (voiture) => Number(voiture.statut) === 2
    ).length;
    dashboardPrete.textContent = toutesLesVoitures.filter(
      (voiture) => Number(voiture.statut) === 3
    ).length;
    dashboardLivre.textContent = toutesLesVoitures.filter(
      (voiture) => Number(voiture.statut) === 4
    ).length;

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
    li.textContent = t('garage.empty');
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
  subtitle.textContent = `#${voiture.id} • ${voiture.immatriculation || t('car.noPlate')}`;

  titleZone.appendChild(title);
  titleZone.appendChild(subtitle);

  header.appendChild(titleZone);
  header.appendChild(creerBadgeStatut(voiture.statut));

  const details = document.createElement('div');
  details.className = 'voiture-details';

  details.appendChild(
    creerDetailVoiture(t('car.client'), voiture.nom_client || t('car.noClient'))
  );

  details.appendChild(
    creerDetailVoiture(t('car.priceLabel'), formaterPrix(voiture.prix))
  );

  details.appendChild(
    creerDetailVoiture(t('car.repairsHt'), formaterPrix(totauxVoiture.total_ht))
  );

  details.appendChild(
    creerDetailVoiture(t('car.repairVat'), formaterPrix(totauxVoiture.tva))
  );

  details.appendChild(
    creerDetailVoiture(t('car.repairsTtc'), formaterPrix(totauxVoiture.total_ttc))
  );

  const description = document.createElement('p');
  description.className = 'voiture-description';
  description.textContent = voiture.description || t('car.noDescription');

  const actionZone = document.createElement('div');
  actionZone.className = 'voiture-actions';

  actionZone.appendChild(creerBoutonAction(t('car.edit'), 'btn-modifier', voiture.id));
  actionZone.appendChild(creerBoutonAction(t('car.interventions'), 'btn-interventions', voiture.id));
  actionZone.appendChild(creerBoutonAction(t('car.invoice'), 'btn-facture', voiture.id));
  actionZone.appendChild(creerBoutonAction(t('car.delete'), 'btn-supprimer', voiture.id));

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
    afficherToast(t('car.notFound'), 'error');
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
      afficherToast(t('toast.invoiceCanceled'), 'info');
      return;
    }

    console.log('Facture exportée :', resultat.filePath);

    await notifierApplication(t('toast.invoiceExported'), 'success');
  } catch (error) {
    console.error('Erreur export facture :', error);
    afficherToast(error.message || t('error.invoiceExport'), 'error');
  }
}

async function supprimerVoiture(id) {
  const confirmation = await demanderConfirmationNative({
    title: t('confirm.deleteCarTitle'),
    message: t('confirm.deleteCarMessage'),
    detail: t('confirm.deleteCarDetail')
  });

  if (!confirmation) {
    return;
  }

  try {
    await window.electronAPI.supprimerVoiture(id);

    if (state.voitureSelectionnee && Number(state.voitureSelectionnee.id) === id) {
      actions.fermerInterventions();
    }

    await notifierApplication(t('toast.carDeleted'), 'success');

    await afficherVoitures();
  } catch (error) {
    console.error('Erreur suppression voiture :', error);
    afficherToast(error.message || t('error.carDelete'), 'error');
  }
}