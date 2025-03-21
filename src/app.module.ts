import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { LendersModule } from './lenders/lenders.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import * as dotenv from 'dotenv';
import { RoomsAndBookingsModule } from './commonService/roomsAndBookings.module';
dotenv.config();

@Module({
  imports: [
    RoomsAndBookingsModule,
    UsersModule,
    LendersModule,
    OrganisationsModule,
    RoomsModule,
    BookingsModule,
    AuthModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
