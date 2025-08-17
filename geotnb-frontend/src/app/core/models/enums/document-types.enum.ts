export enum DocumentTypes {
    CERTIFICAT = 'Certificat',
    PHOTO = 'Photo',
    REQUISITION = 'Requisition',
    PLAN = 'Plan',
    TITRE_FONCIER = 'Titre_foncier',
    AUTORISATION = 'Autorisation',
    RAPPORT = 'Rapport',
    AUTRE = 'Autre'
  }
  
  export const DOCUMENT_TYPE_LABELS: Record<DocumentTypes, string> = {
    [DocumentTypes.CERTIFICAT]: 'Certificat de propriété',
    [DocumentTypes.PHOTO]: 'Photographie',
    [DocumentTypes.REQUISITION]: 'Réquisition d\'immatriculation',
    [DocumentTypes.PLAN]: 'Plan topographique',
    [DocumentTypes.TITRE_FONCIER]: 'Titre foncier',
    [DocumentTypes.AUTORISATION]: 'Autorisation d\'urbanisme',
    [DocumentTypes.RAPPORT]: 'Rapport technique',
    [DocumentTypes.AUTRE]: 'Autre document'
  };
  
  export const DOCUMENT_TYPE_EXTENSIONS: Record<DocumentTypes, string[]> = {
    [DocumentTypes.CERTIFICAT]: ['pdf', 'jpg', 'png'],
    [DocumentTypes.PHOTO]: ['jpg', 'jpeg', 'png', 'gif'],
    [DocumentTypes.REQUISITION]: ['pdf', 'doc', 'docx'],
    [DocumentTypes.PLAN]: ['pdf', 'dwg', 'dxf', 'jpg', 'png'],
    [DocumentTypes.TITRE_FONCIER]: ['pdf', 'jpg', 'png'],
    [DocumentTypes.AUTORISATION]: ['pdf', 'doc', 'docx'],
    [DocumentTypes.RAPPORT]: ['pdf', 'doc', 'docx'],
    [DocumentTypes.AUTRE]: ['pdf', 'doc', 'docx', 'jpg', 'png', 'xls', 'xlsx']
  };