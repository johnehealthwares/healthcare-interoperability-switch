import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventTracerService } from './services';
import { MessageEventEntity, EventStreamEntity } from '../core/entities';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEventEntity, EventStreamEntity])],
  providers: [EventTracerService],
  exports: [EventTracerService],
})
export class EventModule {}
