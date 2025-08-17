export interface Identifiable {
    id: number | string;
  }
  
  export interface NamedEntity extends Identifiable {
    name: string;
    description?: string;
  }
  
  export interface CodedEntity extends Identifiable {
    code: string;
    label: string;
  }