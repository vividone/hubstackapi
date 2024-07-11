import { Module } from '@nestjs/common';
import { SuperAgentProfileController } from './super_agent_profile.controller';
import { SuperAgentProfileService } from './super_agent_profile.service';
import { SuperAgentProfileRepository } from 'src/entity/repositories/super_agent_profile.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { SuperAgent, SuperAgentSchema } from 'src/entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [SuperAgentProfileController],
  providers: [SuperAgentProfileService, SuperAgentProfileRepository],
  imports: [
    MongooseModule.forFeature([
      { name: SuperAgent.name, schema: SuperAgentSchema },
    ]),
    UsersModule,
    JwtModule,
  ],
  exports: [SuperAgentProfileService, SuperAgentProfileRepository],
})
export class SuperAgentProfileModule {}
