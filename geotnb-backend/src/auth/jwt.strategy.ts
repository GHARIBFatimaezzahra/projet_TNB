import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from './auth.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
    
    // Log après super() pour éviter l'erreur TypeScript
    this.logger.log(`🔑 JWT_SECRET configuré: ${jwtSecret ? 'OUI' : 'NON'}`);
  }

  async validate(payload: JwtPayload): Promise<User> {
    this.logger.log(`🔍 Validation JWT pour l'utilisateur ID: ${payload.sub}`);
    
    const user = await this.authService.findById(payload.sub);
    
    if (!user) {
      this.logger.error(`❌ Utilisateur introuvable pour ID: ${payload.sub}`);
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    this.logger.log(`✅ Utilisateur validé: ${user.username}`);
    return user;
  }
}