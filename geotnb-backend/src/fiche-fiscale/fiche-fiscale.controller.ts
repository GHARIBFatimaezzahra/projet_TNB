import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FicheFiscaleService } from './fiche-fiscale.service';
import { CreateFicheFiscaleDto } from './dto/create-fiche-fiscale.dto';
import { UpdateFicheFiscaleDto } from './dto/update-fiche-fiscale.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('fiche-fiscales')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FicheFiscaleController {
  constructor(private readonly service: FicheFiscaleService) {}

  @Post()
  @Roles('Admin', 'AgentFiscal')
  create(@Body() dto: CreateFicheFiscaleDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Admin', 'AgentFiscal', 'TechnicienSIG')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'AgentFiscal', 'TechnicienSIG')
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @Roles('Admin', 'AgentFiscal')
  update(@Param('id') id: number, @Body() dto: UpdateFicheFiscaleDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }

  @Get('generate-pdf/:id')
  @Roles('Admin', 'AgentFiscal')
  async generatePDF(@Param('id') id: number, @Res() res: Response) {
    const pdfBuffer = await this.service.generatePDF(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="fiche-fiscale-${id}.pdf"`,
    );
    res.send(pdfBuffer);
  }
}
