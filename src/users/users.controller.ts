import {
    Body,
    Get,
    Param,
    Post,
    Patch,
    Delete,
    Req,
  } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './users.dto';
import { CreateAgentProfileDto } from 'src/agent_profile/agent_profile.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService){}

    @Post('Register')
    createUser(@Body() createUserDto: CreateUserDto, @Req() req: Request){
        return this.usersService.createUser(createUserDto, req);
    }

    @Post('Register-agent')
    createAgent(@Body() createAgentDto: CreateAgentProfileDto, @Req() req: Request){
        return this.usersService.createAgent(createAgentDto, req);
    }

   
}
