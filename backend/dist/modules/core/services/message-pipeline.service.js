"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MessagePipelineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagePipelineService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const ae_registry_service_1 = require("../../ae/services/ae-registry.service");
const routing_engine_service_1 = require("../../routing/services/routing-engine.service");
const mapping_engine_service_1 = require("../../mapping/services/mapping-engine.service");
const event_tracer_service_1 = require("../../event/services/event-tracer.service");
const hl7_parser_service_1 = require("../../hl7/services/hl7-parser.service");
const hl7_to_canonical_transformer_1 = require("../../hl7/transformers/hl7-to-canonical.transformer");
const fhir_validator_service_1 = require("../../fhir/services/fhir-validator.service");
const fhir_to_canonical_transformer_1 = require("../../fhir/transformers/fhir-to-canonical.transformer");
const enums_1 = require("../../../common/enums");
let MessagePipelineService = MessagePipelineService_1 = class MessagePipelineService {
    constructor(aeRegistry, routingEngine, mappingEngine, eventTracer, hl7Parser, hl7ToCanonical, fhirValidator, fhirToCanonical) {
        this.aeRegistry = aeRegistry;
        this.routingEngine = routingEngine;
        this.mappingEngine = mappingEngine;
        this.eventTracer = eventTracer;
        this.hl7Parser = hl7Parser;
        this.hl7ToCanonical = hl7ToCanonical;
        this.fhirValidator = fhirValidator;
        this.fhirToCanonical = fhirToCanonical;
        this.logger = new common_1.Logger(MessagePipelineService_1.name);
    }
    /**
     * Process incoming message through the pipeline
     */
    async processMessage(rawMessage, protocol, sourceAE) {
        const messageId = (0, uuid_1.v4)();
        const correlationId = (0, uuid_1.v4)();
        const traceId = (0, uuid_1.v4)();
        const spanId = (0, uuid_1.v4)();
        const context = {
            messageId,
            correlationId,
            traceId,
            spanId,
            protocol,
            sourceAE,
            timestamp: new Date(),
        };
        try {
            this.logger.log(`Processing message ${messageId} via ${protocol}`);
            // Start trace
            this.eventTracer.startTrace(messageId, correlationId);
            // Step 1: Validate source AE
            const aeValid = await this.aeRegistry.validateAEAccess(sourceAE, protocol, 'inbound');
            if (!aeValid) {
                throw new Error(`Invalid or inactive AE: ${sourceAE}`);
            }
            // Step 2: Parse message
            let canonicalMessage = await this.parseMessage(rawMessage, protocol, context);
            // Step 3: Evaluate routing
            const routingTable = await this.routingEngine.getRoutingTable('default');
            if (!routingTable) {
                throw new Error('No routing table found');
            }
            const routeResult = await this.routingEngine.evaluateRoute(routingTable.id, {
                message: canonicalMessage,
                sourceAE,
            });
            if (!routeResult.matched) {
                throw new Error('No matching route found');
            }
            context.targetAE = routeResult.targetAE;
            // Step 4: Apply mapping if needed
            if (routeResult.mappingId) {
                const mapping = await this.mappingEngine.getMapping(routeResult.mappingId);
                if (mapping) {
                    const mappingResult = await this.mappingEngine.mapMessage(canonicalMessage, mapping);
                    if (!mappingResult.success) {
                        throw new Error(`Mapping failed: ${mappingResult.errors?.join(', ')}`);
                    }
                    canonicalMessage = mappingResult.targetMessage;
                }
            }
            // Step 5: Complete trace
            await this.eventTracer.completeTrace(messageId, enums_1.MessageStatus.SENT);
            return {
                success: true,
                messageId,
                result: {
                    canonicalMessage,
                    targetAE: context.targetAE,
                    routeId: routeResult.route?.id,
                },
            };
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Message processing failed: ${err.message}`, err.stack);
            await this.eventTracer.completeTrace(messageId, enums_1.MessageStatus.FAILED);
            return {
                success: false,
                messageId,
                errors: [err.message],
            };
        }
    }
    async parseMessage(rawMessage, protocol, context) {
        try {
            if (protocol === 'HL7_V2') {
                const hl7Msg = this.hl7Parser.parseMessage(typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage));
                const validation = this.hl7Parser.validate(hl7Msg);
                if (!validation.valid) {
                    throw new Error(`Invalid HL7: ${validation.errors.join(', ')}`);
                }
                const patient = this.hl7ToCanonical.transformPatient(hl7Msg);
                const order = this.hl7ToCanonical.transformOrder(hl7Msg, patient?.id);
                return {
                    patients: patient ? [patient] : [],
                    orders: order ? [order] : [],
                };
            }
            else if (protocol === 'FHIR_R4') {
                const resource = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
                const validation = this.fhirValidator.validateResource(resource);
                if (!validation.valid) {
                    throw new Error(`Invalid FHIR: ${validation.errors.join(', ')}`);
                }
                if (resource.resourceType === 'Patient') {
                    return {
                        patients: [this.fhirToCanonical.transformPatient(resource)],
                        orders: [],
                    };
                }
                else if (resource.resourceType === 'ServiceRequest') {
                    return {
                        patients: [],
                        orders: [this.fhirToCanonical.transformOrder(resource)],
                    };
                }
            }
            return { patients: [], orders: [] };
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Message parsing failed: ${err.message}`);
            throw err;
        }
    }
};
exports.MessagePipelineService = MessagePipelineService;
exports.MessagePipelineService = MessagePipelineService = MessagePipelineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ae_registry_service_1.AERegistryService,
        routing_engine_service_1.RoutingEngineService,
        mapping_engine_service_1.MappingEngineService,
        event_tracer_service_1.EventTracerService,
        hl7_parser_service_1.HL7ParserService,
        hl7_to_canonical_transformer_1.HL7ToCanonicalTransformer,
        fhir_validator_service_1.FHIRValidatorService,
        fhir_to_canonical_transformer_1.FHIRToCanonicalTransformer])
], MessagePipelineService);
//# sourceMappingURL=message-pipeline.service.js.map