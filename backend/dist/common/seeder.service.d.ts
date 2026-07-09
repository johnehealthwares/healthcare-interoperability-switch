import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ApplicationEntityEntity } from '../modules/core/entities/application-entity.entity';
import { RoutingTableEntity } from '../modules/core/entities/routing-table.entity';
import { StandardMappingEntity } from '../modules/core/entities/standard-mapping.entity';
import { ValidationRuleEntity } from '../modules/core/entities/validation-rule.entity';
export declare class SeederService implements OnModuleInit {
    private readonly aeRepo;
    private readonly routingRepo;
    private readonly mappingRepo;
    private readonly validationRepo;
    constructor(aeRepo: Repository<ApplicationEntityEntity>, routingRepo: Repository<RoutingTableEntity>, mappingRepo: Repository<StandardMappingEntity>, validationRepo: Repository<ValidationRuleEntity>);
    onModuleInit(): Promise<void>;
    private seedAEs;
    private seedMappings;
    private seedValidations;
    private seedRouting;
}
//# sourceMappingURL=seeder.service.d.ts.map