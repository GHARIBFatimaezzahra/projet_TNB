export const FicheIndivisionTemplate = {
    header: `
      <div class="header">
        <div class="logo">{{commune.nom}}</div>
        <div class="title">FICHE FISCALE TNB - PROPRIÉTÉ EN INDIVISION</div>
        <div class="year">Année: {{fiche.annee}}</div>
      </div>
    `,
    
    proprietairesTable: `
      <div class="section">
        <h3>Propriétaires en Indivision</h3>
        <table class="proprietaires-table">
          <thead>
            <tr>
              <th>Propriétaire</th>
              <th>Nature</th>
              <th>CIN/RC</th>
              <th>Quote-part</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            {{#each proprietaires}}
            <tr>
              <td>{{proprietaire.nom}}</td>
              <td>{{proprietaire.nature}}</td>
              <td>{{proprietaire.cin_ou_rc}}</td>
              <td>{{quotepart}}%</td>
              <td>{{montantindividuel}} DH</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
    `,
    
    repartitionSection: `
      <div class="section">
        <h3>Répartition des Montants</h3>
        <div class="repartition">
          {{#each proprietaires}}
          <div class="proprietaire-line">
            <span>{{proprietaire.nom}}</span>
            <span>{{quotepart}}%</span>
            <span>{{montantindividuel}} DH</span>
          </div>
          {{/each}}
          <div class="total-line">
            <span>TOTAL</span>
            <span>100%</span>
            <span>{{fiche.montanttnb}} DH</span>
          </div>
        </div>
      </div>
    `
  };