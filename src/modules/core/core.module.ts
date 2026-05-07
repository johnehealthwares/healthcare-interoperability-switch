import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagePipelineService } from './services';
import { AEModule } from '../ae/ae.module';
import { RoutingModule } from '../routing/routing.module';
import { MappingModule } from '../mapping/mapping.module';
import { EventModule } from '../event/event.module';
import { HL7Module } from '../hl7/hl7.module';
import { FHIRModule } from '../fhir/fhir.module';

@Module({
  imports: [
    AEModule,
    RoutingModule,
    MappingModule,
    EventModule,
    HL7Module,
    FHIRModule,
  ],
  providers: [MessagePipelineService],
  exports: [MessagePipelineService],
})
export class CoreModule {}
