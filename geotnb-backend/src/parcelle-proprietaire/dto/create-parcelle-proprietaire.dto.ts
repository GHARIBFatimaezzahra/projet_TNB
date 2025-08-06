import { IsNumber, IsPositive } from 'class-validator';

export class CreateParcelleProprietaireDto {
  @IsNumber()
  parcelleId: number;

  @IsNumber()
  proprietaireId: number;

  @IsNumber()
  @IsPositive()
  quotePart: number;

  @IsNumber()
  @IsPositive()
  montantIndividuel: number;
}
