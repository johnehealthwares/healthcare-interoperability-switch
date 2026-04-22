import { ProtocolType, MessageType } from '../enums';
export interface MappingStep {
    id: string;
    name: string;
    description?: string;
    type: 'field-map' | 'transform' | 'conditional' | 'aggregate' | 'lookup' | 'custom-js';
    sourceField: string;
    targetField: string;
    transformation?: string | MappingTransformation;
    condition?: string;
    fallbackValue?: any;
    required?: boolean;
}
export interface MappingTransformation {
    type: 'uppercase' | 'lowercase' | 'dateFormat' | 'concat' | 'split' | 'slice' | 'replace' | 'regex' | 'custom' | 'lookup' | 'calculate';
    params?: Record<string, any>;
    expression?: string;
}
export interface LookupConfig {
    source: 'database' | 'cache' | 'api' | 'file';
    query?: string;
    endpoint?: string;
    cacheExpiry?: number;
    defaultValue?: any;
}
export interface StandardMapping {
    id: string;
    name: string;
    description?: string;
    sourceProtocol: ProtocolType;
    targetProtocol: ProtocolType;
    sourceMessageType: MessageType;
    targetMessageType: MessageType;
    mappingSteps: MappingStep[];
    globalLookups?: Record<string, LookupConfig>;
    version: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface MappingContext {
    sourceMessage: any;
    targetMessage?: any;
    variables?: Record<string, any>;
    lookupCache?: Map<string, any>;
}
export interface MappingResult {
    success: boolean;
    targetMessage?: any;
    errors?: string[];
    metadata?: Record<string, any>;
    executionTime?: number;
}
export interface MappingEngine {
    mapMessage(message: any, mapping: StandardMapping, context?: MappingContext): Promise<MappingResult>;
}
//# sourceMappingURL=mapping.model.d.ts.map