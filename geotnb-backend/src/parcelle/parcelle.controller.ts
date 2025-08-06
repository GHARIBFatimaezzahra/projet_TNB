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
import { ParcelleService } from './parcelle.service';
import { CreateParcelleDto } from './dto/create-parcelle.dto';
import { UpdateParcelleDto } from './dto/update-parcelle.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('parcelles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ParcelleController {
  constructor(private readonly service: ParcelleService) {}

  @Post()
  @Roles('Admin', 'TechnicienSIG')
  create(@Body() dto: CreateParcelleDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Admin', 'TechnicienSIG', 'AgentFiscal', 'Lecteur')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'TechnicienSIG', 'AgentFiscal', 'Lecteur')
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @Roles('Admin', 'TechnicienSIG')
  update(@Param('id') id: number, @Body() dto: UpdateParcelleDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
