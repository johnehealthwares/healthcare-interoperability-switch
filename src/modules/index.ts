import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AEModule } from './ae/ae.module';
import { RoutingModule } from './routing/routing.module';
import { MappingModule } from './mapping/mapping.module';
import { EventModule } from './event/event.module';
import { HL7Module } from './hl7/hl7.module';
import { FHIRModule } from './fhir/fhir.module';
import { CoreModule } from './core/core.module';
import { ValidationModule } from './validation/validation.module';
import {
  ApplicationEntityEntity,
  RoutingTableEntity,
  StandardMappingEntity,
  MessageEventEntity,
  EventStreamEntity,
  ValidationRuleEntity,
} from './core/entities';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationEntityEntity,
      RoutingTableEntity,
      StandardMappingEntity,
      MessageEventEntity,
      EventStreamEntity,
      ValidationRuleEntity,
    ]),
    AEModule,
    RoutingModule,
    MappingModule,
    EventModule,
    HL7Module,
    FHIRModule,
    CoreModule,
    ValidationModule,
    HealthModule,
  ],
  exports: [AEModule, RoutingModule, MappingModule, EventModule, HL7Module, FHIRModule, CoreModule, ValidationModule, HealthModule],
})
export class ModulesModule {}
