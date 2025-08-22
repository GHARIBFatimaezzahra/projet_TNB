import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FicheFiscaleService } from './fiche-fiscale.service';
import { FicheFiscaleController } from './fiche-fiscale.controller';
import { FicheFiscale } from './entities/fiche-fiscale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FicheFiscale])],
  controllers: [FicheFiscaleController],
  providers: [FicheFiscaleService],
  exports: [FicheFiscaleService, TypeOrmModule],
})
export class FicheFiscaleModule {}