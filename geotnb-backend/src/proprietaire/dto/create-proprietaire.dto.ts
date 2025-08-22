import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsBoolean,
  IsEmail,
  Matches,
  MinLength,
  MaxLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NatureProprietaire {
  PHYSIQUE = 'Physique',
  MORALE = 'Morale'
}

export class CreateProprietaireDto {
  @ApiProperty({ example: 'BENNANI' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  nom: string;

  @ApiProperty({ example: 'Mohamed', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  prenom?: string;

  @ApiProperty({ enum: NatureProprietaire, example: NatureProprietaire.PHYSIQUE })
  @IsEnum(NatureProprietaire)
  nature: NatureProprietaire;

  @ApiProperty({ 
    example: 'AB123456',
    description: 'CIN pour personne physique ou RC pour personne morale'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cinOuRc?: string;

  @ApiProperty({ 
    example: 'Rue Mohammed V, Quartier Al Qods, Oujda',
    required: false 
  })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiProperty({ example: '+212661234567', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^(\+212|0)[5-7][0-9]{8}$/, {
    message: 'Le numéro de téléphone doit être au format marocain valide'
  })
  telephone?: string;

  @ApiProperty({ example: 'mohamed.bennani@email.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  estActif?: boolean;
}