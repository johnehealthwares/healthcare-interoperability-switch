import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AEModule } from './ae/ae.module';
import { RoutingModule } from './routing/routing.module';
import { MappingModule } from './mapping/mapping.module';
import { EventModule } from './event/event.module';
import { HL7Module } from './hl7/hl7.module';
import { FHIRModule } from './fhir/fhir.module';
import { CoreModule } from './core/core.module';
import {
  ApplicationEntityEntity,
  RoutingTableEntity,
  StandardMappingEntity,
  MessageEventEntity,
  EventStreamEntity,
} from './core/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationEntityEntity,
      RoutingTableEntity,
      StandardMappingEntity,
      MessageEventEntity,
      EventStreamEntity,
    ]),
    AEModule,
    RoutingModule,
    MappingModule,
    EventModule,
    HL7Module,
    FHIRModule,
    CoreModule,
  ],
  exports: [AEModule, RoutingModule, MappingModule, EventModule, HL7Module, FHIRModule, CoreModule],
})
export class ModulesModule {}
