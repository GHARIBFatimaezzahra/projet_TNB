/* =====================================================
   MODULE REQUÊTES SPATIALES
   ===================================================== */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpatialQueriesController } from './spatial-queries.controller';
import { SpatialQueriesService } from './spatial-queries.service';
import { Parcelle } from '../parcelle/entities/parcelle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parcelle])],
  controllers: [SpatialQueriesController],
  providers: [SpatialQueriesService],
  exports: [SpatialQueriesService],
})
export class SpatialQueriesModule {}
