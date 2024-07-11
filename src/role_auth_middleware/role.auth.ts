import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RolesAuth implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRoles = await this.usersService.getUserRoles(user.userId);

    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('User does not have the required role');
    }

    return true;
  }
}
