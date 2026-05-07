import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AEController } from './controllers';
import { AERegistryService } from './services';
import { ApplicationEntityEntity } from '../core/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationEntityEntity])],
  controllers: [AEController],
  providers: [AERegistryService],
  exports: [AERegistryService],
})
export class AEModule {}
