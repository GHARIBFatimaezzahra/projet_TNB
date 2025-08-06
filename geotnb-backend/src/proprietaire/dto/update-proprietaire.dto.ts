import { PartialType } from '@nestjs/mapped-types';
import { CreateProprietaireDto } from './create-proprietaire.dto';

export class UpdateProprietaireDto extends PartialType(CreateProprietaireDto) {}
