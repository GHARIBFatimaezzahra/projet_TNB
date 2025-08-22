import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProprietaireService } from './proprietaire.service';
import { ProprietaireController } from './proprietaire.controller';
import { Proprietaire } from './entities/proprietaire.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proprietaire])],
  controllers: [ProprietaireController],
  providers: [ProprietaireService],
  exports: [ProprietaireService, TypeOrmModule],
})
export class ProprietaireModule {}
