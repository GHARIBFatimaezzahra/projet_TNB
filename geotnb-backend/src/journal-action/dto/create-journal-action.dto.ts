import { IsString, IsDate, IsOptional, IsInt } from 'class-validator';

export class CreateJournalActionDto {
  @IsString()
  action: string;

  @IsDate()
  dateHeure: Date;

  @IsString()
  tableCible: string;

  @IsInt()
  idCible: number;

  @IsOptional()
  @IsString()
  details?: string;
}
