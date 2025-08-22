export const FicheIndividuelleTemplate = {
    header: `
      <div class="header">
        <div class="logo">{{commune.nom}}</div>
        <div class="title">FICHE FISCALE TNB - PROPRIÉTÉ INDIVIDUELLE</div>
        <div class="year">Année: {{fiche.annee}}</div>
      </div>
    `,
    
    ficheInfo: `
      <div class="section">
        <h3>Informations de la Fiche</h3>
        <div class="info-grid">
          <div><span class="label">Code Unique:</span> {{fiche.codeunique}}</div>
          <div><span class="label">Date de Génération:</span> {{fiche.dategeneration}}</div>
          <div><span class="label">Date Limite:</span> {{fiche.datelimitepayment}}</div>
          <div><span class="label">Statut:</span> {{fiche.statutpayment}}</div>
        </div>
      </div>
    `,
    
    parcelleInfo: `
      <div class="section">
        <h3>Informations de la Parcelle</h3>
        <div class="info-grid">
          <div><span class="label">Référence:</span> {{parcelle.referencefonciere}}</div>
          <div><span class="label">Surface Totale:</span> {{parcelle.surfacetotale}} m²</div>
          <div><span class="label">Surface Imposable:</span> {{parcelle.surfaceimposable}} m²</div>
          <div><span class="label">Zonage:</span> {{parcelle.zonage}}</div>
          <div><span class="label">Prix/m²:</span> {{parcelle.prixunitairem2}} DH</div>
        </div>
      </div>
    `,
    
    montantSection: `
      <div class="section total-section">
        <h3>Calcul du Montant TNB</h3>
        <div class="calculation">
          <div>Surface imposable: {{parcelle.surfaceimposable}} m²</div>
          <div>Prix unitaire: {{parcelle.prixunitairem2}} DH/m²</div>
          <div class="total">MONTANT TOTAL: {{fiche.montanttnb}} DH</div>
        </div>
      </div>
    `
  };