import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationRuleEntity } from '../core/entities';
import { ValidationController } from './controllers';
import {
  CodingConceptClientService,
  ValidationRuleService,
} from './services';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ValidationRuleEntity]),
  ],
  controllers: [ValidationController],
  providers: [CodingConceptClientService, ValidationRuleService],
  exports: [CodingConceptClientService, ValidationRuleService],
})
export class ValidationModule {}
