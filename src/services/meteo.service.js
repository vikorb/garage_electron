const GARAGE_LOCATION = {
  ville: 'Mantes-la-Jolie',
  latitude: 48.9729,
  longitude: 1.7797
};

const WEATHER_CODES = {
  0: 'Ciel dégagé',
  1: 'Principalement dégagé',
  2: 'Partiellement nuageux',
  3: 'Couvert',
  45: 'Brouillard',
  48: 'Brouillard givrant',
  51: 'Bruine légère',
  53: 'Bruine modérée',
  55: 'Bruine dense',
  61: 'Pluie faible',
  63: 'Pluie modérée',
  65: 'Forte pluie',
  71: 'Neige faible',
  73: 'Neige modérée',
  75: 'Forte neige',
  80: 'Averses faibles',
  81: 'Averses modérées',
  82: 'Averses violentes',
  95: 'Orage'
};

function genererConseilGarage(meteo) {
  const precipitation = Number(meteo.precipitation || 0);
  const rain = Number(meteo.rain || 0);
  const wind = Number(meteo.wind_speed_10m || 0);
  const weatherCode = Number(meteo.weather_code || 0);

  if ([61, 63, 65, 80, 81, 82, 95].includes(weatherCode) || precipitation > 0 || rain > 0) {
    return 'Pluie détectée : éviter lavage extérieur et prévoir prudence pour les essais routiers.';
  }

  if (wind >= 45) {
    return 'Vent fort : éviter les manipulations extérieures légères et sécuriser les véhicules.';
  }

  if ([45, 48].includes(weatherCode)) {
    return 'Brouillard : visibilité réduite, prudence sur les essais véhicules.';
  }

  return 'Conditions correctes pour les essais, livraisons et préparation extérieure.';
}

async function recupererMeteoGarage() {
  const url = new URL('https://api.open-meteo.com/v1/forecast');

  url.searchParams.set('latitude', GARAGE_LOCATION.latitude);
  url.searchParams.set('longitude', GARAGE_LOCATION.longitude);
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m'
  );
  url.searchParams.set('daily', 'precipitation_probability_max');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '1');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Erreur API météo : ${response.status}`);
  }

  const data = await response.json();

  const current = data.current || {};
  const daily = data.daily || {};

  const meteo = {
    ville: GARAGE_LOCATION.ville,
    temperature: current.temperature_2m,
    humidite: current.relative_humidity_2m,
    precipitation: current.precipitation,
    rain: current.rain,
    vent: current.wind_speed_10m,
    weather_code: current.weather_code,
    description: WEATHER_CODES[current.weather_code] || 'Météo inconnue',
    probabilite_pluie: Array.isArray(daily.precipitation_probability_max)
      ? daily.precipitation_probability_max[0]
      : null,
    heure: current.time || null
  };

  return {
    ...meteo,
    conseil: genererConseilGarage({
      precipitation: meteo.precipitation,
      rain: meteo.rain,
      wind_speed_10m: meteo.vent,
      weather_code: meteo.weather_code
    })
  };
}

module.exports = {
  recupererMeteoGarage
};