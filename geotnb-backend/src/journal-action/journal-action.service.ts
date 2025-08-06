import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalAction } from './entities/journal-action.entity';
import { CreateJournalActionDto } from './dto/create-journal-action.dto';

@Injectable()
export class JournalActionService {
  constructor(
    @InjectRepository(JournalAction)
    private readonly journalActionRepository: Repository<JournalAction>,
  ) {}

  async create(
    createJournalActionDto: CreateJournalActionDto,
  ): Promise<JournalAction> {
    const journalAction = this.journalActionRepository.create(
      createJournalActionDto,
    );
    return this.journalActionRepository.save(journalAction);
  }

  async findAll(): Promise<JournalAction[]> {
    return this.journalActionRepository.find({ relations: ['utilisateur'] });
  }

  async findOne(id: number): Promise<JournalAction> {
    return this.journalActionRepository.findOne({
      where: { id },
      relations: ['utilisateur'],
    });
  }
}
