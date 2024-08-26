import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Users, UserSchema } from 'src/entity';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ApiKeyModule } from 'src/auth/apikey.module';
import { ApiKeyGuard } from 'src/auth/apikey.guard';
import { AgentProfileModule } from 'src/agent_profile/agent_profile.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserRepository, ApiKeyGuard],
  imports: [
    MongooseModule.forFeature([{ name: Users.name, schema: UserSchema }]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    forwardRef(() => AgentProfileModule),
    JwtModule,
    ApiKeyModule,
  ],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
