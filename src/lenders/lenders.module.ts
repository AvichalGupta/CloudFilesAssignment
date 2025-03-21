import { Module } from '@nestjs/common';
import { LendersService } from './lenders.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [LendersService],
  exports: [LendersService],
})
export class LendersModule {}
