const translations = {
  fr: {
    'app.eyebrow': 'Electron Garage App',
    'app.subtitle': 'Gestion des véhicules, réparations, interventions et factures.',

    'system.preloadChecking': 'Vérification du preload...',
    'system.preloadOk': 'preload OK',
    'system.preloadError': 'Erreur : window.electronAPI est undefined',

    'header.appearance': 'Apparence',
    'header.language': 'Langue',
    'header.newCar': '+ Nouvelle voiture',

    'theme.system': 'Système',
    'theme.dark': 'Sombre',
    'theme.light': 'Clair',

    'language.fr': 'Français',
    'language.en': 'Anglais',

    'dashboard.totalCars': 'Total voitures',
    'dashboard.received': 'Reçues',
    'dashboard.repairing': 'En réparation',
    'dashboard.ready': 'Prêtes',
    'dashboard.delivered': 'Livrées',
    'dashboard.totalHt': 'Total interventions HT',
    'dashboard.totalTtc': 'Total réparations TTC',

    'garage.title': 'Accueil garage',
    'garage.subtitle': 'Liste des véhicules enregistrés dans le garage.',
    'garage.reload': 'Recharger',
    'garage.resetFilters': 'Réinitialiser filtres',
    'garage.searchPlaceholder': 'Rechercher par marque, modèle, client, immatriculation...',
    'garage.allStatuses': 'Tous les statuts',
    'garage.empty': 'Aucune voiture ne correspond à la recherche SQL.',
    'garage.loadError': 'Erreur lors du chargement des voitures.',

    'status.received': 'Reçu',
    'status.repairing': 'En réparation',
    'status.ready': 'Prête',
    'status.delivered': 'Livré',
    'status.unknown': 'Statut inconnu',

    'car.vehicle': 'Véhicule',
    'car.addTitle': 'Ajouter une voiture',
    'car.editTitle': 'Modifier une voiture',
    'car.plate': 'Immatriculation',
    'car.brand': 'Marque *',
    'car.model': 'Modèle *',
    'car.client': 'Nom du client',
    'car.status': 'Statut',
    'car.price': 'Prix du véhicule',
    'car.description': 'Description',
    'car.save': 'Enregistrer',
    'car.back': 'Retour',
    'car.noPlate': 'Sans immatriculation',
    'car.noClient': 'Non renseigné',
    'car.noDescription': 'Aucune description.',
    'car.notFound': 'Voiture introuvable.',
    'car.priceLabel': 'Prix véhicule',
    'car.repairsHt': 'Réparations HT',
    'car.repairVat': 'TVA réparation',
    'car.repairsTtc': 'Total réparations TTC',
    'car.edit': 'Modifier',
    'car.interventions': 'Interventions',
    'car.invoice': 'Facture',
    'car.delete': 'Supprimer',

    'interventions.eyebrow': 'Interventions',
    'interventions.singleEyebrow': 'Intervention',
    'interventions.title': 'Fiche interventions',
    'interventions.selectedVehicle': 'Véhicule sélectionné',
    'interventions.client': 'Client',
    'interventions.plate': 'Immatriculation',
    'interventions.status': 'Statut',
    'interventions.add': 'Ajouter une intervention',
    'interventions.list': 'Liste des interventions',
    'interventions.empty': 'Aucune intervention pour cette voiture.',
    'interventions.total': 'Total :',
    'interventions.totalValue': 'HT : {ht} | TVA : {vat} | TTC : {ttc}',
    'interventions.addTitle': 'Ajouter une intervention',
    'interventions.editTitle': 'Modifier une intervention',
    'interventions.description': 'Description *',
    'interventions.amountHt': 'Montant HT *',
    'interventions.noCarSelected': 'Aucune voiture sélectionnée.',
    'interventions.notFound': 'Intervention introuvable.',
    'interventions.loadError': 'Erreur lors du chargement des interventions.',

    'confirm.title': 'Confirmation',
    'confirm.default': 'Confirmer l’action ?',
    'confirm.confirm': 'Confirmer',
    'confirm.cancel': 'Annuler',
    'confirm.deleteCarTitle': 'Supprimer la voiture',
    'confirm.deleteCarMessage': 'Voulez-vous vraiment supprimer cette voiture ?',
    'confirm.deleteCarDetail': 'Toutes les interventions liées à cette voiture seront aussi supprimées.',
    'confirm.deleteInterventionTitle': 'Supprimer l’intervention',
    'confirm.deleteInterventionMessage': 'Voulez-vous vraiment supprimer cette intervention ?',
    'confirm.deleteInterventionDetail': 'Le total HT / TVA / TTC de la voiture sera recalculé automatiquement.',

    'weather.eyebrow': 'Météo atelier',
    'weather.title': 'Conditions autour du garage',
    'weather.refresh': 'Actualiser météo',
    'weather.loading': 'Chargement météo...',
    'weather.humidity': 'Humidité',
    'weather.wind': 'Vent',
    'weather.rain': 'Pluie',
    'weather.analysis': 'Analyse météo en cours...',
    'weather.unavailable': 'Météo indisponible',
    'weather.errorAdvice': 'Impossible de récupérer la météo. Vérifie la connexion internet.',
    'weather.updated': 'Météo actualisée avec succès.',
    'weather.conditionsOk': 'Conditions correctes pour les essais, livraisons et préparation extérieure.',
    'weather.rainAdvice': 'Pluie détectée : éviter lavage extérieur et prévoir prudence pour les essais routiers.',
    'weather.windAdvice': 'Vent fort : éviter les manipulations extérieures légères et sécuriser les véhicules.',
    'weather.fogAdvice': 'Brouillard : visibilité réduite, prudence sur les essais véhicules.',

    'weatherCode.0': 'Ciel dégagé',
    'weatherCode.1': 'Principalement dégagé',
    'weatherCode.2': 'Partiellement nuageux',
    'weatherCode.3': 'Couvert',
    'weatherCode.45': 'Brouillard',
    'weatherCode.48': 'Brouillard givrant',
    'weatherCode.51': 'Bruine légère',
    'weatherCode.53': 'Bruine modérée',
    'weatherCode.55': 'Bruine dense',
    'weatherCode.61': 'Pluie faible',
    'weatherCode.63': 'Pluie modérée',
    'weatherCode.65': 'Forte pluie',
    'weatherCode.71': 'Neige faible',
    'weatherCode.73': 'Neige modérée',
    'weatherCode.75': 'Forte neige',
    'weatherCode.80': 'Averses faibles',
    'weatherCode.81': 'Averses modérées',
    'weatherCode.82': 'Averses violentes',
    'weatherCode.95': 'Orage',
    'weatherCode.unknown': 'Météo inconnue',

    'toast.reload': 'Données rechargées.',
    'toast.filtersReset': 'Filtres réinitialisés.',
    'toast.carAdded': 'Voiture ajoutée avec succès.',
    'toast.carUpdated': 'Voiture modifiée avec succès.',
    'toast.carDeleted': 'Voiture supprimée avec succès.',
    'toast.invoiceCanceled': 'Export de facture annulé.',
    'toast.invoiceExported': 'Facture exportée avec succès.',
    'toast.interventionAdded': 'Intervention ajoutée avec succès.',
    'toast.interventionUpdated': 'Intervention modifiée avec succès.',
    'toast.interventionDeleted': 'Intervention supprimée avec succès.',

    'notification.carReady': 'La voiture {brand} {model} est maintenant prête.',
    'notification.carCreatedReady': 'La voiture {brand} {model} est créée directement en statut prête.',

    'error.carSave': 'Erreur lors de l’enregistrement.',
    'error.carDelete': 'Erreur lors de la suppression de la voiture.',
    'error.invoiceExport': 'Erreur lors de l’export de la facture.',
    'error.interventionSave': 'Erreur lors de l’enregistrement de l’intervention.',
    'error.interventionDelete': 'Erreur lors de la suppression de l’intervention.',
    'error.weather': 'Erreur lors du chargement de la météo.',

    'placeholder.plate': 'Ex : AB-123-CD',
    'placeholder.brand': 'Ex : Renault',
    'placeholder.model': 'Ex : Clio',
    'placeholder.client': 'Ex : Jane Doe',
    'placeholder.carDescription': 'Ex : Véhicule reçu pour problème moteur',
    'placeholder.price': 'Ex : 8000',
    'placeholder.interventionDescription': 'Ex : Vidange complète, changement pneus, diagnostic moteur...',
    'placeholder.interventionPrice': 'Ex : 120'
  },

  en: {
    'app.eyebrow': 'Electron Garage App',
    'app.subtitle': 'Vehicle, repair, intervention and invoice management.',

    'system.preloadChecking': 'Checking preload...',
    'system.preloadOk': 'preload OK',
    'system.preloadError': 'Error: window.electronAPI is undefined',

    'header.appearance': 'Appearance',
    'header.language': 'Language',
    'header.newCar': '+ New car',

    'theme.system': 'System',
    'theme.dark': 'Dark',
    'theme.light': 'Light',

    'language.fr': 'French',
    'language.en': 'English',

    'dashboard.totalCars': 'Total cars',
    'dashboard.received': 'Received',
    'dashboard.repairing': 'Repairing',
    'dashboard.ready': 'Ready',
    'dashboard.delivered': 'Delivered',
    'dashboard.totalHt': 'Total interventions excl. tax',
    'dashboard.totalTtc': 'Total repairs incl. tax',

    'garage.title': 'Garage dashboard',
    'garage.subtitle': 'List of vehicles registered in the garage.',
    'garage.reload': 'Reload',
    'garage.resetFilters': 'Reset filters',
    'garage.searchPlaceholder': 'Search by brand, model, client, plate number...',
    'garage.allStatuses': 'All statuses',
    'garage.empty': 'No car matches the SQL search.',
    'garage.loadError': 'Error while loading cars.',

    'status.received': 'Received',
    'status.repairing': 'Repairing',
    'status.ready': 'Ready',
    'status.delivered': 'Delivered',
    'status.unknown': 'Unknown status',

    'car.vehicle': 'Vehicle',
    'car.addTitle': 'Add a car',
    'car.editTitle': 'Edit a car',
    'car.plate': 'Plate number',
    'car.brand': 'Brand *',
    'car.model': 'Model *',
    'car.client': 'Client name',
    'car.status': 'Status',
    'car.price': 'Vehicle price',
    'car.description': 'Description',
    'car.save': 'Save',
    'car.back': 'Back',
    'car.noPlate': 'No plate number',
    'car.noClient': 'Not provided',
    'car.noDescription': 'No description.',
    'car.notFound': 'Car not found.',
    'car.priceLabel': 'Vehicle price',
    'car.repairsHt': 'Repairs excl. tax',
    'car.repairVat': 'Repair VAT',
    'car.repairsTtc': 'Repairs incl. tax',
    'car.edit': 'Edit',
    'car.interventions': 'Interventions',
    'car.invoice': 'Invoice',
    'car.delete': 'Delete',

    'interventions.eyebrow': 'Interventions',
    'interventions.singleEyebrow': 'Intervention',
    'interventions.title': 'Intervention file',
    'interventions.selectedVehicle': 'Selected vehicle',
    'interventions.client': 'Client',
    'interventions.plate': 'Plate number',
    'interventions.status': 'Status',
    'interventions.add': 'Add intervention',
    'interventions.list': 'Intervention list',
    'interventions.empty': 'No intervention for this car.',
    'interventions.total': 'Total:',
    'interventions.totalValue': 'Excl. tax: {ht} | VAT: {vat} | Incl. tax: {ttc}',
    'interventions.addTitle': 'Add intervention',
    'interventions.editTitle': 'Edit intervention',
    'interventions.description': 'Description *',
    'interventions.amountHt': 'Amount excl. tax *',
    'interventions.noCarSelected': 'No selected car.',
    'interventions.notFound': 'Intervention not found.',
    'interventions.loadError': 'Error while loading interventions.',

    'confirm.title': 'Confirmation',
    'confirm.default': 'Confirm this action?',
    'confirm.confirm': 'Confirm',
    'confirm.cancel': 'Cancel',
    'confirm.deleteCarTitle': 'Delete car',
    'confirm.deleteCarMessage': 'Do you really want to delete this car?',
    'confirm.deleteCarDetail': 'All interventions linked to this car will also be deleted.',
    'confirm.deleteInterventionTitle': 'Delete intervention',
    'confirm.deleteInterventionMessage': 'Do you really want to delete this intervention?',
    'confirm.deleteInterventionDetail': 'The car total excl. tax / VAT / incl. tax will be recalculated automatically.',

    'weather.eyebrow': 'Workshop weather',
    'weather.title': 'Conditions around the garage',
    'weather.refresh': 'Refresh weather',
    'weather.loading': 'Loading weather...',
    'weather.humidity': 'Humidity',
    'weather.wind': 'Wind',
    'weather.rain': 'Rain',
    'weather.analysis': 'Analyzing weather...',
    'weather.unavailable': 'Weather unavailable',
    'weather.errorAdvice': 'Unable to retrieve weather. Check your internet connection.',
    'weather.updated': 'Weather updated successfully.',
    'weather.conditionsOk': 'Good conditions for test drives, deliveries and outdoor preparation.',
    'weather.rainAdvice': 'Rain detected: avoid outdoor washing and be careful during test drives.',
    'weather.windAdvice': 'Strong wind: avoid light outdoor handling and secure vehicles.',
    'weather.fogAdvice': 'Fog detected: reduced visibility, be careful during test drives.',

    'weatherCode.0': 'Clear sky',
    'weatherCode.1': 'Mainly clear',
    'weatherCode.2': 'Partly cloudy',
    'weatherCode.3': 'Overcast',
    'weatherCode.45': 'Fog',
    'weatherCode.48': 'Freezing fog',
    'weatherCode.51': 'Light drizzle',
    'weatherCode.53': 'Moderate drizzle',
    'weatherCode.55': 'Dense drizzle',
    'weatherCode.61': 'Light rain',
    'weatherCode.63': 'Moderate rain',
    'weatherCode.65': 'Heavy rain',
    'weatherCode.71': 'Light snow',
    'weatherCode.73': 'Moderate snow',
    'weatherCode.75': 'Heavy snow',
    'weatherCode.80': 'Light showers',
    'weatherCode.81': 'Moderate showers',
    'weatherCode.82': 'Violent showers',
    'weatherCode.95': 'Thunderstorm',
    'weatherCode.unknown': 'Unknown weather',

    'toast.reload': 'Data reloaded.',
    'toast.filtersReset': 'Filters reset.',
    'toast.carAdded': 'Car added successfully.',
    'toast.carUpdated': 'Car updated successfully.',
    'toast.carDeleted': 'Car deleted successfully.',
    'toast.invoiceCanceled': 'Invoice export canceled.',
    'toast.invoiceExported': 'Invoice exported successfully.',
    'toast.interventionAdded': 'Intervention added successfully.',
    'toast.interventionUpdated': 'Intervention updated successfully.',
    'toast.interventionDeleted': 'Intervention deleted successfully.',

    'notification.carReady': 'The car {brand} {model} is now ready.',
    'notification.carCreatedReady': 'The car {brand} {model} was created directly with ready status.',

    'error.carSave': 'Error while saving the car.',
    'error.carDelete': 'Error while deleting the car.',
    'error.invoiceExport': 'Error while exporting the invoice.',
    'error.interventionSave': 'Error while saving the intervention.',
    'error.interventionDelete': 'Error while deleting the intervention.',
    'error.weather': 'Error while loading weather.',

    'placeholder.plate': 'Ex: AB-123-CD',
    'placeholder.brand': 'Ex: Renault',
    'placeholder.model': 'Ex: Clio',
    'placeholder.client': 'Ex: Jane Doe',
    'placeholder.carDescription': 'Ex: Vehicle received for engine issue',
    'placeholder.price': 'Ex: 8000',
    'placeholder.interventionDescription': 'Ex: Full oil change, tire replacement, engine diagnosis...',
    'placeholder.interventionPrice': 'Ex: 120'
  }
};

