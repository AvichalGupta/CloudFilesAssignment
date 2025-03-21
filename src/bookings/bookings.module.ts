import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { ConfigModule } from '@nestjs/config';
import { RoomsAndBookingService } from 'src/commonService/roomsAndBookings.service';

@Module({
  imports: [ConfigModule],
  controllers: [BookingsController],
  providers: [RoomsAndBookingService],
})
export class BookingsModule {}
