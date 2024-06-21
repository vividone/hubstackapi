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
import { LoginUser } from 'src/users/users.entity';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/users.dto';
import { CreateAgentProfileDto } from 'src/agent_profile/agent_profile.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){}

    @Post('Register')
    registerUser(@Body() createUserDto: CreateUserDto, @Req() req: Request){
        if(!createUserDto.role){
            throw new BadRequestException('Role is required');
        }
        return this.authService.createUser(createUserDto, req);
    }

    @Post('Register-agent')
    registerAgent(@Body() createAgentDto: CreateAgentProfileDto, @Req() req: Request){
        if( createAgentDto.role !== 'Agent'){
            throw new BadRequestException('Role must be agent for agent registration')
        }
        return this.authService.createUser(createAgentDto, req);
    }

    @Post('login')
    loginUser(@Body() loginUserDto: LoginUser,@Req() req: Request) {
        return this.authService.loginUser(loginUserDto);
    }
}
