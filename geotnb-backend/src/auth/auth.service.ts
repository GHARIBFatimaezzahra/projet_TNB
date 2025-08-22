import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: number;
  username: string;
  profil: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    nom: string;
    prenom: string;
    profil: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userService.findByUsername(username);

    if (user && await bcrypt.compare(password, user.password)) {
      await this.userService.updateLastAccess(user.id);
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      profil: user.profil,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        profil: user.profil,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const user = await this.userService.create(registerDto);

    return this.login({
      username: user.username,
      password: registerDto.password,
    });
  }

  async findById(id: number): Promise<User | null> {
    try {
      return await this.userService.findOne(id);
    } catch {
      return null;
    }
  }
}
