import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelleProprietaire } from './entities/parcelle-proprietaire.entity';
import { ParcelleProprietaireService } from './parcelle-proprietaire.service';
import { ParcelleProprietaireController } from './parcelle-proprietaire.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ParcelleProprietaire])],
  providers: [ParcelleProprietaireService],
  controllers: [ParcelleProprietaireController],
})
export class ParcelleProprietaireModule {}
