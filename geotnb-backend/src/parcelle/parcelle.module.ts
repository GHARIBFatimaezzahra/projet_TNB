import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelleService } from './parcelle.service';
import { ParcelleController } from './parcelle.controller';
import { Parcelle } from './entities/parcelle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parcelle])],
  controllers: [ParcelleController],
  providers: [ParcelleService],
  exports: [ParcelleService, TypeOrmModule],
})
export class ParcelleModule {}