import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HL7Module } from '../hl7/hl7.module';
import { FHIRModule } from '../fhir/fhir.module';
import { AEModule } from '../ae/ae.module';
import { RoutingModule } from '../routing/routing.module';
import { MappingModule } from '../mapping/mapping.module';
import { EventTracerService, MessageFlowService } from './services';
import { MockReceiverService } from './services/mock-receiver.service';
import { MessageFlowController } from './controllers';
import {
  MessageEventEntity,
  EventStreamEntity,
  ValidationRuleEntity,
} from '../core/entities';
import { ApplicationEntityEntity } from '../core/entities/application-entity.entity';
import { RoutingTableEntity } from '../core/entities/routing-table.entity';
import { StandardMappingEntity } from '../core/entities/standard-mapping.entity';
import { ValidationModule } from '../validation/validation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageEventEntity,
      EventStreamEntity,
      ApplicationEntityEntity,
      RoutingTableEntity,
      StandardMappingEntity,
      ValidationRuleEntity,
    ]),
    AEModule,
    RoutingModule,
    MappingModule,
    HL7Module,
    FHIRModule,
    ValidationModule,
  ],
  controllers: [MessageFlowController],
  providers: [EventTracerService, MessageFlowService, MockReceiverService],
  exports: [EventTracerService, MessageFlowService, MockReceiverService],
})
export class EventModule {}
