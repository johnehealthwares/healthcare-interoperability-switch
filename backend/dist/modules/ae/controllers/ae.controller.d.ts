import { AERegistryService } from '../services';
import { ApplicationEntityContract } from '../../../common/models';
import { ProtocolType, AEStatus } from '../../../common/enums';
export declare class AEController {
    private aeService;
    constructor(aeService: AERegistryService);
    registerAE(contract: Omit<ApplicationEntityContract, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<ApplicationEntityContract>;
    getAE(id: string): Promise<ApplicationEntityContract>;
    getAEByName(name: string): Promise<ApplicationEntityContract>;
    listAEs(status?: AEStatus, protocol?: ProtocolType): Promise<ApplicationEntityContract[]>;
    updateAE(id: string, updates: Partial<ApplicationEntityContract>): Promise<ApplicationEntityContract>;
    deleteAE(id: string): Promise<{
        message: string;
    }>;
    deactivateAE(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=ae.controller.d.ts.map