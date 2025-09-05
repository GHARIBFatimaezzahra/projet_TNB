import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelleService } from './parcelle.service';
import { ParcelleController } from './parcelle.controller';
import { Parcelle } from './entities/parcelle.entity';
import { ParcelleProprietaire } from '../parcelle-proprietaire/entities/parcelle-proprietaire.entity';
import { Proprietaire } from '../proprietaire/entities/proprietaire.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parcelle, ParcelleProprietaire, Proprietaire])],
  controllers: [ParcelleController],
  providers: [ParcelleService],
  exports: [ParcelleService, TypeOrmModule],
})
export class ParcelleModule {}