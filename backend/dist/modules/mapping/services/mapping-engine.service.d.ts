import { Repository } from 'typeorm';
import { StandardMappingEntity } from '../../core/entities';
import { StandardMapping, MappingResult, MappingContext, MappingEngine } from '../../../common/models';
export declare class MappingEngineService implements MappingEngine {
    private mappingRepository;
    private readonly logger;
    constructor(mappingRepository: Repository<StandardMappingEntity>);
    createMapping(mapping: Omit<StandardMapping, 'id' | 'createdAt' | 'updatedAt'>): Promise<StandardMapping>;
    getMapping(id: string): Promise<StandardMapping | null>;
    updateMapping(id: string, updates: Partial<StandardMapping>): Promise<StandardMapping>;
    listMappings(filters?: {
        sourceProtocol?: string;
        targetProtocol?: string;
        active?: boolean;
    }): Promise<StandardMapping[]>;
    mapMessage(message: any, mapping: StandardMapping, context?: MappingContext): Promise<MappingResult>;
    private executeStep;
    private applySimpleTransformation;
    private applyComplexTransformation;
    private evaluateCondition;
    private evaluateExpression;
}
//# sourceMappingURL=mapping-engine.service.d.ts.map