import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { error } from 'console';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logError('No authorization header');
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = this.extractToken(authHeader);
    return this.validateToken(token, request);
  }

  private extractToken(authHeader: string): string {
    return authHeader.split(' ')[1];
  }

  private async validateToken(token: string, request: any) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      request.user = payload;
      return true;
    } catch (error) {
      this.logError('Token verification failed', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private logError(message: string, error?: any) {
    console.error(message, error);
  }
}
