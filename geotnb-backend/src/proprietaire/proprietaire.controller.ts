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
import { ProprietaireService } from './proprietaire.service';
import { CreateProprietaireDto } from './dto/create-proprietaire.dto';
import { UpdateProprietaireDto } from './dto/update-proprietaire.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('proprietaires')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProprietaireController {
  constructor(private readonly service: ProprietaireService) {}

  @Post()
  @Roles('Admin', 'AgentFiscal')
  create(@Body() dto: CreateProprietaireDto) {
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
  update(@Param('id') id: number, @Body() dto: UpdateProprietaireDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
