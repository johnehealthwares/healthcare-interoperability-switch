import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MappingController } from './controllers';
import { MappingEngineService } from './services';
import { StandardMappingEntity } from '../core/entities';

@Module({
  imports: [TypeOrmModule.forFeature([StandardMappingEntity])],
  controllers: [MappingController],
  providers: [MappingEngineService],
  exports: [MappingEngineService],
})
export class MappingModule {}
