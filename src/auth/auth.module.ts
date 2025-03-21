import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { LendersModule } from 'src/lenders/lenders.module';
import { OrganisationsModule } from 'src/organisations/organisations.module';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  imports: [LendersModule, OrganisationsModule, UsersModule, ConfigModule],
})
export class AuthModule {}
