import { Injectable } from '@nestjs/common';

export interface FicheData {
  fiche: any;
  parcelle: any;
  proprietaires: any[];
  commune: {
    nom: string;
    adresse: string;
    telephone: string;
    email: string;
  };
}

@Injectable()
export class PDFTemplateService {
  // Template HTML pour fiche individuelle
  generateIndividualTemplate(data: FicheData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fiche Fiscale TNB</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #2c3e50; }
    .title { font-size: 18px; margin: 10px 0; }
    .content { margin: 20px 0; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; display: inline-block; width: 200px; }
    .value { display: inline-block; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .table th { background-color: #f2f2f2; }
    .total { font-size: 18px; font-weight: bold; text-align: right; margin: 20px 0; }
    .footer { margin-top: 40px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${data.commune.nom}</div>
    <div class="title">FICHE FISCALE - TAXE SUR LES TERRAINS NON BÂTIS</div>
    <div>Année: ${data.fiche.annee}</div>
  </div>

  <div class="content">
    <div class="section">
      <h3>Informations de la Fiche</h3>
      <div><span class="label">Code Unique:</span> <span class="value">${data.fiche.codeunique}</span></div>
      <div><span class="label">Date de Génération:</span> <span class="value">${new Date(data.fiche.dategeneration).toLocaleDateString('fr-FR')}</span></div>
      <div><span class="label">Date Limite de Paiement:</span> <span class="value">${new Date(data.fiche.datelimitepayment).toLocaleDateString('fr-FR')}</span></div>
    </div>

    <div class="section">
      <h3>Informations de la Parcelle</h3>
      <div><span class="label">Référence Foncière:</span> <span class="value">${data.parcelle.referencefonciere}</span></div>
      <div><span class="label">Surface Totale:</span> <span class="value">${data.parcelle.surfacetotale} m²</span></div>
      <div><span class="label">Surface Imposable:</span> <span class="value">${data.parcelle.surfaceimposable} m²</span></div>
      <div><span class="label">Statut Foncier:</span> <span class="value">${data.parcelle.statutfoncier}</span></div>
      <div><span class="label">Zonage:</span> <span class="value">${data.parcelle.zonage}</span></div>
      <div><span class="label">Prix Unitaire:</span> <span class="value">${data.parcelle.prixunitairem2} DH/m²</span></div>
    </div>

    <div class="section">
      <h3>Propriétaire(s)</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Nature</th>
            <th>CIN/RC</th>
            <th>Quote-part</th>
            <th>Montant Individuel</th>
          </tr>
        </thead>
        <tbody>
          ${data.proprietaires.map(p => `
            <tr>
              <td>${p.proprietaire.nom}</td>
              <td>${p.proprietaire.nature}</td>
              <td>${p.proprietaire.cin_ou_rc || '-'}</td>
              <td>${(p.quotepart * 100).toFixed(2)}%</td>
              <td>${p.montantindividuel.toFixed(2)} DH</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="total">
      <div>MONTANT TOTAL TNB: ${data.fiche.montanttnb.toFixed(2)} DH</div>
    </div>
  </div>

  <div class="footer">
    <p>${data.commune.nom}</p>
    <p>${data.commune.adresse}</p>
    <p>Tél: ${data.commune.telephone} | Email: ${data.commune.email}</p>
  </div>
</body>
</html>
    `;
  }

  // Template pour fiche d'indivision
  generateIndivisionTemplate(data: FicheData): string {
    return this.generateIndividualTemplate(data); // Même template pour l'instant
  }

  // Template pour reçu de paiement
  generateReceiptTemplate(data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reçu de Paiement TNB</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; border-bottom: 2px solid #27ae60; padding-bottom: 20px; }
    .receipt-title { font-size: 20px; color: #27ae60; font-weight: bold; }
    .content { margin: 30px 0; }
    .amount { font-size: 24px; font-weight: bold; color: #27ae60; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="receipt-title">REÇU DE PAIEMENT</div>
    <div>Taxe sur les Terrains Non Bâtis</div>
  </div>

  <div class="content">
    <div>Reçu N°: ${data.numeroRecu}</div>
    <div>Date de Paiement: ${new Date(data.datePaiement).toLocaleDateString('fr-FR')}</div>
    <div>Code Fiche: ${data.codeFiche}</div>
    
    <div class="amount">
      Montant Payé: ${data.montantPaye.toFixed(2)} DH
    </div>
    
    <div style="margin-top: 30px;">
      <p>Paiement effectué pour la parcelle ${data.referenceParcelle}</p>
      <p>Année fiscale: ${data.annee}</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}