import { Repository } from 'typeorm';
import { ApplicationEntityEntity } from '../../core/entities';
import { ApplicationEntityContract } from '../../../common/models';
import { ProtocolType, AEStatus } from '../../../common/enums';
export declare class AERegistryService {
    private aeRepository;
    private readonly logger;
    constructor(aeRepository: Repository<ApplicationEntityEntity>);
    registerAE(aeContract: Omit<ApplicationEntityContract, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<ApplicationEntityContract>;
    getAE(id: string): Promise<ApplicationEntityContract | null>;
    getAEByName(name: string): Promise<ApplicationEntityContract | null>;
    listAEs(filters?: {
        status?: AEStatus;
        protocol?: ProtocolType;
        facilityCode?: string;
    }): Promise<ApplicationEntityContract[]>;
    updateAE(id: string, updates: Partial<ApplicationEntityContract>): Promise<ApplicationEntityContract>;
    deactivateAE(id: string): Promise<void>;
    deleteAE(id: string): Promise<void>;
    getAEsByProtocol(protocol: ProtocolType, direction: 'inbound' | 'outbound'): Promise<ApplicationEntityContract[]>;
    validateAEAccess(aeId: string, protocol: ProtocolType, direction: 'inbound' | 'outbound'): Promise<boolean>;
}
//# sourceMappingURL=ae-registry.service.d.ts.map