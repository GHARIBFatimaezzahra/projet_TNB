import { PartialType } from '@nestjs/mapped-types';
import { CreateFicheFiscaleDto } from './create-fiche-fiscale.dto';

export class UpdateFicheFiscaleDto extends PartialType(CreateFicheFiscaleDto) {}
