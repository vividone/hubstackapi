import {
  Body,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { CreateUserDto } from './users.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/auth/apikey.guard';
import { CustomRequest } from 'src/configs/custom_request';

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

  // @Get('user/:id')
  // async getAUser(@Param('id') id: string) {
  //   return this.usersService.findUserById(id);
  // }
  // @Get('find-by-email')
  // @ApiOperation({ summary: 'Find user by email' })
  // async findUserByEmail(@Query('email') email: string) {
  //   const user = await this.usersService.findUserByEmail(email);

  //   if (!user) {
  //     throw new NotFoundException('User with this email not found.');
  //   }

  //   return user;
  // }

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Individual')
  @Put('update-profile')
  async updateAgentProfile(
    @Body() updateUserDto: CreateUserDto,
    @Req() request: CustomRequest,
  ) {
    const email = request.user.email;
    return await this.usersService.updateUserProfile(email, updateUserDto);
  }
}
