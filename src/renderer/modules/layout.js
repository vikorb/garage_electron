export function renderLayout() {
  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');

  app.innerHTML = `
    <div class="app-shell">
      <header class="top-banner">
        <div>
          <p class="eyebrow">Electron Garage App</p>
          <h1>Garage Manager</h1>
          <p>Gestion des véhicules, réparations, interventions et factures.</p>
        </div>

        <div class="top-actions">
          <div class="theme-control">
            <span class="theme-control-label">Apparence</span>

            <div class="theme-select-wrap">
              <select id="theme-select" aria-label="Choisir le thème de l'application">
                <option value="system">Système</option>
                <option value="dark">Sombre</option>
                <option value="light">Clair</option>
              </select>
            </div>
          </div>

          <button id="btn-ouvrir-ajout-voiture" type="button" class="btn-primary-header">
            + Nouvelle voiture
          </button>
        </div>
      </header>

      <p id="preload-status">Vérification du preload...</p>

      <section class="dashboard-grid">
        <article class="dashboard-card">
          <span>Total voitures</span>
          <strong id="dashboard-total-voitures">0</strong>
        </article>

        <article class="dashboard-card">
          <span>Reçues</span>
          <strong id="dashboard-recu">0</strong>
        </article>

        <article class="dashboard-card">
          <span>En réparation</span>
          <strong id="dashboard-reparation">0</strong>
        </article>

        <article class="dashboard-card">
          <span>Prêtes</span>
          <strong id="dashboard-prete">0</strong>
        </article>

        <article class="dashboard-card">
          <span>Livrées</span>
          <strong id="dashboard-livre">0</strong>
        </article>

        <article class="dashboard-card dashboard-money">
          <span>Total interventions HT</span>
          <strong id="dashboard-total-interventions">0 €</strong>
        </article>

        <article class="dashboard-card dashboard-money">
          <span>Total réparations TTC</span>
          <strong id="dashboard-total-reparations">0 €</strong>
        </article>
      </section>

      <section class="weather-panel">
        <div class="weather-header">
          <div>
            <p class="eyebrow">Météo atelier</p>
            <h2>Conditions autour du garage</h2>
            <p id="meteo-ville">Mantes-la-Jolie</p>
          </div>

          <button id="btn-actualiser-meteo" type="button" class="btn-secondary">
            Actualiser météo
          </button>
        </div>

        <div class="weather-grid">
          <div class="weather-main">
            <span id="meteo-description">Chargement météo...</span>
            <strong id="meteo-temperature">-- °C</strong>
          </div>

          <div class="weather-stat">
            <span>Humidité</span>
            <strong id="meteo-humidite">-- %</strong>
          </div>

          <div class="weather-stat">
            <span>Vent</span>
            <strong id="meteo-vent">-- km/h</strong>
          </div>

          <div class="weather-stat">
            <span>Pluie</span>
            <strong id="meteo-pluie">-- %</strong>
          </div>
        </div>

        <p id="meteo-conseil" class="weather-advice">
          Analyse météo en cours...
        </p>
      </section>

      <main class="page-card">
        <div class="section-header">
          <div>
            <h2>Accueil garage</h2>
            <p>Liste des véhicules enregistrés dans le garage.</p>
          </div>

          <div class="section-actions">
            <button id="btn-recharger" type="button" class="btn-secondary">
              Recharger
            </button>

            <button id="btn-reinitialiser-filtres" type="button" class="btn-secondary">
              Réinitialiser filtres
            </button>
          </div>
        </div>

        <div class="toolbar">
          <input
            type="text"
            id="recherche-voitures"
            placeholder="Rechercher par marque, modèle, client, immatriculation..."
          />

          <select id="filtre-statut">
            <option value="tous">Tous les statuts</option>
            <option value="1">Reçu</option>
            <option value="2">En réparation</option>
            <option value="3">Prête</option>
            <option value="4">Livré</option>
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
            <p class="eyebrow">Véhicule</p>
            <h2 id="modal-voiture-titre">Ajouter une voiture</h2>
          </div>

          <button id="btn-fermer-modal-voiture" type="button" class="btn-secondary">
            Retour
          </button>
        </div>

        <form id="form-voiture" class="form-grid">
          <input type="hidden" id="voiture-id" />

          <div>
            <label for="immatriculation">Immatriculation</label>
            <input type="text" id="immatriculation" placeholder="Ex : AB-123-CD" />
          </div>

          <div>
            <label for="marque">Marque *</label>
            <input type="text" id="marque" placeholder="Ex : Renault" required />
          </div>

          <div>
            <label for="modele">Modèle *</label>
            <input type="text" id="modele" placeholder="Ex : Clio" required />
          </div>

          <div>
            <label for="nom_client">Nom du client</label>
            <input type="text" id="nom_client" placeholder="Ex : Jane Doe" />
          </div>

          <div>
            <label for="statut">Statut</label>
            <select id="statut">
              <option value="1">Reçu</option>
              <option value="2">En réparation</option>
              <option value="3">Prête</option>
              <option value="4">Livré</option>
            </select>
          </div>

          <div>
            <label for="prix">Prix du véhicule</label>
            <input type="number" id="prix" min="0" step="0.01" placeholder="Ex : 8000" />
          </div>

          <div class="form-full">
            <label for="description">Description</label>
            <textarea id="description" placeholder="Ex : Véhicule reçu pour problème moteur"></textarea>
          </div>

          <div class="form-full form-actions">
            <button type="submit" id="btn-submit-voiture">
              Enregistrer
            </button>

            <button type="button" id="btn-annuler-voiture" class="btn-secondary">
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
            <p class="eyebrow">Interventions</p>
            <h2>Fiche interventions</h2>
          </div>

          <button id="btn-fermer-interventions" type="button" class="btn-secondary">
            Retour
          </button>
        </div>

        <section class="info-panel">
          <h3 id="intervention-voiture-selectionnee">Véhicule sélectionné</h3>

          <div class="info-grid">
            <div>
              <span>Client</span>
              <strong id="intervention-client">-</strong>
            </div>

            <div>
              <span>Immatriculation</span>
              <strong id="intervention-immatriculation">-</strong>
            </div>

            <div>
              <span>Statut</span>
              <strong id="intervention-statut">-</strong>
            </div>
          </div>
        </section>

        <div class="modal-toolbar">
          <button id="btn-ouvrir-ajout-intervention" type="button">
            Ajouter une intervention
          </button>
        </div>

        <p id="message-intervention"></p>

        <h3>Liste des interventions</h3>

        <ul id="liste-interventions" class="intervention-list"></ul>

        <p class="total-line">
          Total :
          <strong id="total-interventions">HT : 0 € | TVA : 0 € | TTC : 0 €</strong>
        </p>
      </div>
    </div>

    <div id="modal-intervention-form" class="modal-backdrop modal-nested hidden">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <p class="eyebrow">Intervention</p>
            <h2 id="modal-intervention-titre">Ajouter une intervention</h2>
          </div>

          <button id="btn-fermer-form-intervention" type="button" class="btn-secondary">
            Retour
          </button>
        </div>

        <form id="form-intervention" class="form-grid">
          <input type="hidden" id="intervention-id" />
          <input type="hidden" id="intervention-voiture-id" />

          <div class="form-full">
            <label for="intervention-description">Description *</label>
            <textarea
              id="intervention-description"
              placeholder="Ex : Vidange complète, changement pneus, diagnostic moteur..."
              required
            ></textarea>
          </div>

          <div>
            <label for="intervention-prix">Montant HT *</label>
            <input
              type="number"
              id="intervention-prix"
              min="0"
              step="0.01"
              placeholder="Ex : 120"
              required
            />
          </div>

          <div class="form-full form-actions">
            <button type="submit" id="btn-submit-intervention">
              Enregistrer
            </button>

            <button type="button" id="btn-annuler-form-intervention" class="btn-secondary">
              Retour
            </button>
          </div>
        </form>

        <p id="message-intervention-form"></p>
      </div>
    </div>

    <div id="confirmation-modal" class="modal-backdrop hidden">
      <div class="modal-card">
        <h3>Confirmation</h3>
        <p id="confirmation-message">Confirmer l’action ?</p>

        <div class="modal-actions">
          <button id="confirmation-oui" type="button">
            Confirmer
          </button>

          <button id="confirmation-non" type="button" class="btn-secondary">
            Annuler
          </button>
        </div>
      </div>
    </div>
  `;
}