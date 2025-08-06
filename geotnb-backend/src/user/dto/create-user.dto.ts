// src/user/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserProfil } from '../user.enums'; // Assurez-vous que UserProfil est bien exporté de 'user.enums.ts'

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEmail()
  email: string;

  @IsEnum(UserProfil)
  profil: UserProfil;

  estActif: boolean;
}
