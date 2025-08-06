// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UserProfil } from '../user/user.enums';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    // Convert string to UserProfil enum with validation
    const profil = this.validateAndConvertProfil(dto.profil);
    
    const user = await this.userService.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      profil: profil,
      estActif: true, // Set new users as active by default
    });

    const payload = {
      username: user.username,
      sub: user.id,
      profil: user.profil,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profil: user.profil,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByUsername(dto.username);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      username: user.username,
      sub: user.id,
      profil: user.profil,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profil: user.profil,
      },
    };
  }

  async validateUser(payload: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.userService.findOne(payload.sub);
  }

  private validateAndConvertProfil(profilString: string): UserProfil {
    // Check if the string value exists in the enum
    if (Object.values(UserProfil).includes(profilString as UserProfil)) {
      return profilString as UserProfil;
    }
    
    throw new BadRequestException(`Invalid profil value: ${profilString}`);
  }
}