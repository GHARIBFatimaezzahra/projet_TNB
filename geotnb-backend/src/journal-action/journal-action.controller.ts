import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { JournalActionService } from './journal-action.service';
import { CreateJournalActionDto } from './dto/create-journal-action.dto';
import { JournalAction } from './entities/journal-action.entity';

@Controller('journal-actions')
export class JournalActionController {
  constructor(private readonly journalActionService: JournalActionService) {}

  @Post()
  async create(
    @Body() createJournalActionDto: CreateJournalActionDto,
  ): Promise<JournalAction> {
    return this.journalActionService.create(createJournalActionDto);
  }

  @Get()
  async findAll(): Promise<JournalAction[]> {
    return this.journalActionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<JournalAction> {
    return this.journalActionService.findOne(id);
  }
}
