import { Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { CreateUserDto } from './users.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/auth/apikey.guard';

@ApiTags('User Operations')
@Controller('users')
@UseGuards(ApiKeyGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('all-users')
  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Admin')
  async findAllUsers() {
    return this.usersService.findAll();
  }

  @Get('user/:id')
  async getAUser(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }


  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Individual')
  @Put('update-profile/:id')
  async updateAgentProfile(
    @Param('id') id: string,
    @Body() updateUserDto: CreateUserDto,
  ) {
    return await this.usersService.updateUserProfile(id, updateUserDto);
  }
}
