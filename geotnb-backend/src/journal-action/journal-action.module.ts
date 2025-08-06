import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalAction } from './entities/journal-action.entity';
import { JournalActionService } from './journal-action.service';
import { JournalActionController } from './journal-action.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JournalAction])],
  providers: [JournalActionService],
  controllers: [JournalActionController],
  exports: [JournalActionService],
})
export class JournalActionModule {}
