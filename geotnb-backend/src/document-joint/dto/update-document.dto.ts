import { PartialType } from '@nestjs/swagger';
import { CreateDocumentDto } from './create-document.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  estValide?: boolean;
}