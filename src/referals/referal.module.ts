import { Module } from '@nestjs/common';
import { InvitationsController } from './referal.controller';
import { InvitationsService } from './referal.service';
import { InvitationsRepository } from 'src/entity/repositories/invitations.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationSchema, Invitations } from 'src/entity';
import { UsersModule } from 'src/users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  controllers: [InvitationsController],
  providers: [InvitationsService, InvitationsRepository],
  imports: [
    MongooseModule.forFeature([
      { name: Invitations.name, schema: InvitationSchema },
    ]),
    UsersModule,
    JwtModule,
  ],
  exports: [InvitationsService, InvitationsRepository],
})
export class InvitationsModule {}
