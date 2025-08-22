import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalActionService } from './journal-action.service';
import { JournalActionController } from './journal-action.controller';
import { JournalActionInterceptor } from './journal-action.interceptor';
import { JournalAction } from './entities/journal-action.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JournalAction])],
  controllers: [JournalActionController],
  providers: [
    JournalActionService, 
    JournalActionInterceptor
  ],
  exports: [
    JournalActionService, 
    JournalActionInterceptor, 
    TypeOrmModule
  ],
})
export class JournalActionModule {}