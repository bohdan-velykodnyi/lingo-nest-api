import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ForbiddenError } from '@nestjs/apollo';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { type UserRole } from '@/modules/user/enum/user-role.enum';
import { type JwtPayload } from '../modules/token/types/jwt-payload';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const ctx = GqlExecutionContext.create(context).getContext();
    const user: JwtPayload = ctx.req.user;

    if (!user) throw new ForbiddenError('Unauthorized');

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenError('Forbidden');
    }

    return true;
  }
}
