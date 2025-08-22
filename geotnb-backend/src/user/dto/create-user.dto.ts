import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  IsOptional, 
  IsEnum, 
  IsBoolean,
  Matches,
  MaxLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'Admin',
  AGENT_FISCAL = 'AgentFiscal',
  TECHNICIEN_SIG = 'TechnicienSIG',
  LECTEUR = 'Lecteur'
}

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores'
  })
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'
  })
  password: string;

  @ApiProperty({ example: 'john.doe@commune-oujda.ma' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'DUPONT' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nom: string;

  @ApiProperty({ example: 'Jean', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  prenom?: string;

  @ApiProperty({ example: '+212661234567', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^(\+212|0)[5-7][0-9]{8}$/, {
    message: 'Le numéro de téléphone doit être au format marocain valide'
  })
  telephone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.LECTEUR })
  @IsEnum(UserRole)
  profil: UserRole;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  estActif?: boolean;
}