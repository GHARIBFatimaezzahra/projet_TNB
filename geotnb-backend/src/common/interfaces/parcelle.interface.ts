import { SpatialEntity, SpatialQuery } from './geometry.interface';
import { FiscalEntity } from './fiscal.interface';
import { AuditableEntity } from './auditable.interface';
import { SearchableEntity } from './searchable.interface';


export interface ParcelleEntity extends SpatialEntity, FiscalEntity, AuditableEntity {
    referenceFonciere: string;
    statutFoncier: 'TF' | 'R' | 'NI' | 'Domanial' | 'Collectif';
    statutOccupation: 'Nu' | 'Construit' | 'En_Construction' | 'Partiellement_Construit';
    zonage: string;
    categorieFiscale?: string;
    etatValidation: 'Brouillon' | 'Valide' | 'Publie' | 'Archive';
  }
  
  export interface ParcelleSearch extends SearchableEntity {
    referenceFonciere?: string;
    zonage?: string;
    statutFoncier?: string;
    statutOccupation?: string;
    etatValidation?: string;
    exonereTnb?: boolean;
    spatial?: SpatialQuery;
  }