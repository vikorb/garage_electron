import { afficherToast } from './ui.js';
import { t } from './i18n.js';

let meteoVille = null;
let meteoDescription = null;
let meteoTemperature = null;
let meteoHumidite = null;
let meteoVent = null;
let meteoPluie = null;
let meteoConseil = null;
let btnActualiserMeteo = null;

let derniereMeteo = null;

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

  window.addEventListener('language-changed', () => {
    if (derniereMeteo) {
      afficherMeteo(derniereMeteo);
    } else {
      afficherChargement();
    }
  });

  chargerMeteoGarage(false);
}

async function chargerMeteoGarage(afficherMessage = false) {
  try {
    afficherChargement();

    const meteo = await window.electronAPI.obtenirMeteoGarage();

    derniereMeteo = meteo;
    afficherMeteo(meteo);

    if (afficherMessage) {
      afficherToast(t('weather.updated'), 'success');
    }
  } catch (error) {
    console.error('Erreur météo :', error);

    derniereMeteo = null;

    meteoDescription.textContent = t('weather.unavailable');
    meteoTemperature.textContent = '-- °C';
    meteoHumidite.textContent = '-- %';
    meteoVent.textContent = '-- km/h';
    meteoPluie.textContent = '--';
    meteoConseil.textContent = t('weather.errorAdvice');

    afficherToast(t('error.weather'), 'error');
  }
}

function afficherMeteo(meteo) {
  meteoVille.textContent = meteo.ville || 'Garage';
  meteoDescription.textContent = getWeatherDescription(meteo.weather_code);
  meteoTemperature.textContent = `${formaterNombre(meteo.temperature)} °C`;
  meteoHumidite.textContent = `${formaterNombre(meteo.humidite)} %`;
  meteoVent.textContent = `${formaterNombre(meteo.vent)} km/h`;

  if (meteo.probabilite_pluie === null || meteo.probabilite_pluie === undefined) {
    meteoPluie.textContent = `${formaterNombre(meteo.precipitation)} mm`;
  } else {
    meteoPluie.textContent = `${formaterNombre(meteo.probabilite_pluie)} %`;
  }

  meteoConseil.textContent = getWeatherAdvice(meteo);
}

function afficherChargement() {
  meteoDescription.textContent = t('weather.loading');
  meteoTemperature.textContent = '-- °C';
  meteoHumidite.textContent = '-- %';
  meteoVent.textContent = '-- km/h';
  meteoPluie.textContent = '--';
  meteoConseil.textContent = t('weather.analysis');
}

function getWeatherDescription(code) {
  const key = `weatherCode.${Number(code)}`;
  const translated = t(key);

  return translated === key ? t('weatherCode.unknown') : translated;
}

function getWeatherAdvice(meteo) {
  const weatherCode = Number(meteo.weather_code || 0);
  const precipitation = Number(meteo.precipitation || 0);
  const rain = Number(meteo.rain || 0);
  const wind = Number(meteo.vent || 0);

  if ([61, 63, 65, 80, 81, 82, 95].includes(weatherCode) || precipitation > 0 || rain > 0) {
    return t('weather.rainAdvice');
  }

  if (wind >= 45) {
    return t('weather.windAdvice');
  }

  if ([45, 48].includes(weatherCode)) {
    return t('weather.fogAdvice');
  }

  return t('weather.conditionsOk');
}

function formaterNombre(valeur) {
  const nombre = Number(valeur);

  if (Number.isNaN(nombre)) {
    return '--';
  }

  return nombre.toFixed(1);
}