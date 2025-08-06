import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FicheFiscale } from './entities/fiche-fiscale.entity';
import { FicheFiscaleService } from './fiche-fiscale.service';
import { FicheFiscaleController } from './fiche-fiscale.controller';
import { ParcelleModule } from '../parcelle/parcelle.module';

@Module({
  imports: [TypeOrmModule.forFeature([FicheFiscale]), ParcelleModule],
  providers: [FicheFiscaleService],
  controllers: [FicheFiscaleController],
})
export class FicheFiscaleModule {}
