import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'Admin',
  AGENT_FISCAL = 'AgentFiscal',
  TECHNICIEN_SIG = 'TechnicienSIG',
  LECTEUR = 'Lecteur'
}

export class RegisterDto {
  @ApiProperty({ example: 'john.doe' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'john.doe@commune-oujda.ma' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'DUPONT' })
  @IsNotEmpty()
  @IsString()
  nom: string;

  @ApiProperty({ example: 'Jean', required: false })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiProperty({ example: '+212661234567', required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.LECTEUR })
  @IsEnum(UserRole)
  profil: UserRole;
}