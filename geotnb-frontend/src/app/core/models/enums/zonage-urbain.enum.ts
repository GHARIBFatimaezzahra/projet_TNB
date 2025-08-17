export enum ZonageUrbain {
    ZONE_A = 'Zone A',
    ZONE_B = 'Zone B',
    ZONE_C = 'Zone C',
    ZONE_D = 'Zone D',
    ZONE_E = 'Zone E'
  }
  
  export const ZONAGE_LABELS: Record<ZonageUrbain, string> = {
    [ZonageUrbain.ZONE_A]: 'Zone A - Urbaine Dense',
    [ZonageUrbain.ZONE_B]: 'Zone B - Urbaine Moyenne',
    [ZonageUrbain.ZONE_C]: 'Zone C - Urbaine Périphérique',
    [ZonageUrbain.ZONE_D]: 'Zone D - Rurale Urbanisable',
    [ZonageUrbain.ZONE_E]: 'Zone E - Agricole'
  };
  
  export const ZONAGE_TARIFS: Record<ZonageUrbain, number> = {
    [ZonageUrbain.ZONE_A]: 20,
    [ZonageUrbain.ZONE_B]: 15,
    [ZonageUrbain.ZONE_C]: 10,
    [ZonageUrbain.ZONE_D]: 5,
    [ZonageUrbain.ZONE_E]: 2
  };
  
  export const ZONAGE_DESCRIPTIONS: Record<ZonageUrbain, string> = {
    [ZonageUrbain.ZONE_A]: 'Zone urbaine à forte densité - 20 DH/m²',
    [ZonageUrbain.ZONE_B]: 'Zone urbaine à densité moyenne - 15 DH/m²',
    [ZonageUrbain.ZONE_C]: 'Zone urbaine périphérique - 10 DH/m²',
    [ZonageUrbain.ZONE_D]: 'Zone rurale urbanisable - 5 DH/m²',
    [ZonageUrbain.ZONE_E]: 'Zone agricole - 2 DH/m²'
  };