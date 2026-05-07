import { AEStatus, ProtocolType } from '../../../common/enums';
import { MappingReference } from '../../../common/models';
export declare class ApplicationEntityEntity {
    id: string;
    name: string;
    description: string;
    facilityCode: string;
    facilityId: string;
    facilityName: string;
    customId: string;
    facilityIdentifier?: Record<string, any>;
    facility?: Record<string, any>;
    organizationId: string;
    status: AEStatus;
    inboundCapabilities: ProtocolType[];
    outboundCapabilities: ProtocolType[];
    inboundConfig: any[];
    outboundConfig: any[];
    mappings: MappingReference;
    securitySettings: any;
    attributes?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
//# sourceMappingURL=application-entity.entity.d.ts.map