let currentLanguage = 'fr';

export function initI18n() {
  const languageSelect = document.getElementById('language-select');

  if (!languageSelect || !window.electronAPI) {
    translatePage();
    return;
  }

  languageSelect.addEventListener('change', async () => {
    const result = await window.electronAPI.definirLangue(languageSelect.value);
    appliquerLangue(result.language);
  });

  window.electronAPI.obtenirLangue().then((result) => {
    appliquerLangue(result.language);
  });

  window.electronAPI.ecouterLangueMiseAJour((result) => {
    appliquerLangue(result.language);
  });
}

export function getCurrentLanguage() {
  return currentLanguage;
}

export function t(key, params = {}) {
  const dictionary = translations[currentLanguage] || translations.fr;
  let value = dictionary[key] || translations.fr[key] || key;

  Object.entries(params).forEach(([paramKey, paramValue]) => {
    value = value.replaceAll(`{${paramKey}}`, paramValue);
  });

  return value;
}

export function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder));
  });

  document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAria));
  });
}

function appliquerLangue(language) {
  currentLanguage = ['fr', 'en'].includes(language) ? language : 'fr';

  const languageSelect = document.getElementById('language-select');

  if (languageSelect) {
    languageSelect.value = currentLanguage;
  }

  document.documentElement.lang = currentLanguage;
  translatePage();

  window.dispatchEvent(
    new CustomEvent('language-changed', {
      detail: {
        language: currentLanguage
      }
    })
  );
}