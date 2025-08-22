import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.log('❌ JWT Auth échoué:', { err, info });
      throw err || new Error('Token invalide');
    }
    
    console.log('✅ JWT Auth réussi pour:', user.username);
    return user;
  }
}