import { Module } from '@nestjs/common';
import { SuperAgentProfileController } from './super_agent_profile.controller';
import { SuperAgentProfileService } from './super_agent_profile.service';
import { SuperAgentProfileRepository } from 'src/entity/repositories/super_agent_profile.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { SuperAgentProfile } from './super_agent_profile.entity';
import { SuperAgent, SuperAgentSchema } from 'src/entity';

@Module({
  controllers: [SuperAgentProfileController],
  providers: [SuperAgentProfileService, SuperAgentProfileRepository],
  imports: [
    MongooseModule.forFeature([
      { name: SuperAgent.name, schema: SuperAgentSchema },
    ]),
  ],
  exports: [SuperAgentProfileService, SuperAgentProfileRepository],
})
export class SuperAgentProfileModule {}
