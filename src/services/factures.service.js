const { trouverVoitureParId } = require('./voitures.service');
const { listerInterventionsParVoiture } = require('./interventions.service');

const TVA_RATE = 0.2;

const I18N = {
  fr: {
    filePrefix: 'facture',
    title: 'Facture garage',
    subtitle: 'Récapitulatif véhicule et interventions',
    invoice: 'Facture',
    vehicleInfo: 'Informations véhicule',
    car: 'Véhicule',
    plate: 'Immatriculation',
    client: 'Client',
    status: 'Statut',
    vehiclePrice: 'Prix du véhicule',
    description: 'Description',
    interventions: 'Interventions',
    noIntervention: 'Aucune intervention enregistrée.',
    intervention: 'Intervention',
    amountHt: 'Montant HT',
    totals: 'Totaux',
    totalHt: 'Total HT',
    vat: 'TVA',
    totalTtc: 'Total TTC',
    generatedAt: 'Générée le',
    noPlate: 'Sans immatriculation',
    noClient: 'Non renseigné',
    noDescription: 'Aucune description.',
    statuses: {
      1: 'Reçu',
      2: 'En réparation',
      3: 'Prête',
      4: 'Livré'
    }
  },

  en: {
    filePrefix: 'invoice',
    title: 'Garage invoice',
    subtitle: 'Vehicle and interventions summary',
    invoice: 'Invoice',
    vehicleInfo: 'Vehicle information',
    car: 'Vehicle',
    plate: 'Plate number',
    client: 'Client',
    status: 'Status',
    vehiclePrice: 'Vehicle price',
    description: 'Description',
    interventions: 'Interventions',
    noIntervention: 'No intervention registered.',
    intervention: 'Intervention',
    amountHt: 'Amount excl. tax',
    totals: 'Totals',
    totalHt: 'Total excl. tax',
    vat: 'VAT',
    totalTtc: 'Total incl. tax',
    generatedAt: 'Generated on',
    noPlate: 'No plate number',
    noClient: 'Not provided',
    noDescription: 'No description.',
    statuses: {
      1: 'Received',
      2: 'Repairing',
      3: 'Ready',
      4: 'Delivered'
    }
  }
};

function normaliserLangue(language) {
  return language === 'en' ? 'en' : 'fr';
}

