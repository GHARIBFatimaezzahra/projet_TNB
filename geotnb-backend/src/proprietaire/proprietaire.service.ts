import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proprietaire } from './entities/proprietaire.entity';
import { CreateProprietaireDto } from './dto/create-proprietaire.dto';
import { UpdateProprietaireDto } from './dto/update-proprietaire.dto';

@Injectable()
export class ProprietaireService {
  constructor(
    @InjectRepository(Proprietaire)
    private repo: Repository<Proprietaire>,
  ) {}

  async create(dto: CreateProprietaireDto): Promise<Proprietaire> {
    const proprietaire = this.repo.create(dto);
    return this.repo.save(proprietaire);
  }

  async findAll(): Promise<Proprietaire[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Proprietaire> {
    const prop = await this.repo.findOneBy({ id });
    if (!prop) throw new NotFoundException('Propriétaire non trouvé');
    return prop;
  }

  async update(id: number, dto: UpdateProprietaireDto): Promise<Proprietaire> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
