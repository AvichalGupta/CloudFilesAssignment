import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { ConfigModule } from '@nestjs/config';
import { LendersModule } from 'src/lenders/lenders.module';
import { UsersModule } from 'src/users/users.module';
import { RoomsAndBookingsModule } from 'src/commonService/roomsAndBookings.module';

@Module({
  imports: [ConfigModule, LendersModule, UsersModule, RoomsAndBookingsModule],
  controllers: [RoomsController],
})
export class RoomsModule {}
