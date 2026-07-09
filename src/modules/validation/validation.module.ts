import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationRuleEntity } from '../core/entities';
import { ValidationController } from './controllers';
import {
  CodingConceptClientService,
  ContextEnrichmentService,
  ValidationRuleService,
} from './services';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ValidationRuleEntity]),
  ],
  controllers: [ValidationController],
  providers: [
    CodingConceptClientService,
    ContextEnrichmentService,
    ValidationRuleService,
  ],
  exports: [
    CodingConceptClientService,
    ContextEnrichmentService,
    ValidationRuleService,
  ],
})
export class ValidationModule {}
