import { IsNumber, IsString } from 'class-validator';

export class CreateFicheFiscaleDto {
  @IsNumber()
  parcelleId: number;

  @IsNumber()
  proprietaireId: number;

  @IsNumber()
  montantTNB: number;

  @IsString()
  annee: string;

  @IsString()
  statut: string;
}
