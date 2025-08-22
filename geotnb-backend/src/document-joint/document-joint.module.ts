import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentJointService } from './document-joint.service';
import { DocumentJointController } from './document-joint.controller';
import { DocumentJoint } from './entities/document-joint.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentJoint]),
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  ],
  controllers: [DocumentJointController],
  providers: [DocumentJointService],
  exports: [DocumentJointService, TypeOrmModule],
})
export class DocumentJointModule {}