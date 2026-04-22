import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutingController } from './controllers';
import { RoutingEngineService } from './services';
import { RoutingTableEntity } from '../core/entities';

@Module({
  imports: [TypeOrmModule.forFeature([RoutingTableEntity])],
  controllers: [RoutingController],
  providers: [RoutingEngineService],
  exports: [RoutingEngineService],
})
export class RoutingModule {}
