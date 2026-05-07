import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { AEModule } from '../ae/ae.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    AEModule,
    ScheduleModule.forRoot(),
  ],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
