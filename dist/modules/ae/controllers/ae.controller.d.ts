import { AERegistryService } from '../services';
import { ApplicationEntityContract, AECreatePayload, AEUpdatePayload } from '../../../common/models';
import { ProtocolType } from '../../../common/enums';
export declare class AEController {
    private aeService;
    constructor(aeService: AERegistryService);
    registerAE(contract: AECreatePayload): Promise<ApplicationEntityContract>;
    getStatistics(): Promise<{
        totalAEs: number;
        activeAEs: number;
        inactiveAEs: number;
        byProtocol: Record<string, number>;
        byStatus: Record<string, number>;
    }>;
    getAE(id: string): Promise<ApplicationEntityContract>;
    getAEByName(name: string): Promise<ApplicationEntityContract>;
    listAEs(query: any, page: number, limit: number): Promise<import("../../../common/repository/list").ListResult<ApplicationEntityContract>>;
    updateAE(id: string, updates: AEUpdatePayload): Promise<ApplicationEntityContract>;
    deleteAE(id: string): Promise<void>;
    deactivateAE(id: string): Promise<{
        message: string;
        id: string;
    }>;
    activateAE(id: string): Promise<ApplicationEntityContract>;
    testConnectivity(id: string): Promise<{
        success: boolean;
        message: string;
        timestamp: Date;
    }>;
    getInboundByProtocol(protocol: ProtocolType): Promise<ApplicationEntityContract[]>;
    getOutboundByProtocol(protocol: ProtocolType): Promise<ApplicationEntityContract[]>;
    validateAccess(id: string, protocol: ProtocolType, direction: 'inbound' | 'outbound'): Promise<{
        id: string;
        protocol: ProtocolType;
        direction: "inbound" | "outbound";
        isValid: boolean;
    }>;
}
//# sourceMappingURL=ae.controller.d.ts.map