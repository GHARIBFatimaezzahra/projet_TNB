export enum TypeDocument {
    CERTIFICAT = 'Certificat',
    PHOTO = 'Photo',
    REQUISITION = 'Requisition',
    PLAN = 'Plan',
    AUTORISATION = 'Autorisation',
    FICHE_FISCALE = 'Fiche_Fiscale',
    RAPPORT = 'Rapport',
    AUTRE = 'Autre'
  }
  
  export const TYPE_DOCUMENT_DESCRIPTIONS = {
    [TypeDocument.CERTIFICAT]: 'Certificat de propriété',
    [TypeDocument.PHOTO]: 'Photo de la parcelle',
    [TypeDocument.REQUISITION]: 'Réquisition d\'immatriculation',
    [TypeDocument.PLAN]: 'Plan topographique ou cadastral',
    [TypeDocument.AUTORISATION]: 'Autorisation de construire/lotir',
    [TypeDocument.FICHE_FISCALE]: 'Fiche fiscale TNB générée',
    [TypeDocument.RAPPORT]: 'Rapport technique ou expertise',
    [TypeDocument.AUTRE]: 'Autre type de document'
  };
  
  export const TYPE_DOCUMENT_EXTENSIONS = {
    [TypeDocument.CERTIFICAT]: ['.pdf', '.jpg', '.png'],
    [TypeDocument.PHOTO]: ['.jpg', '.jpeg', '.png'],
    [TypeDocument.REQUISITION]: ['.pdf', '.jpg', '.png'],
    [TypeDocument.PLAN]: ['.pdf', '.dwg', '.jpg', '.png'],
    [TypeDocument.AUTORISATION]: ['.pdf', '.jpg', '.png'],
    [TypeDocument.FICHE_FISCALE]: ['.pdf'],
    [TypeDocument.RAPPORT]: ['.pdf', '.doc', '.docx'],
    [TypeDocument.AUTRE]: ['.pdf', '.jpg', '.png', '.doc', '.docx']
  };