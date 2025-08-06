import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ParcelleProprietaireService } from './parcelle-proprietaire.service';
import { CreateParcelleProprietaireDto } from './dto/create-parcelle-proprietaire.dto';
import { UpdateParcelleProprietaireDto } from './dto/update-parcelle-proprietaire.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('parcelle-proprietaires')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ParcelleProprietaireController {
  constructor(private readonly service: ParcelleProprietaireService) {}

  @Post()
  @Roles('Admin', 'AgentFiscal')
  create(@Body() dto: CreateParcelleProprietaireDto) {
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
  update(@Param('id') id: number, @Body() dto: UpdateParcelleProprietaireDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
