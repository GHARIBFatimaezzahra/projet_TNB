export enum StatutPayment {
    EN_ATTENTE = 'EnAttente',
    PAYE = 'Paye',
    RETARD = 'Retard',
    ANNULE = 'Annule'
  }
  
  export const STATUT_PAYMENT_DESCRIPTIONS = {
    [StatutPayment.EN_ATTENTE]: 'En attente de paiement',
    [StatutPayment.PAYE]: 'Payé intégralement',
    [StatutPayment.RETARD]: 'Paiement en retard',
    [StatutPayment.ANNULE]: 'Fiche annulée'
  };
  
  export const STATUT_PAYMENT_COULEURS = {
    [StatutPayment.EN_ATTENTE]: '#FFA500', // Orange
    [StatutPayment.PAYE]: '#28A745', // Vert
    [StatutPayment.RETARD]: '#DC3545', // Rouge
    [StatutPayment.ANNULE]: '#6C757D' // Gris
  };