const { listerVoitures } = require('./voitures.service');
const { listerInterventionsParVoiture } = require('./interventions.service');

function echapperHtml(valeur) {
  return String(valeur ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formaterPrix(valeur) {
  return `${Number(valeur || 0).toFixed(2)} €`;
}

function formaterDate(date = new Date()) {
  return date.toLocaleDateString('fr-FR');
}

function genererNomFichierFacture(voiture) {
  const identifiant = voiture.immatriculation || `${voiture.marque}-${voiture.modele}-${voiture.id}`;

  const nomPropre = String(identifiant)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `facture-${nomPropre}.html`;
}

function genererFactureHtml(voitureId) {
  const idNombre = Number(voitureId);
  const voitures = listerVoitures();

  const voiture = voitures.find((element) => Number(element.id) === idNombre);

  if (!voiture) {
    throw new Error('Voiture introuvable.');
  }

  const resultatInterventions = listerInterventionsParVoiture(idNombre);
  const interventions = resultatInterventions.interventions;

  const lignesHtml = interventions.length > 0
    ? interventions.map((intervention) => `
        <tr>
          <td>${echapperHtml(intervention.description)}</td>
          <td class="price">${formaterPrix(intervention.prix)}</td>
        </tr>
      `).join('')
    : `
        <tr>
          <td>Aucune intervention facturée</td>
          <td class="price">0.00 €</td>
        </tr>
      `;

  const totalHT = resultatInterventions.total_ht || 0;
  const tva = resultatInterventions.tva || 0;
  const totalTTC = resultatInterventions.total_ttc || 0;
  const tauxTVA = Number(resultatInterventions.taux_tva || 0.2) * 100;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Facture ${echapperHtml(voiture.marque)} ${echapperHtml(voiture.modele)}</title>

  <style>
    body {
      margin: 0;
      padding: 40px;
      font-family: Arial, Helvetica, sans-serif;
      color: #1f2937;
      background: #f3f4f6;
    }

    .invoice {
      max-width: 850px;
      margin: 0 auto;
      padding: 40px;
      background: #ffffff;
      border-radius: 18px;
      box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
    }

    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 3px solid #ff1f4b;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }

    h1 {
      margin: 0;
      color: #111827;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .garage {
      color: #ff1f4b;
      font-weight: bold;
      margin-top: 6px;
    }

    .meta {
      text-align: right;
      color: #4b5563;
    }

    .box {
      padding: 18px;
      border-radius: 14px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      margin-bottom: 24px;
    }

    .box h2 {
      margin-top: 0;
      font-size: 1.05rem;
      color: #111827;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 18px;
    }

    th {
      text-align: left;
      background: #111827;
      color: #ffffff;
      padding: 14px;
    }

    td {
      border-bottom: 1px solid #e5e7eb;
      padding: 14px;
    }

    .price {
      text-align: right;
      font-weight: bold;
    }

    .summary {
      width: 340px;
      margin-left: auto;
      margin-top: 28px;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 14px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .summary-row:last-child {
      border-bottom: none;
    }

    .summary-row strong {
      color: #111827;
    }

    .summary-total {
      background: #111827;
      color: #ffffff;
      font-size: 1.15rem;
    }

    .summary-total strong {
      color: #ff1f4b;
      font-size: 1.25rem;
    }

    .footer {
      margin-top: 36px;
      color: #6b7280;
      font-size: 0.9rem;
      text-align: center;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }

      .invoice {
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>

<body>
  <main class="invoice">
    <section class="header">
      <div>
        <h1>Facture</h1>
        <p class="garage">Garage Manager</p>
      </div>

      <div class="meta">
        <p><strong>Date :</strong> ${formaterDate()}</p>
        <p><strong>Facture véhicule #${echapperHtml(voiture.id)}</strong></p>
      </div>
    </section>

    <section class="box">
      <h2>Client et véhicule</h2>

      <p><strong>Client :</strong> ${echapperHtml(voiture.nom_client || 'Non renseigné')}</p>
      <p><strong>Marque :</strong> ${echapperHtml(voiture.marque)}</p>
      <p><strong>Modèle :</strong> ${echapperHtml(voiture.modele)}</p>
      <p><strong>Immatriculation :</strong> ${echapperHtml(voiture.immatriculation || 'Non renseignée')}</p>
    </section>

    <section class="box">
      <h2>Détail des interventions</h2>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="price">Montant HT</th>
          </tr>
        </thead>

        <tbody>
          ${lignesHtml}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-row">
          <span>Total HT</span>
          <strong>${formaterPrix(totalHT)}</strong>
        </div>

        <div class="summary-row">
          <span>TVA ${tauxTVA}%</span>
          <strong>${formaterPrix(tva)}</strong>
        </div>

        <div class="summary-row summary-total">
          <span>Total TTC</span>
          <strong>${formaterPrix(totalTTC)}</strong>
        </div>
      </div>
    </section>

    <p class="footer">
      Facture générée automatiquement par Garage Manager.
    </p>
  </main>
</body>
</html>
`;

  return {
    nomFichier: genererNomFichierFacture(voiture),
    html
  };
}

module.exports = {
  genererFactureHtml
};