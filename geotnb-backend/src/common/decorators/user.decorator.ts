import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';

/**
 * Decorator pour récupérer l'utilisateur connecté depuis la requête
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/**
 * Decorator pour récupérer seulement l'ID de l'utilisateur connecté
 * @example
 * @Post('action')
 * doAction(@UserId() userId: number) { ... }
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);

/**
 * Decorator pour récupérer le profil de l'utilisateur connecté
 * @example
 * @Get('dashboard')
 * getDashboard(@UserRole() role: string) { ... }
 */
export const UserRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.profil;
  },
);