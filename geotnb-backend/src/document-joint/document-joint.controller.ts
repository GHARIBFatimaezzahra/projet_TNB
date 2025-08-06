import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { DocumentJointService } from './document-joint.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('document-joints')
export class DocumentJointController {
  constructor(private readonly documentService: DocumentJointService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
  }

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.documentService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.documentService.remove(id);
  }
}
