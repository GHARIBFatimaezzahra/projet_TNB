import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({ where: { estActif: true } });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { username } });
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    await this.userRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepo.update(id, { estActif: false });
  }
}
