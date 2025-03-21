import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { ConfigModule } from '@nestjs/config';
import { LendersModule } from 'src/lenders/lenders.module';
import { UsersModule } from 'src/users/users.module';
import { RoomsAndBookingsModule } from 'src/commonService/roomsAndBookings.module';

@Module({
  imports: [ConfigModule, LendersModule, UsersModule, RoomsAndBookingsModule],
  controllers: [BookingsController],
})
export class BookingsModule {}
