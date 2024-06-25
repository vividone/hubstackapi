import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { SuperAgentProfileModule } from 'src/super_agent_profile/super_agent_profile.module';
import { InvitationsRepository } from 'src/entity/repositories/invitations.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationSchema, Invitations } from 'src/entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [InvitationsController],
  providers: [InvitationsService, InvitationsRepository],
  imports: [
    MongooseModule.forFeature([
      { name: Invitations.name, schema: InvitationSchema },
    ]),
    SuperAgentProfileModule,
    UsersModule,
  ],
  exports: [InvitationsService, InvitationsRepository],
})
export class InvitationsModule {}
