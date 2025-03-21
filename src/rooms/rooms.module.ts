import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { ConfigModule } from '@nestjs/config';
import { LendersModule } from 'src/lenders/lenders.module';
import { RoomsAndBookingService } from 'src/commonService/roomsAndBookings.service';

@Module({
  imports: [ConfigModule, LendersModule],
  controllers: [RoomsController],
  providers: [RoomsAndBookingService],
})
export class RoomsModule {}
