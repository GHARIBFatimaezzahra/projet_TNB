import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsNumber,
  IsEnum,
  IsObject,
  IsIP
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  VALIDATE = 'VALIDATE',
  GENERATE = 'GENERATE'
}

export class CreateJournalDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  utilisateurId?: number;

  @ApiProperty({ enum: ActionType, example: ActionType.CREATE })
  @IsNotEmpty()
  @IsEnum(ActionType)
  action: ActionType;

  @ApiProperty({ example: 'parcelles' })
  @IsNotEmpty()
  @IsString()
  tableCible: string;

  @ApiProperty({ example: 123, required: false })
  @IsOptional()
  @IsNumber()
  idCible?: number;

  @ApiProperty({ 
    example: { changes: { nom: { old: 'Ancien', new: 'Nouveau' } } },
    required: false 
  })
  @IsOptional()
  @IsObject()
  details?: any;

  @ApiProperty({ example: '192.168.1.1', required: false })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiProperty({ example: 'Mozilla/5.0 ...', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