function echapperHtml(valeur) {
  return String(valeur ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formaterPrix(valeur) {
  const nombre = Number(valeur || 0);

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(nombre);
}

function formaterDate(language) {
  const locale = language === 'en' ? 'en-GB' : 'fr-FR';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(new Date());
}

function calculerTotaux(interventions) {
  const totalHt = interventions.reduce((total, intervention) => {
    return total + Number(intervention.prix || 0);
  }, 0);

  const tva = totalHt * TVA_RATE;
  const totalTtc = totalHt + tva;

  return {
    totalHt,
    tva,
    totalTtc
  };
}

function creerNomFichier(voiture, language) {
  const labels = I18N[language];

  const identifiant = [
    voiture.marque,
    voiture.modele,
    voiture.immatriculation || voiture.id
  ]
    .filter(Boolean)
    .join('-')
    .replaceAll(' ', '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .toLowerCase();

  return `${labels.filePrefix}-${identifiant}.html`;
}

function genererFactureHtml(voitureId, language = 'fr') {
  const langue = normaliserLangue(language);
  const labels = I18N[langue];

  const voiture = trouverVoitureParId(Number(voitureId));

  if (!voiture) {
    throw new Error(langue === 'fr' ? 'Voiture introuvable.' : 'Car not found.');
  }

  const resultatInterventions = listerInterventionsParVoiture(Number(voitureId));
  const interventions = resultatInterventions.interventions || [];
  const totaux = calculerTotaux(interventions);

  const statut = labels.statuses[Number(voiture.statut)] || labels.statuses[1];

  const lignesInterventions = interventions.length === 0
    ? `
      <tr>
        <td colspan="2" class="empty">${labels.noIntervention}</td>
      </tr>
    `
    : interventions
        .map((intervention) => {
          return `
            <tr>
              <td>${echapperHtml(intervention.description)}</td>
              <td class="amount">${formaterPrix(intervention.prix)}</td>
            </tr>
          `;
        })
        .join('');

  const html = `
<!doctype html>
<html lang="${langue}">
<head>
  <meta charset="UTF-8" />
  <title>${echapperHtml(labels.title)}</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 40px;
      font-family: Arial, Helvetica, sans-serif;
      color: #171717;
      background: #f4f0e8;
    }

    .invoice {
      max-width: 900px;
      margin: 0 auto;
      padding: 34px;
      border-radius: 22px;
      background: #ffffff;
      border: 1px solid rgba(20, 20, 20, 0.08);
      box-shadow: 0 24px 60px rgba(35, 31, 25, 0.14);
    }

    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-start;
      margin-bottom: 34px;
      padding-bottom: 24px;
      border-bottom: 3px solid #e00000;
    }

    .eyebrow {
      margin: 0 0 8px;
      color: #d00000;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 12px;
      font-weight: 800;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 34px;
      text-transform: uppercase;
      color: #111111;
    }

    h2 {
      margin: 28px 0 14px;
      padding-left: 12px;
      font-size: 20px;
      border-left: 4px solid #e00000;
    }

    p {
      color: #555555;
    }

    .date {
      text-align: right;
      color: #555555;
      font-size: 14px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-bottom: 18px;
    }

    .info-card {
      padding: 14px 16px;
      border-radius: 14px;
      background: #f7f4ef;
      border: 1px solid rgba(20, 20, 20, 0.08);
    }

    .info-card span {
      display: block;
      margin-bottom: 6px;
      color: #666666;
      font-size: 13px;
    }

    .info-card strong {
      color: #111111;
      font-size: 16px;
    }

    .description {
      padding: 16px;
      border-radius: 14px;
      background: #f7f4ef;
      border: 1px solid rgba(20, 20, 20, 0.08);
      color: #444444;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
      border-radius: 14px;
    }

    th {
      padding: 14px;
      text-align: left;
      color: #ffffff;
      background: #d90000;
    }

    td {
      padding: 14px;
      border-bottom: 1px solid #eeeeee;
      background: #ffffff;
    }

    .amount {
      text-align: right;
      font-weight: 700;
    }

    .empty {
      text-align: center;
      color: #666666;
      background: #f7f4ef;
    }

    .totals {
      margin-top: 26px;
      margin-left: auto;
      max-width: 360px;
      display: grid;
      gap: 10px;
    }

    .total-line {
      display: flex;
      justify-content: space-between;
      padding: 12px 14px;
      border-radius: 12px;
      background: #f7f4ef;
      border: 1px solid rgba(20, 20, 20, 0.08);
    }

    .total-line.final {
      color: #ffffff;
      background: linear-gradient(135deg, #ff1717, #960000);
      font-size: 18px;
      font-weight: 800;
    }

    @media print {
      body {
        padding: 0;
        background: #ffffff;
      }

      .invoice {
        box-shadow: none;
        border: none;
      }
    }
  </style>
</head>

<body>
  <main class="invoice">
    <header class="header">
      <div>
        <p class="eyebrow">Garage Manager</p>
        <h1>${echapperHtml(labels.invoice)}</h1>
        <p>${echapperHtml(labels.subtitle)}</p>
      </div>

      <p class="date">
        ${echapperHtml(labels.generatedAt)}<br />
        <strong>${echapperHtml(formaterDate(langue))}</strong>
      </p>
    </header>

    <section>
      <h2>${echapperHtml(labels.vehicleInfo)}</h2>

      <div class="info-grid">
        <div class="info-card">
          <span>${echapperHtml(labels.car)}</span>
          <strong>${echapperHtml(`${voiture.marque} ${voiture.modele}`)}</strong>
        </div>

        <div class="info-card">
          <span>${echapperHtml(labels.plate)}</span>
          <strong>${echapperHtml(voiture.immatriculation || labels.noPlate)}</strong>
        </div>

        <div class="info-card">
          <span>${echapperHtml(labels.client)}</span>
          <strong>${echapperHtml(voiture.nom_client || labels.noClient)}</strong>
        </div>

        <div class="info-card">
          <span>${echapperHtml(labels.status)}</span>
          <strong>${echapperHtml(statut)}</strong>
        </div>

        <div class="info-card">
          <span>${echapperHtml(labels.vehiclePrice)}</span>
          <strong>${echapperHtml(formaterPrix(voiture.prix))}</strong>
        </div>
      </div>

      <h2>${echapperHtml(labels.description)}</h2>
      <p class="description">${echapperHtml(voiture.description || labels.noDescription)}</p>
    </section>

    <section>
      <h2>${echapperHtml(labels.interventions)}</h2>

      <table>
        <thead>
          <tr>
            <th>${echapperHtml(labels.intervention)}</th>
            <th class="amount">${echapperHtml(labels.amountHt)}</th>
          </tr>
        </thead>

        <tbody>
          ${lignesInterventions}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-line">
          <span>${echapperHtml(labels.totalHt)}</span>
          <strong>${echapperHtml(formaterPrix(totaux.totalHt))}</strong>
        </div>

        <div class="total-line">
          <span>${echapperHtml(labels.vat)}</span>
          <strong>${echapperHtml(formaterPrix(totaux.tva))}</strong>
        </div>

        <div class="total-line final">
          <span>${echapperHtml(labels.totalTtc)}</span>
          <strong>${echapperHtml(formaterPrix(totaux.totalTtc))}</strong>
        </div>
      </div>
    </section>
  </main>
</body>
</html>
  `;

  return {
    html,
    nomFichier: creerNomFichier(voiture, langue)
  };
}

module.exports = {
  genererFactureHtml
};