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
    constructor(private readonly usersService: UsersService){}

    @Post('Register')
    registerUser(@Body() createUserDto: CreateUserDto, @Req() req: Request){
        if(!createUserDto.role){
            throw new BadRequestException('Role is required');
        }
        return this.usersService.createUser(createUserDto, req);
    }

    @Post('Register-agent')
    registerAgent(@Body() createAgentDto: CreateAgentProfileDto, @Req() req: Request){
        if( createAgentDto.role !== 'Agent'){
            throw new BadRequestException('Role must be agent for agent registration')
        }
        return this.usersService.createUser(createAgentDto, req);
    }

    
   
}
