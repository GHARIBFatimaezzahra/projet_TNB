import { PartialType } from '@nestjs/mapped-types';
import { CreateParcelleProprietaireDto } from './create-parcelle-proprietaire.dto';

export class UpdateParcelleProprietaireDto extends PartialType(CreateParcelleProprietaireDto) {}
