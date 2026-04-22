import { AERegistryService } from '../../ae/services/ae-registry.service';
import { RoutingEngineService } from '../../routing/services/routing-engine.service';
import { MappingEngineService } from '../../mapping/services/mapping-engine.service';
import { EventTracerService } from '../../event/services/event-tracer.service';
import { HL7ParserService } from '../../hl7/services/hl7-parser.service';
import { HL7ToCanonicalTransformer } from '../../hl7/transformers/hl7-to-canonical.transformer';
import { FHIRValidatorService } from '../../fhir/services/fhir-validator.service';
import { FHIRToCanonicalTransformer } from '../../fhir/transformers/fhir-to-canonical.transformer';
export interface MessagePipelineContext {
    messageId: string;
    correlationId: string;
    traceId: string;
    spanId: string;
    protocol: string;
    sourceAE: string;
    targetAE?: string;
    timestamp: Date;
}
export declare class MessagePipelineService {
    private aeRegistry;
    private routingEngine;
    private mappingEngine;
    private eventTracer;
    private hl7Parser;
    private hl7ToCanonical;
    private fhirValidator;
    private fhirToCanonical;
    private readonly logger;
    constructor(aeRegistry: AERegistryService, routingEngine: RoutingEngineService, mappingEngine: MappingEngineService, eventTracer: EventTracerService, hl7Parser: HL7ParserService, hl7ToCanonical: HL7ToCanonicalTransformer, fhirValidator: FHIRValidatorService, fhirToCanonical: FHIRToCanonicalTransformer);
    /**
     * Process incoming message through the pipeline
     */
    processMessage(rawMessage: any, protocol: string, sourceAE: string): Promise<{
        success: boolean;
        messageId: string;
        result?: any;
        errors?: string[];
    }>;
    private parseMessage;
}
//# sourceMappingURL=message-pipeline.service.d.ts.map