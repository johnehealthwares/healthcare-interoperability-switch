import { AEStatus, ProtocolType } from '../../../common/enums';
export declare class ApplicationEntityEntity {
    id: string;
    name: string;
    description: string;
    facilityCode: string;
    organizationId: string;
    status: AEStatus;
    inboundCapabilities: ProtocolType[];
    outboundCapabilities: ProtocolType[];
    inboundConfig: any[];
    outboundConfig: any[];
    mappings: {
        inboundMappingId: string;
        outboundMappingId: string;
    };
    securitySettings: any;
    attributes?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
//# sourceMappingURL=application-entity.entity.d.ts.map