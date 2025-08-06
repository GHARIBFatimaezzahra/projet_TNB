import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parcelle } from './entities/parcelle.entity';
import { ParcelleService } from './parcelle.service';
import { ParcelleController } from './parcelle.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Parcelle])],
  providers: [ParcelleService],
  controllers: [ParcelleController],
})
export class ParcelleModule {}
