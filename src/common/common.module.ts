import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import {
  ApplicationEntityEntity,
  RoutingTableEntity,
  StandardMappingEntity,
  ValidationRuleEntity,
} from '../modules/core/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationEntityEntity,
      RoutingTableEntity,
      StandardMappingEntity,
      ValidationRuleEntity,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class CommonModule {}
