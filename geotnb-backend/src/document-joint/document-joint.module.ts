import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentJoint } from './entities/document-joint.entity';
import { DocumentJointService } from './document-joint.service';
import { DocumentJointController } from './document-joint.controller';
import { ParcelleModule } from '../parcelle/parcelle.module';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentJoint]), ParcelleModule],
  providers: [DocumentJointService],
  controllers: [DocumentJointController],
})
export class DocumentJointModule {}
