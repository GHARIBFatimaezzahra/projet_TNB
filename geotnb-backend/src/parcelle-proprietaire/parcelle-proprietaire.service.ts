import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParcelleProprietaire } from './entities/parcelle-proprietaire.entity';
import { CreateParcelleProprietaireDto } from './dto/create-parcelle-proprietaire.dto';
import { UpdateParcelleProprietaireDto } from './dto/update-parcelle-proprietaire.dto';

@Injectable()
export class ParcelleProprietaireService {
  constructor(
    @InjectRepository(ParcelleProprietaire)
    private repo: Repository<ParcelleProprietaire>,
  ) {}

  create(dto: CreateParcelleProprietaireDto) {
    const record = this.repo.create({
      parcelle: { id: dto.parcelleId },
      proprietaire: { id: dto.proprietaireId },
      quotePart: dto.quotePart,
      montantIndividuel: dto.montantIndividuel,
    });
    return this.repo.save(record);
  }

  findAll() {
    return this.repo.find({ relations: ['parcelle', 'proprietaire'] });
  }

  findOne(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['parcelle', 'proprietaire'],
    });
  }

  async update(id: number, dto: UpdateParcelleProprietaireDto) {
    const existing = await this.repo.findOneBy({ id });
    if (!existing) throw new NotFoundException('Relation non trouvée');

    await this.repo.update(id, {
      parcelle: { id: dto.parcelleId },
      proprietaire: { id: dto.proprietaireId },
      quotePart: dto.quotePart,
      montantIndividuel: dto.montantIndividuel,
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.repo.findOneBy({ id });
    if (!record) throw new NotFoundException('Relation non trouvée');
    await this.repo.delete(id);
  }
}
