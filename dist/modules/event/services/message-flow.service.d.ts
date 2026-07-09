import { MessageType, ProtocolType } from '../../../common/enums';
import { EnrichmentContext } from '../../../common/models';
import { AERegistryService } from '../../ae/services/ae-registry.service';
import { MappingEngineService } from '../../mapping/services/mapping-engine.service';
import { RoutingEngineService } from '../../routing/services/routing-engine.service';
import { HL7BridgeService, HL7ParserService, HL7StandardValidatorService } from '../../hl7/services';
import { CanonicalToHL7Transformer, HL7ToCanonicalTransformer } from '../../hl7/transformers';
import { FHIRBridgeService } from '../../fhir/services/fhir-bridge.service';
import { CanonicalToFHIRTransformer, FHIRToCanonicalTransformer } from '../../fhir/transformers';
import { FHIRValidatorService } from '../../fhir/services/fhir-validator.service';
import { EventTracerService } from './event-tracer.service';
import { ContextEnrichmentService } from '../../validation/services';
export interface CanonicalFlowMessage {
    messageType: MessageType;
    order?: {
        id?: string;
        identifier?: Array<{
            system: string;
            value: string;
        }>;
        code?: {
            code?: string;
            display?: string;
        };
        authoredOn?: string;
        requester?: {
            id?: string;
        };
        subject?: {
            id?: string;
        };
        status?: string;
        priority?: string;
        category?: string[];
    };
    patient?: {
        id?: string;
        identifier?: Array<{
            system: string;
            value: string;
        }>;
        name?: {
            family?: string;
            given?: string[];
            text?: string;
        };
        birthDate?: string;
        gender?: string;
    };
    metadata: Record<string, any>;
}
export interface ProcessMessageRequest {
    sourceAE: string;
    targetAE?: string;
    messageType?: MessageType;
    protocol?: ProtocolType;
    payload: any;
}
export interface ProcessMessageResult {
    success: true;
    messageId: string;
    sourceAE: string;
    targetAE: string;
    messageType: MessageType;
    sourceProtocol: ProtocolType;
    targetProtocol: ProtocolType;
    routeId?: string;
    canonicalMessage: CanonicalFlowMessage;
    outboundMessage: any;
    enrichmentContext: EnrichmentContext;
    enrichmentWarnings: string[];
    message: string;
}
export declare class MessageFlowService {
    private readonly aeRegistry;
    private readonly mappingEngine;
    private readonly routingEngine;
    private readonly hl7Bridge;
    private readonly fhirBridge;
    private readonly hl7Parser;
    private readonly hl7StandardValidator;
    private readonly hl7ToCanonical;
    private readonly canonicalToHl7;
    private readonly fhirValidator;
    private readonly fhirToCanonical;
    private readonly canonicalToFhir;
    private readonly eventTracer;
    private readonly contextEnrichmentService;
    private readonly logger;
    constructor(aeRegistry: AERegistryService, mappingEngine: MappingEngineService, routingEngine: RoutingEngineService, hl7Bridge: HL7BridgeService, fhirBridge: FHIRBridgeService, hl7Parser: HL7ParserService, hl7StandardValidator: HL7StandardValidatorService, hl7ToCanonical: HL7ToCanonicalTransformer, canonicalToHl7: CanonicalToHL7Transformer, fhirValidator: FHIRValidatorService, fhirToCanonical: FHIRToCanonicalTransformer, canonicalToFhir: CanonicalToFHIRTransformer, eventTracer: EventTracerService, contextEnrichmentService: ContextEnrichmentService);
    processHealthstackOrderModel(orderModel: Record<string, any>): Promise<ProcessMessageResult>;
    processHealthstackOrder(hl7Message: string): Promise<ProcessMessageResult>;
    processHealthstackOrderFhir(resource: Record<string, any>): Promise<ProcessMessageResult>;
    processHealthstackPatient(payload: string | Record<string, any>): Promise<ProcessMessageResult>;
    processMessage(request: ProcessMessageRequest): Promise<ProcessMessageResult>;
    listRecentTraces(limit: number): Promise<import("../../../common").EventStream[]>;
    getAuditForMessage(messageId: string): Promise<import("../../../common").MessageEventAuditEntry>;
    private resolveAE;
    private assertAEAccess;
    private resolveMappingBinding;
    private toCanonical;
    private fromCanonical;
    private dispatchMessage;
    private resolveProtocolConfig;
    private resolvePreferredProtocol;
    private resolveRoutingTable;
    private resolveSwitchAE;
    private requireMapping;
    private recordEvent;
    private assertOutboundHl7;
}
export declare function normalizeCanonicalMessage(message: CanonicalFlowMessage, sourcePayload: any, protocol: ProtocolType, messageType: MessageType): CanonicalFlowMessage;
export declare function normalizeOrderCategory(value: unknown): string | undefined;
export declare function detectInboundProtocol(payload: any): ProtocolType;
export declare function inferMessageType(payload: any, protocol: ProtocolType): MessageType;
export declare function extractTargetAE(message: CanonicalFlowMessage | undefined, sourcePayload: any): string | undefined;
//# sourceMappingURL=message-flow.service.d.ts.map