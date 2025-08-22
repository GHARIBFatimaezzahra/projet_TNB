import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extension de l'interface Request pour ajouter nos propriétés
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
      userContext?: {
        userId?: number;
        username?: string;
        profil?: string;
      };
    }
  }
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Générer un ID unique pour la requête
    req.requestId = uuidv4();
    req.startTime = Date.now();

    // Ajouter l'ID dans les headers de réponse pour le debugging
    res.setHeader('X-Request-ID', req.requestId);

    // Extraire le contexte utilisateur du JWT si présent
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = this.decodeJwtPayload(token);
        req.userContext = {
          userId: payload.sub,
          username: payload.username,
          profil: payload.profil,
        };
      } catch (error) {
        // Ignorer les erreurs de décodage JWT
        req.userContext = undefined;
      }
    }

    next();
  }

  private decodeJwtPayload(token: string): any {
    try {
      const base64Payload = token.split('.')[1];
      const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
      return JSON.parse(payload);
    } catch {
      return {};
    }
  }
}