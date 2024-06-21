import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './jwt-payload';
import { LoginUser } from 'src/users/users.entity';
import { UserRepository } from 'src/entity/repositories/user.repo';

@Injectable()
export class AuthService{
    constructor(
        private readonly userRepo : UserRepository,
        private readonly jwtService : JwtService
    ){}

    async validateUser ( email: string, password: string) {
        const user = await this.userRepo.findOne({ email })
        if (user && await user.comparePassword(password)) {
            const { password, ...result } = user.toObject();
            return result;
            }
        return null;
    }

    async generateToken(user: any) {
        const payload: JwtPayload = { email: user.email, userId: user._id, password: user.password };
        return {
          access_token: this.jwtService.sign(payload),
        };
    }

    async loginUser(loginUser: LoginUser) {
        const { email, password } = loginUser;

        const user = await this.userRepo.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            throw new BadRequestException('Invalid credentials');
        }
        return this.generateToken(user);
    }

}
