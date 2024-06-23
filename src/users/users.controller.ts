import {
  Body,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './users.dto';
import { CreateAgentProfileDto } from 'src/agent_profile/agent_profile.dto';
import { LoginUser } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('all-users')
  async findAllUsers() {
    return this.usersService.findAll();
  }
}
