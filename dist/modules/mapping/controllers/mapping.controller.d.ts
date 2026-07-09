import { MappingEngineService } from '../services';
import { StandardMapping, MappingContext } from '../../../common/models';
export declare class MappingController {
    private mappingService;
    constructor(mappingService: MappingEngineService);
    createMapping(mapping: Omit<StandardMapping, 'id' | 'createdAt' | 'updatedAt'>): Promise<StandardMapping>;
    getMapping(id: string): Promise<StandardMapping>;
    updateMapping(id: string, updates: Partial<StandardMapping>): Promise<StandardMapping>;
    listMappings(sourceProtocol?: string, targetProtocol?: string, active?: boolean): Promise<StandardMapping[]>;
    mapMessage(mappingId: string, data: {
        message: any;
        context?: MappingContext;
    }): Promise<import("../../../common").MappingResult>;
}
//# sourceMappingURL=mapping.controller.d.ts.map