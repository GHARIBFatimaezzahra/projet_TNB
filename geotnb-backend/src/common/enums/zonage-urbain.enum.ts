export enum ZonageUrbain {
    ZA = 'ZA',
    ZR1 = 'ZR1',
    ZR2 = 'ZR2', 
    ZR3 = 'ZR3',
    ZC = 'ZC',
    ZI = 'ZI',
    ZT = 'ZT',
    ZV = 'ZV'
  }
  
  export const ZONAGE_DESCRIPTIONS = {
    [ZonageUrbain.ZA]: 'Zone Administrative - Équipements publics',
    [ZonageUrbain.ZR1]: 'Zone Résidentielle R1 - Standing élevé',
    [ZonageUrbain.ZR2]: 'Zone Résidentielle R2 - Standing moyen',
    [ZonageUrbain.ZR3]: 'Zone Résidentielle R3 - Habitat économique',
    [ZonageUrbain.ZC]: 'Zone Commerciale - Activités commerciales',
    [ZonageUrbain.ZI]: 'Zone Industrielle - Activités industrielles',
    [ZonageUrbain.ZT]: 'Zone Touristique - Activités touristiques',
    [ZonageUrbain.ZV]: 'Zone Verte - Espaces verts et parcs'
  };
  
  export const ZONAGE_TARIFS_BASE = {
    [ZonageUrbain.ZA]: 8.0,
    [ZonageUrbain.ZR1]: 12.0,
    [ZonageUrbain.ZR2]: 8.0,
    [ZonageUrbain.ZR3]: 5.0,
    [ZonageUrbain.ZC]: 15.0,
    [ZonageUrbain.ZI]: 10.0,
    [ZonageUrbain.ZT]: 20.0,
    [ZonageUrbain.ZV]: 2.0
  };
  
  export const ZONAGE_COULEURS = {
    [ZonageUrbain.ZA]: '#FF5733',
    [ZonageUrbain.ZR1]: '#33FF57',
    [ZonageUrbain.ZR2]: '#90EE90',
    [ZonageUrbain.ZR3]: '#98FB98',
    [ZonageUrbain.ZC]: '#3357FF',
    [ZonageUrbain.ZI]: '#FF33F5',
    [ZonageUrbain.ZT]: '#FFD700',
    [ZonageUrbain.ZV]: '#228B22'
  };