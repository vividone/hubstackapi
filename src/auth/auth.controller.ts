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

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){}
    @Post('login')
    loginUser(@Body() loginUserDto: LoginUser,@Req() req: Request) {
        return this.authService.loginUser(loginUserDto);
    }
}
