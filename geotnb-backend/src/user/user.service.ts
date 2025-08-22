import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, MoreThanOrEqual } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SearchUserDto } from './dto/search-user.dto';

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email }
      ],
    });

    if (existingUser) {
      throw new ConflictException('Nom d\'utilisateur ou email déjà utilisé');
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Créer l'utilisateur
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async findAll(searchParams: SearchUserDto = {}): Promise<PaginatedUsers> {
    const { page = 1, limit = 10, sortBy = 'dateCreation', sortOrder = 'DESC', ...filters } = searchParams;
    const skip = (page - 1) * limit;

    const query = this.userRepository.createQueryBuilder('user');

    // Filtres de recherche
    if (filters.username) {
      query.andWhere('user.username ILIKE :username', { 
        username: `%${filters.username}%` 
      });
    }

    if (filters.email) {
      query.andWhere('user.email ILIKE :email', { 
        email: `%${filters.email}%` 
      });
    }

    if (filters.nom) {
      query.andWhere('user.nom ILIKE :nom', { 
        nom: `%${filters.nom}%` 
      });
    }

    if (filters.profil) {
      query.andWhere('user.profil = :profil', { profil: filters.profil });
    }

    if (filters.estActif !== undefined) {
      query.andWhere('user.estActif = :estActif', { estActif: filters.estActif });
    }

    if (filters.actifRecemment) {
      const uneSeamaine = new Date();
      uneSeamaine.setDate(uneSeamaine.getDate() - 7);
      query.andWhere('user.dernierAcces > :date', { date: uneSeamaine });
    }

    // Tri
    query.orderBy(`user.${sortBy}`, sortOrder);

    // Pagination
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} introuvable`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username, estActif: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, estActif: true },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Vérifier les conflits de nom d'utilisateur/email
    if (updateUserDto.username || updateUserDto.email) {
      const conflictConditions = [];
      if (updateUserDto.username) {
        conflictConditions.push({ username: updateUserDto.username });
      }
      if (updateUserDto.email) {
        conflictConditions.push({ email: updateUserDto.email });
      }

      const existingUser = await this.userRepository.findOne({
        where: conflictConditions,
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Nom d\'utilisateur ou email déjà utilisé');
      }
    }

    // Hasher le nouveau mot de passe si fourni
    if (updateUserDto.password) {
      const saltRounds = 12;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // Mettre à jour l'utilisateur
    await this.userRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'] // Inclure le password pour la vérification
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Vérifier l'ancien mot de passe
    const isValidPassword = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);
    
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    
    // Soft delete : désactiver au lieu de supprimer
    await this.userRepository.update(id, { estActif: false });
  }

  async activate(id: number): Promise<User> {
    await this.userRepository.update(id, { estActif: true });
    return await this.findOne(id);
  }

  async deactivate(id: number): Promise<User> {
    await this.userRepository.update(id, { estActif: false });
    return await this.findOne(id);
  }

  async updateLastAccess(id: number): Promise<void> {
    await this.userRepository.update(id, {
      dernierAcces: new Date(),
    });
  }

  async getStatistics() {
    const total = await this.userRepository.count();
    const actifs = await this.userRepository.count({ where: { estActif: true } });
    const inactifs = total - actifs;

    // Statistiques par profil
    const byProfile = await this.userRepository
      .createQueryBuilder('user')
      .select('user.profil', 'profil')
      .addSelect('COUNT(*)', 'count')
      .where('user.estActif = :actif', { actif: true })
      .groupBy('user.profil')
      .getRawMany();

    // Utilisateurs actifs récemment (derniers 7 jours)
    const uneSeamaine = new Date();
    uneSeamaine.setDate(uneSeamaine.getDate() - 7);
    const actifsRecemment = await this.userRepository.count({
      where: {
        estActif: true,
        dernierAcces: MoreThanOrEqual(uneSeamaine)
      }
    });

    // Utilisateurs jamais connectés
    const jamaisConnectes = await this.userRepository.count({
      where: {
        estActif: true,
        dernierAcces: null
      }
    });

    return {
      total,
      actifs,
      inactifs,
      actifsRecemment,
      jamaisConnectes,
      tauxActiviteRecente: actifs > 0 ? Math.round((actifsRecemment / actifs) * 100) : 0,
      byProfile: byProfile.map(item => ({
        profil: item.profil,
        count: parseInt(item.count),
        percentage: actifs > 0 ? Math.round((parseInt(item.count) / actifs) * 100) : 0,
      })),
    };
  }

  // Méthodes avancées
  async findInactiveUsers(days: number = 30): Promise<User[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.estActif = :actif', { actif: true })
      .andWhere('(user.dernierAcces IS NULL OR user.dernierAcces < :date)', { date: cutoffDate })
      .orderBy('user.dernierAcces', 'ASC')
      .getMany();
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { profil: role, estActif: true },
      order: { nom: 'ASC' }
    });
  }
}