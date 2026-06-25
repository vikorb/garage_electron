import { afficherToast } from './ui.js';

let meteoVille = null;
let meteoDescription = null;
let meteoTemperature = null;
let meteoHumidite = null;
let meteoVent = null;
let meteoPluie = null;
let meteoConseil = null;
let btnActualiserMeteo = null;

export function initMeteoPanel() {
  meteoVille = document.getElementById('meteo-ville');
  meteoDescription = document.getElementById('meteo-description');
  meteoTemperature = document.getElementById('meteo-temperature');
  meteoHumidite = document.getElementById('meteo-humidite');
  meteoVent = document.getElementById('meteo-vent');
  meteoPluie = document.getElementById('meteo-pluie');
  meteoConseil = document.getElementById('meteo-conseil');
  btnActualiserMeteo = document.getElementById('btn-actualiser-meteo');

  if (btnActualiserMeteo) {
    btnActualiserMeteo.addEventListener('click', () => {
      chargerMeteoGarage(true);
    });
  }

  if (window.electronAPI?.ecouterActualisationMeteoDepuisMenu) {
    window.electronAPI.ecouterActualisationMeteoDepuisMenu(() => {
      chargerMeteoGarage(true);
    });
  }

  chargerMeteoGarage(false);
}

async function chargerMeteoGarage(afficherMessage = false) {
  try {
    afficherChargement();

    const meteo = await window.electronAPI.obtenirMeteoGarage();

    meteoVille.textContent = meteo.ville || 'Garage';
    meteoDescription.textContent = meteo.description || 'Météo inconnue';
    meteoTemperature.textContent = `${formaterNombre(meteo.temperature)} °C`;
    meteoHumidite.textContent = `${formaterNombre(meteo.humidite)} %`;
    meteoVent.textContent = `${formaterNombre(meteo.vent)} km/h`;

    if (meteo.probabilite_pluie === null || meteo.probabilite_pluie === undefined) {
      meteoPluie.textContent = `${formaterNombre(meteo.precipitation)} mm`;
    } else {
      meteoPluie.textContent = `${formaterNombre(meteo.probabilite_pluie)} %`;
    }

    meteoConseil.textContent = meteo.conseil || 'Conditions météo récupérées.';

    if (afficherMessage) {
      afficherToast('Météo actualisée avec succès.', 'success');
    }
  } catch (error) {
    console.error('Erreur météo :', error);

    meteoDescription.textContent = 'Météo indisponible';
    meteoTemperature.textContent = '-- °C';
    meteoHumidite.textContent = '-- %';
    meteoVent.textContent = '-- km/h';
    meteoPluie.textContent = '--';
    meteoConseil.textContent = 'Impossible de récupérer la météo. Vérifie la connexion internet.';

    afficherToast('Erreur lors du chargement de la météo.', 'error');
  }
}

function afficherChargement() {
  meteoDescription.textContent = 'Chargement météo...';
  meteoTemperature.textContent = '-- °C';
  meteoHumidite.textContent = '-- %';
  meteoVent.textContent = '-- km/h';
  meteoPluie.textContent = '--';
  meteoConseil.textContent = 'Analyse météo en cours...';
}

function formaterNombre(valeur) {
  const nombre = Number(valeur);

  if (Number.isNaN(nombre)) {
    return '--';
  }

  return nombre.toFixed(1);
}