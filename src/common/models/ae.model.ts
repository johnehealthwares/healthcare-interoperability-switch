import { ProtocolType, AEStatus, MessageType } from '../enums';

export interface SecuritySettings {
  tlsEnabled: boolean;
  tlsVersion?: string;
  certificatePath?: string;
  privateKeyPath?: string;
  caPath?: string;
  acceptSelfSigned?: boolean;
}

export interface EAVAttribute {
  name: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'date';
  required?: boolean;
}

export interface ProtocolConfig {
  protocol: ProtocolType;
  host: string;
  port: number;
  basePath?: string;
  timeout?: number;
  retryCount?: number;
  retryDelayMs?: number;
  codec?: string;
  status: string;
  hl7Config?: {
    version?: string;
    segmentTerminator?: string;
    fieldSeparator?: string;
    componentSeparator?: string;
    repetitionSeparator?: string;
    escapeCharacter?: string;
  };
  fhirConfig?: {
    version?: string;
    resourceTypes?: string[];
  };
  httpConfig?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    authentication?: 'basic' | 'bearer' | 'oauth2' | 'none';
    authToken?: string;
  };
}

export interface AEMappingBinding {
  messageType: MessageType;
  protocol: ProtocolType;
  mappingId?: string;
}

export interface MappingReference {
  inboundMappingId?: string;
  outboundMappingId?: string;
  inbound?: AEMappingBinding[];
  outbound?: AEMappingBinding[];
}

export interface HDIdentifier {
  namespaceId?: string;
  id?: string;
  idType?: string;
}

export interface AEFacilityProfile {
  facilityId?: string;
  facilityName?: string;
  customId?: string;
  identifier?: HDIdentifier;
}

/** Application Entity (AE) Contract */
export interface ApplicationEntityContract {
  id: string;
  name: string;
  description?: string;
  facilityCode?: string;
  facilityId?: string;
  facilityName?: string;
  customId?: string;
  facilityIdentifier?: HDIdentifier;
  facility?: AEFacilityProfile;
  organizationId?: string;
  status: AEStatus;
  inboundCapabilities: ProtocolType[];
  outboundCapabilities: ProtocolType[];
  inboundConfig: ProtocolConfig[];
  outboundConfig: ProtocolConfig[];
  mappings: MappingReference;
  securitySettings: SecuritySettings;
  attributes?: Record<string, EAVAttribute>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/** AE List Filter Options */
export interface AEListFilter {
  status?: AEStatus;
  protocol?: ProtocolType;
  facilityCode?: string;
  organizationId?: string;
  search?: string;
  skip?: number;
  take?: number;
}

/** AE Creation Payload */
export type AECreatePayload = Omit<
  ApplicationEntityContract,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

/** AE Update Payload */
export type AEUpdatePayload = Partial<Omit<
  ApplicationEntityContract,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>>;

/** AE Response with metadata */
export interface AEResponse {
  data: ApplicationEntityContract;
  message?: string;
}

/** AE List Response */
export interface AEListResponse {
  data: ApplicationEntityContract[];
  total: number;
  skip: number;
  take: number;
}
