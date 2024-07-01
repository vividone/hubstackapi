import {
  Get,
  UseGuards,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Admin')
  @Get('all-users')
  async findAllUsers() {
    return this.usersService.findAll();
  }
}
