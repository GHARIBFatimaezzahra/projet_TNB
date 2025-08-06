import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parcelle } from './entities/parcelle.entity';
import { CreateParcelleDto } from './dto/create-parcelle.dto';
import { UpdateParcelleDto } from './dto/update-parcelle.dto';

@Injectable()
export class ParcelleService {
  constructor(
    @InjectRepository(Parcelle)
    private repo: Repository<Parcelle>,
  ) {}

  async create(dto: CreateParcelleDto): Promise<Parcelle> {
    const parcelle = this.repo.create(dto);
    return this.repo.save(parcelle);
  }

  async findAll(): Promise<Parcelle[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Parcelle> {
    const parcelle = await this.repo.findOneBy({ id });
    if (!parcelle) throw new NotFoundException('Parcelle non trouvée');
    return parcelle;
  }

  async update(id: number, dto: UpdateParcelleDto): Promise<Parcelle> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
