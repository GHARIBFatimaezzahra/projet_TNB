import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  nom: string;

  @IsNotEmpty({ message: 'Le nom d\'utilisateur est requis' })
  @IsString()
  @MinLength(3, { message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' })
  username: string;

  @IsEmail({}, { message: 'Format email invalide' })
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @IsNotEmpty({ message: 'Le profil est requis' })
  @IsIn(['Admin', 'AgentFiscal', 'TechnicienSIG', 'Lecteur'], { 
    message: 'Profil invalide' 
  })
  profil: string;

  @IsOptional()
  @IsString()
  telephone?: string;
}