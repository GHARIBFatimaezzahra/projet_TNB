import { PartialType } from '@nestjs/swagger';
import { CreateParcelleProprietaireDto } from './create-parcelle-proprietaire.dto';

export class UpdateParcelleProprietaireDto extends PartialType(CreateParcelleProprietaireDto) {}