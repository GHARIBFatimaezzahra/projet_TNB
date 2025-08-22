import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelleProprietaireService } from './parcelle-proprietaire.service';
import { ParcelleProprietaireController } from './parcelle-proprietaire.controller';
import { ParcelleProprietaire } from './entities/parcelle-proprietaire.entity';
import { ParcelleModule } from '../parcelle/parcelle.module';
import { ProprietaireModule } from '../proprietaire/proprietaire.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParcelleProprietaire]),
    ParcelleModule,
    ProprietaireModule,
  ],
  controllers: [ParcelleProprietaireController],
  providers: [ParcelleProprietaireService],
  exports: [ParcelleProprietaireService, TypeOrmModule],
})
export class ParcelleProprietaireModule {}