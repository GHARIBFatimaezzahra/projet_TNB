import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  profil: 'Admin' | 'AgentFiscal' | 'TechnicienSIG' | 'Lecteur';
}
