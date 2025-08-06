import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateProprietaireDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsEnum(['Physique', 'Morale'])
  nature: 'Physique' | 'Morale';

  @IsString()
  @IsNotEmpty()
  cin_ou_rc: string;

  @IsString()
  adresse: string;

  @IsString()
  telephone: string;
}
