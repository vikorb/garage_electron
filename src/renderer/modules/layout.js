export function renderLayout() {
  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');

  app.innerHTML = `
    <div class="app-shell">
      <header class="top-banner">
        <div>
          <p class="eyebrow" data-i18n="app.eyebrow">Electron Garage App</p>
          <h1>Garage Manager</h1>
          <p data-i18n="app.subtitle">Gestion des véhicules, réparations, interventions et factures.</p>
        </div>

        <div class="top-actions">
          <div class="theme-control">
            <span class="theme-control-label" data-i18n="header.appearance">Apparence</span>

            <div class="theme-select-wrap">
              <select
                id="theme-select"
                aria-label="Choisir le thème de l'application"
                data-i18n-aria="header.appearance"
              >
                <option value="system" data-i18n="theme.system">Système</option>
                <option value="dark" data-i18n="theme.dark">Sombre</option>
                <option value="light" data-i18n="theme.light">Clair</option>
              </select>
            </div>
          </div>

          <div class="language-control">
            <span class="language-control-label" data-i18n="header.language">Langue</span>

            <div class="language-select-wrap">
              <select
                id="language-select"
                aria-label="Choisir la langue de l'application"
                data-i18n-aria="header.language"
              >
                <option value="fr" data-i18n="language.fr">Français</option>
                <option value="en" data-i18n="language.en">Anglais</option>
              </select>
            </div>
          </div>

          <button
            id="btn-ouvrir-ajout-voiture"
            type="button"
            class="btn-primary-header"
            data-i18n="header.newCar"
          >
            + Nouvelle voiture
          </button>
        </div>
      </header>

      <p id="preload-status" data-i18n="system.preloadChecking">Vérification du preload...</p>

      <section class="dashboard-grid">
        <article class="dashboard-card">
          <span data-i18n="dashboard.totalCars">Total voitures</span>
          <strong id="dashboard-total-voitures">0</strong>
        </article>

        <article class="dashboard-card">
          <span data-i18n="dashboard.received">Reçues</span>
          <strong id="dashboard-recu">0</strong>
        </article>

        <article class="dashboard-card">
          <span data-i18n="dashboard.repairing">En réparation</span>
          <strong id="dashboard-reparation">0</strong>
        </article>

        <article class="dashboard-card">
          <span data-i18n="dashboard.ready">Prêtes</span>
          <strong id="dashboard-prete">0</strong>
        </article>

        <article class="dashboard-card">
          <span data-i18n="dashboard.delivered">Livrées</span>
          <strong id="dashboard-livre">0</strong>
        </article>

        <article class="dashboard-card dashboard-money">
          <span data-i18n="dashboard.totalHt">Total interventions HT</span>
          <strong id="dashboard-total-interventions">0 €</strong>
        </article>

        <article class="dashboard-card dashboard-money">
          <span data-i18n="dashboard.totalTtc">Total réparations TTC</span>
          <strong id="dashboard-total-reparations">0 €</strong>
        </article>
      </section>

      <section class="weather-panel">
        <div class="weather-header">
          <div>
            <p class="eyebrow" data-i18n="weather.eyebrow">Météo atelier</p>
            <h2 data-i18n="weather.title">Conditions autour du garage</h2>
            <p id="meteo-ville">Mantes-la-Jolie</p>
          </div>

          <button id="btn-actualiser-meteo" type="button" class="btn-secondary" data-i18n="weather.refresh">
            Actualiser météo
          </button>
        </div>

        <div class="weather-grid">
          <div class="weather-main">
            <span id="meteo-description" data-i18n="weather.loading">Chargement météo...</span>
            <strong id="meteo-temperature">-- °C</strong>
          </div>

          <div class="weather-stat">
            <span data-i18n="weather.humidity">Humidité</span>
            <strong id="meteo-humidite">-- %</strong>
          </div>

          <div class="weather-stat">
            <span data-i18n="weather.wind">Vent</span>
            <strong id="meteo-vent">-- km/h</strong>
          </div>

          <div class="weather-stat">
            <span data-i18n="weather.rain">Pluie</span>
            <strong id="meteo-pluie">-- %</strong>
          </div>
        </div>

        <p id="meteo-conseil" class="weather-advice" data-i18n="weather.analysis">
          Analyse météo en cours...
        </p>
      </section>

      <main class="page-card">
        <div class="section-header">
          <div>
            <h2 data-i18n="garage.title">Accueil garage</h2>
            <p data-i18n="garage.subtitle">Liste des véhicules enregistrés dans le garage.</p>
          </div>

          <div class="section-actions">
            <button id="btn-recharger" type="button" class="btn-secondary" data-i18n="garage.reload">
              Recharger
            </button>

            <button id="btn-reinitialiser-filtres" type="button" class="btn-secondary" data-i18n="garage.resetFilters">
              Réinitialiser filtres
            </button>
          </div>
        </div>

        <div class="toolbar">
          <input
            type="text"
            id="recherche-voitures"
            data-i18n-placeholder="garage.searchPlaceholder"
            placeholder="Rechercher par marque, modèle, client, immatriculation..."
          />

          <select id="filtre-statut">
            <option value="tous" data-i18n="garage.allStatuses">Tous les statuts</option>
            <option value="1" data-i18n="status.received">Reçu</option>
            <option value="2" data-i18n="status.repairing">En réparation</option>
            <option value="3" data-i18n="status.ready">Prête</option>
            <option value="4" data-i18n="status.delivered">Livré</option>
          </select>
        </div>

        <ul id="liste-voitures" class="cars-grid"></ul>
      </main>
    </div>
  `;

  modalRoot.innerHTML = `
    <div id="modal-voiture" class="modal-backdrop hidden">
      <div class="modal-card modal-large">
        <div class="modal-header">
          <div>
            <p class="eyebrow" data-i18n="car.vehicle">Véhicule</p>
            <h2 id="modal-voiture-titre" data-i18n="car.addTitle">Ajouter une voiture</h2>
          </div>

          <button id="btn-fermer-modal-voiture" type="button" class="btn-secondary" data-i18n="car.back">
            Retour
          </button>
        </div>

        <form id="form-voiture" class="form-grid">
          <input type="hidden" id="voiture-id" />

          <div>
            <label for="immatriculation" data-i18n="car.plate">Immatriculation</label>
            <input
              type="text"
              id="immatriculation"
              data-i18n-placeholder="placeholder.plate"
              placeholder="Ex : AB-123-CD"
            />
          </div>

          <div>
            <label for="marque" data-i18n="car.brand">Marque *</label>
            <input
              type="text"
              id="marque"
              data-i18n-placeholder="placeholder.brand"
              placeholder="Ex : Renault"
              required
            />
          </div>

          <div>
            <label for="modele" data-i18n="car.model">Modèle *</label>
            <input
              type="text"
              id="modele"
              data-i18n-placeholder="placeholder.model"
              placeholder="Ex : Clio"
              required
            />
          </div>

          <div>
            <label for="nom_client" data-i18n="car.client">Nom du client</label>
            <input
              type="text"
              id="nom_client"
              data-i18n-placeholder="placeholder.client"
              placeholder="Ex : Jane Doe"
            />
          </div>

          <div>
            <label for="statut" data-i18n="car.status">Statut</label>
            <select id="statut">
              <option value="1" data-i18n="status.received">Reçu</option>
              <option value="2" data-i18n="status.repairing">En réparation</option>
              <option value="3" data-i18n="status.ready">Prête</option>
              <option value="4" data-i18n="status.delivered">Livré</option>
            </select>
          </div>

          <div>
            <label for="prix" data-i18n="car.price">Prix du véhicule</label>
            <input
              type="number"
              id="prix"
              min="0"
              step="0.01"
              data-i18n-placeholder="placeholder.price"
              placeholder="Ex : 8000"
            />
          </div>

          <div class="form-full">
            <label for="description" data-i18n="car.description">Description</label>
            <textarea
              id="description"
              data-i18n-placeholder="placeholder.carDescription"
              placeholder="Ex : Véhicule reçu pour problème moteur"
            ></textarea>
          </div>

          <div class="form-full form-actions">
            <button type="submit" id="btn-submit-voiture" data-i18n="car.save">
              Enregistrer
            </button>

            <button type="button" id="btn-annuler-voiture" class="btn-secondary" data-i18n="car.back">
              Retour
            </button>
          </div>
        </form>

        <p id="message-voiture"></p>
      </div>
    </div>

    <div id="modal-interventions" class="modal-backdrop hidden">
      <div class="modal-card modal-large">
        <div class="modal-header">
          <div>
            <p class="eyebrow" data-i18n="interventions.eyebrow">Interventions</p>
            <h2 data-i18n="interventions.title">Fiche interventions</h2>
          </div>

          <button id="btn-fermer-interventions" type="button" class="btn-secondary" data-i18n="car.back">
            Retour
          </button>
        </div>

        <section class="info-panel">
          <h3 id="intervention-voiture-selectionnee" data-i18n="interventions.selectedVehicle">
            Véhicule sélectionné
          </h3>

          <div class="info-grid">
            <div>
              <span data-i18n="interventions.client">Client</span>
              <strong id="intervention-client">-</strong>
            </div>

            <div>
              <span data-i18n="interventions.plate">Immatriculation</span>
              <strong id="intervention-immatriculation">-</strong>
            </div>

            <div>
              <span data-i18n="interventions.status">Statut</span>
              <strong id="intervention-statut">-</strong>
            </div>
          </div>
        </section>

        <div class="modal-toolbar">
          <button id="btn-ouvrir-ajout-intervention" type="button" data-i18n="interventions.add">
            Ajouter une intervention
          </button>
        </div>

        <p id="message-intervention"></p>

        <h3 data-i18n="interventions.list">Liste des interventions</h3>

        <ul id="liste-interventions" class="intervention-list"></ul>

        <p class="total-line">
          <span data-i18n="interventions.total">Total :</span>
          <strong id="total-interventions">HT : 0 € | TVA : 0 € | TTC : 0 €</strong>
        </p>
      </div>
    </div>

    <div id="modal-intervention-form" class="modal-backdrop modal-nested hidden">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <p class="eyebrow" data-i18n="interventions.singleEyebrow">Intervention</p>
            <h2 id="modal-intervention-titre" data-i18n="interventions.addTitle">Ajouter une intervention</h2>
          </div>

          <button id="btn-fermer-form-intervention" type="button" class="btn-secondary" data-i18n="car.back">
            Retour
          </button>
        </div>

        <form id="form-intervention" class="form-grid">
          <input type="hidden" id="intervention-id" />
          <input type="hidden" id="intervention-voiture-id" />

          <div class="form-full">
            <label for="intervention-description" data-i18n="interventions.description">Description *</label>
            <textarea
              id="intervention-description"
              data-i18n-placeholder="placeholder.interventionDescription"
              placeholder="Ex : Vidange complète, changement pneus, diagnostic moteur..."
              required
            ></textarea>
          </div>

          <div>
            <label for="intervention-prix" data-i18n="interventions.amountHt">Montant HT *</label>
            <input
              type="number"
              id="intervention-prix"
              min="0"
              step="0.01"
              data-i18n-placeholder="placeholder.interventionPrice"
              placeholder="Ex : 120"
              required
            />
          </div>

          <div class="form-full form-actions">
            <button type="submit" id="btn-submit-intervention" data-i18n="car.save">
              Enregistrer
            </button>

            <button type="button" id="btn-annuler-form-intervention" class="btn-secondary" data-i18n="car.back">
              Retour
            </button>
          </div>
        </form>

        <p id="message-intervention-form"></p>
      </div>
    </div>

    <div id="confirmation-modal" class="modal-backdrop hidden">
      <div class="modal-card">
        <h3 data-i18n="confirm.title">Confirmation</h3>
        <p id="confirmation-message" data-i18n="confirm.default">Confirmer l’action ?</p>

        <div class="modal-actions">
          <button id="confirmation-oui" type="button" data-i18n="confirm.confirm">
            Confirmer
          </button>

          <button id="confirmation-non" type="button" class="btn-secondary" data-i18n="confirm.cancel">
            Annuler
          </button>
        </div>
      </div>
    </div>
  `;
}