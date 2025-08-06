import { PartialType } from '@nestjs/mapped-types';
import { CreateParcelleDto } from './create-parcelle.dto';

export class UpdateParcelleDto extends PartialType(CreateParcelleDto) {}
