import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LendersModule } from 'src/lenders/lenders.module';
import { UsersModule } from 'src/users/users.module';
import { RoomsAndBookingService } from 'src/commonService/roomsAndBookings.service';

@Module({
  imports: [ConfigModule, LendersModule, UsersModule],
  providers: [RoomsAndBookingService],
  exports: [RoomsAndBookingService],
})
export class RoomsAndBookingsModule {}
