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
var MessageFlowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageFlowService = void 0;
exports.normalizeCanonicalMessage = normalizeCanonicalMessage;
exports.normalizeOrderCategory = normalizeOrderCategory;
exports.detectInboundProtocol = detectInboundProtocol;
exports.inferMessageType = inferMessageType;
exports.extractTargetAE = extractTargetAE;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const enums_1 = require("../../../common/enums");
const ae_registry_service_1 = require("../../ae/services/ae-registry.service");
const mapping_engine_service_1 = require("../../mapping/services/mapping-engine.service");
const routing_engine_service_1 = require("../../routing/services/routing-engine.service");
const services_1 = require("../../hl7/services");
const transformers_1 = require("../../hl7/transformers");
const fhir_bridge_service_1 = require("../../fhir/services/fhir-bridge.service");
const transformers_2 = require("../../fhir/transformers");
const fhir_validator_service_1 = require("../../fhir/services/fhir-validator.service");
const event_tracer_service_1 = require("./event-tracer.service");
const path_util_1 = require("../../../common/utils/path.util");
const message_flow_transport_1 = require("./message-flow.transport");
const services_2 = require("../../validation/services");
let MessageFlowService = MessageFlowService_1 = class MessageFlowService {
    constructor(aeRegistry, mappingEngine, routingEngine, hl7Bridge, fhirBridge, hl7Parser, hl7StandardValidator, hl7ToCanonical, canonicalToHl7, fhirValidator, fhirToCanonical, canonicalToFhir, eventTracer, contextEnrichmentService) {
        this.aeRegistry = aeRegistry;
        this.mappingEngine = mappingEngine;
        this.routingEngine = routingEngine;
        this.hl7Bridge = hl7Bridge;
        this.fhirBridge = fhirBridge;
        this.hl7Parser = hl7Parser;
        this.hl7StandardValidator = hl7StandardValidator;
        this.hl7ToCanonical = hl7ToCanonical;
        this.canonicalToHl7 = canonicalToHl7;
        this.fhirValidator = fhirValidator;
        this.fhirToCanonical = fhirToCanonical;
        this.canonicalToFhir = canonicalToFhir;
        this.eventTracer = eventTracer;
        this.contextEnrichmentService = contextEnrichmentService;
        this.logger = new common_1.Logger(MessageFlowService_1.name);
    }
    async processHealthstackOrderModel(orderModel) {
        return this.processMessage({
            sourceAE: 'healthstack',
            targetAE: typeof orderModel.targetAE === 'string'
                ? orderModel.targetAE
                : undefined,
            messageType: enums_1.MessageType.ORDER,
            protocol: enums_1.ProtocolType.CUSTOM_JSON,
            payload: orderModel,
        });
    }
    async processHealthstackOrder(hl7Message) {
        return this.processMessage({
            sourceAE: 'healthstack',
            messageType: enums_1.MessageType.ORDER,
            protocol: enums_1.ProtocolType.HL7_V2,
            payload: hl7Message,
        });
    }
    async processHealthstackOrderFhir(resource) {
        return this.processMessage({
            sourceAE: 'healthstack',
            messageType: enums_1.MessageType.ORDER,
            protocol: enums_1.ProtocolType.FHIR_R4,
            payload: resource,
        });
    }
    async processHealthstackPatient(payload) {
        return this.processMessage({
            sourceAE: 'healthstack',
            messageType: enums_1.MessageType.PATIENT,
            protocol: typeof payload === 'string'
                ? enums_1.ProtocolType.HL7_V2
                : enums_1.ProtocolType.FHIR_R4,
            payload,
        });
    }
    async processMessage(request) {
        const sourceProtocol = request.protocol || detectInboundProtocol(request.payload);
        const messageType = request.messageType || inferMessageType(request.payload, sourceProtocol);
        const context = {
            messageId: (0, crypto_1.randomUUID)(),
            correlationId: (0, crypto_1.randomUUID)(),
            traceId: (0, crypto_1.randomUUID)(),
            sourceAE: request.sourceAE,
            targetAE: request.targetAE,
            sourceProtocol,
            messageType,
            timestamp: new Date(),
            sequence: 1,
        };
        this.eventTracer.startTrace(context.messageId, context.correlationId);
        try {
            const sourceAE = await this.resolveAE(request.sourceAE);
            this.assertAEAccess(sourceAE, sourceProtocol, 'inbound');
            await this.recordEvent(context, enums_1.EventType.MESSAGE_RECEIVED, enums_1.MessageStatus.RECEIVED, {
                sourceAE: sourceAE.id,
                sourceProtocol,
                payload: request.payload,
            });
            const inboundBinding = this.resolveMappingBinding(sourceAE, 'inbound', sourceProtocol, messageType);
            const canonicalMessage = await this.toCanonical(request.payload, messageType, sourceProtocol, inboundBinding);
            canonicalMessage.metadata = {
                ...(canonicalMessage.metadata || {}),
                sourceAE: sourceAE.id,
            };
            await this.recordEvent(context, enums_1.EventType.MESSAGE_MAPPED, enums_1.MessageStatus.MAPPING, {
                direction: 'inbound',
                mapping: describeBinding(inboundBinding, sourceProtocol),
                canonicalMessage,
            });
            const routingTable = await this.resolveRoutingTable();
            const requestedTargetAE = context.targetAE ?? extractTargetAE(canonicalMessage, request.payload);
            const routeResult = await this.routingEngine.evaluateRoute(routingTable.id, {
                message: canonicalMessage,
                sourceAE: sourceAE.id,
                targetAE: requestedTargetAE,
                metadata: {
                    messageType,
                    sourceProtocol,
                    targetAE: requestedTargetAE,
                },
            });
            if (!routeResult.matched || !routeResult.route) {
                throw new common_1.NotFoundException(`No route matched for source '${sourceAE.id}', provided target '${context.targetAE}' and message type ${messageType}`);
            }
            context.targetAE = routeResult.targetAE;
            canonicalMessage.metadata.targetAE = routeResult.targetAE;
            canonicalMessage.metadata.routeApplicationId = routeResult.applicationId;
            canonicalMessage.metadata.routeApplicationName = routeResult.applicationName;
            await this.recordEvent(context, enums_1.EventType.ROUTE_EVALUATED, enums_1.MessageStatus.ROUTING, {
                routingTableId: routingTable.id,
                routeId: routeResult.route.id,
                routeName: routeResult.route.name,
                targetAE: routeResult.targetAE,
                applicationId: routeResult.applicationId,
                applicationName: routeResult.applicationName,
            });
            const targetAE = await this.resolveAE(routeResult.targetAE);
            const targetProtocol = routeResult.route.protocol ||
                this.resolvePreferredProtocol(targetAE, messageType, 'outbound');
            this.assertAEAccess(targetAE, targetProtocol, 'outbound');
            const enrichmentResult = await this.contextEnrichmentService.resolve({
                route: routeResult.route,
                sourceMessage: request.payload,
                canonicalMessage,
                sourceAE,
                targetAE,
                sourceProtocol,
                targetProtocol,
                messageType,
            });
            await this.recordEvent(context, enums_1.EventType.MESSAGE_MAPPED, enums_1.MessageStatus.MAPPING, {
                direction: 'outbound-enrichment',
                routeId: routeResult.route.id,
                context: enrichmentResult.context,
                warnings: enrichmentResult.warnings,
            });
            const outboundBinding = this.resolveMappingBinding(targetAE, 'outbound', targetProtocol, messageType, routeResult.mappingId);
            const outboundMessage = await this.fromCanonical(canonicalMessage, messageType, targetProtocol, outboundBinding, routeResult.route, targetAE, enrichmentResult.context);
            await this.recordEvent(context, enums_1.EventType.TRANSFORMATION_APPLIED, enums_1.MessageStatus.MAPPING, {
                direction: 'outbound',
                targetAE: targetAE.id,
                targetProtocol,
                mapping: describeBinding(outboundBinding, targetProtocol),
                enrichmentContext: enrichmentResult.context,
                enrichmentWarnings: enrichmentResult.warnings,
                outboundPreview: outboundMessage,
            });
            await this.dispatchMessage(targetAE, targetProtocol, outboundMessage, messageType);
            await this.recordEvent(context, enums_1.EventType.MESSAGE_SENT, enums_1.MessageStatus.SENT, {
                targetAE: targetAE.id,
                targetProtocol,
                outboundMessage,
            });
            await this.eventTracer.completeTrace(context.messageId, enums_1.MessageStatus.SENT);
            return {
                success: true,
                messageId: context.messageId,
                sourceAE: sourceAE.id,
                targetAE: targetAE.id,
                messageType,
                sourceProtocol,
                targetProtocol,
                routeId: routeResult.route.id,
                canonicalMessage,
                outboundMessage,
                enrichmentContext: enrichmentResult.context,
                enrichmentWarnings: enrichmentResult.warnings,
                message: 'Success'
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Message flow failed: ${message}`);
            await this.recordEvent(context, enums_1.EventType.ERROR_OCCURRED, enums_1.MessageStatus.FAILED, {
                error: message,
            }, message);
            await this.eventTracer.completeTrace(context.messageId, enums_1.MessageStatus.FAILED);
            throw error;
        }
    }
    async listRecentTraces(limit) {
        return this.eventTracer.listRecentTraces(limit);
    }
    async getAuditForMessage(messageId) {
        return this.eventTracer.getAuditTrail(messageId);
    }
    async resolveAE(identifier) {
        const byId = await this.aeRegistry.getAE(identifier);
        if (byId) {
            return byId;
        }
        const all = await this.aeRegistry.listAEs({ page: 1, limit: 100, filters: [] });
        const matched = all.data.find((ae) => ae.id.toLowerCase() === identifier.toLowerCase() ||
            ae.name.toLowerCase() === identifier.toLowerCase());
        if (!matched) {
            throw new Error(`Application entity not found: ${identifier}`);
        }
        return matched;
    }
    assertAEAccess(ae, protocol, direction) {
        if (ae.status !== enums_1.AEStatus.ACTIVE) {
            throw new Error(`AE is not active: ${ae.id}`);
        }
        const capabilities = direction === 'inbound' ? ae.inboundCapabilities : ae.outboundCapabilities;
        if (!capabilities.includes(protocol)) {
            throw new Error(`AE ${ae.id} does not support ${direction} protocol ${protocol}`);
        }
    }
    resolveMappingBinding(ae, direction, protocol, messageType, overrideMappingId) {
        if (overrideMappingId) {
            return {
                messageType,
                protocol,
                mappingId: overrideMappingId,
            };
        }
        const bindings = ae.mappings?.[direction];
        if (Array.isArray(bindings)) {
            const exactMatch = bindings.find((binding) => binding.messageType === messageType && binding.protocol === protocol);
            if (exactMatch) {
                return exactMatch;
            }
        }
        const legacyMappingId = direction === 'inbound'
            ? ae.mappings?.inboundMappingId
            : ae.mappings?.outboundMappingId;
        if (legacyMappingId) {
            return {
                messageType,
                protocol,
                mappingId: legacyMappingId,
            };
        }
        return null;
    }
    async toCanonical(payload, messageType, protocol, binding) {
        if (protocol === enums_1.ProtocolType.CUSTOM_JSON) {
            const mapping = await this.requireMapping(binding, protocol, messageType, 'inbound');
            const result = await this.mappingEngine.mapMessage(payload, mapping, {
                sourceMessage: payload,
                variables: {
                    now: new Date().toISOString(),
                },
            });
            if (!result.success || !result.targetMessage) {
                throw new Error(result.errors?.join(', ') || 'Custom inbound mapping failed');
            }
            return normalizeCanonicalMessage(result.targetMessage, payload, protocol, messageType);
        }
        if (protocol === enums_1.ProtocolType.HL7_V2) {
            const rawMessage = typeof payload === 'string' ? payload : String(payload);
            const validation = this.hl7StandardValidator.validateRawMessage(rawMessage);
            if (!validation.valid) {
                throw new Error(`Invalid HL7 message: ${validation.errors.join(', ')}`);
            }
            const parsed = this.hl7Parser.parseMessage(rawMessage);
            const patient = this.hl7ToCanonical.transformPatient(parsed);
            if (messageType === enums_1.MessageType.PATIENT) {
                return normalizeCanonicalMessage({
                    messageType,
                    patient: patient
                        ? canonicalPatientToFlowPatient(patient)
                        : undefined,
                    metadata: {},
                }, payload, protocol, messageType);
            }
            const order = this.hl7ToCanonical.transformOrder(parsed, patient?.id);
            return normalizeCanonicalMessage({
                messageType,
                order: order ? canonicalOrderToFlowOrder(order) : undefined,
                patient: patient ? canonicalPatientToFlowPatient(patient) : undefined,
                metadata: {},
            }, payload, protocol, messageType);
        }
        if (protocol === enums_1.ProtocolType.FHIR_R4) {
            const resource = typeof payload === 'string' ? JSON.parse(payload) : payload;
            const validation = this.fhirValidator.validateResource(resource);
            if (!validation.valid) {
                throw new Error(`Invalid FHIR resource: ${validation.errors.join(', ')}`);
            }
            if (messageType === enums_1.MessageType.PATIENT || resource.resourceType === 'Patient') {
                const patient = this.fhirToCanonical.transformPatient(resource);
                return normalizeCanonicalMessage({
                    messageType: enums_1.MessageType.PATIENT,
                    patient: canonicalPatientToFlowPatient(patient),
                    metadata: {},
                }, payload, protocol, enums_1.MessageType.PATIENT);
            }
            const order = this.fhirToCanonical.transformOrder(resource);
            const subjectId = resource.subject?.reference?.split('/')?.[1] || order.subject?.reference?.split('/')?.[1];
            return normalizeCanonicalMessage({
                messageType: enums_1.MessageType.ORDER,
                order: canonicalOrderToFlowOrder(order),
                patient: subjectId ? { id: subjectId } : undefined,
                metadata: {},
            }, payload, protocol, enums_1.MessageType.ORDER);
        }
        throw new Error(`Unsupported inbound protocol: ${protocol}`);
    }
    async fromCanonical(canonicalMessage, messageType, protocol, binding, route, targetAE, enrichmentContext) {
        if (protocol === enums_1.ProtocolType.CUSTOM_JSON) {
            const mapping = await this.requireMapping(binding, protocol, messageType, 'outbound');
            const result = await this.mappingEngine.mapMessage(canonicalMessage, mapping, {
                sourceMessage: canonicalMessage,
                context: enrichmentContext,
                variables: {
                    now: new Date().toISOString(),
                },
            });
            if (!result.success || result.targetMessage === undefined) {
                throw new Error(result.errors?.join(', ') || 'Custom outbound mapping failed');
            }
            return result.targetMessage;
        }
        if (protocol === enums_1.ProtocolType.HL7_V2) {
            const switchAE = await this.resolveSwitchAE();
            if (messageType === enums_1.MessageType.PATIENT) {
                const patientMessage = normalizeCanonicalPatient(canonicalMessage);
                const outbound = buildHl7Message([
                    buildHl7MshSegment(messageType, switchAE, targetAE, route),
                    this.canonicalToHl7.transformPatient(patientMessage, enrichmentContext),
                ]);
                this.assertOutboundHl7(outbound);
                return outbound;
            }
            const orderMessage = normalizeCanonicalOrder(canonicalMessage);
            const patientMessage = normalizeCanonicalPatient(canonicalMessage);
            const orderSegments = this.canonicalToHl7.transformOrder(orderMessage, enrichmentContext);
            const outbound = buildHl7Message([
                buildHl7MshSegment(messageType, switchAE, targetAE, route),
                this.canonicalToHl7.transformPatient(patientMessage, enrichmentContext),
                ...orderSegments,
            ]);
            this.assertOutboundHl7(outbound);
            return outbound;
        }
        if (protocol === enums_1.ProtocolType.FHIR_R4) {
            if (messageType === enums_1.MessageType.PATIENT) {
                return this.canonicalToFhir.transformPatient(normalizeCanonicalPatient(canonicalMessage), enrichmentContext);
            }
            return this.canonicalToFhir.transformOrder(normalizeCanonicalOrder(canonicalMessage), enrichmentContext);
        }
        throw new Error(`Unsupported outbound protocol: ${protocol}`);
    }
    async dispatchMessage(targetAE, protocol, outboundMessage, messageType) {
        const config = this.resolveProtocolConfig(targetAE, protocol, 'outbound');
        if (protocol === enums_1.ProtocolType.HL7_V2) {
            await this.hl7Bridge.sendMessage(config.host, config.port, String(outboundMessage));
            return;
        }
        if (protocol === enums_1.ProtocolType.FHIR_R4) {
            await this.fhirBridge.sendResource(buildHttpBaseUrl(config), outboundMessage);
            return;
        }
        if (protocol === enums_1.ProtocolType.CUSTOM_JSON) {
            await (0, message_flow_transport_1.postJson)(buildHttpBaseUrl(config), outboundMessage);
            return;
        }
        throw new Error(`Unsupported outbound protocol ${protocol} for message type ${messageType}`);
    }
    resolveProtocolConfig(ae, protocol, direction) {
        const configs = direction === 'inbound' ? ae.inboundConfig : ae.outboundConfig;
        const matched = configs.find((config) => config.protocol === protocol);
        if (!matched) {
            throw new Error(`No ${direction} config found for AE ${ae.id} and protocol ${protocol}`);
        }
        return matched;
    }
    resolvePreferredProtocol(ae, messageType, direction) {
        const bindings = ae.mappings?.[direction];
        if (Array.isArray(bindings)) {
            const matched = bindings.find((binding) => binding.messageType === messageType);
            if (matched) {
                return matched.protocol;
            }
        }
        const configs = direction === 'inbound' ? ae.inboundConfig : ae.outboundConfig;
        if (configs[0]?.protocol) {
            return configs[0].protocol;
        }
        throw new Error(`Unable to resolve ${direction} protocol for AE ${ae.id}`);
    }
    async resolveRoutingTable() {
        const byId = await this.routingEngine.getRoutingTable('default-routing');
        if (byId) {
            return byId;
        }
        const byName = await this.routingEngine.getRoutingTableByName('Default Routing');
        if (byName) {
            return byName;
        }
        throw new Error('Default routing table was not found');
    }
    async resolveSwitchAE() {
        const configuredId = process.env.SWITCH_AE_ID || 'switch';
        return this.resolveAE(configuredId);
    }
    async requireMapping(binding, protocol, messageType, direction) {
        if (!binding?.mappingId) {
            throw new Error(`A ${direction} mapping is required for protocol ${protocol} and message type ${messageType}`);
        }
        const mapping = await this.mappingEngine.getMapping(binding.mappingId);
        if (!mapping) {
            throw new Error(`Mapping not found: ${binding.mappingId}`);
        }
        return mapping;
    }
    async recordEvent(context, eventType, status, snapshot, errorMessage) {
        await this.eventTracer.recordEvent({
            id: (0, crypto_1.randomUUID)(),
            eventType,
            messageId: context.messageId,
            timestamp: new Date(),
            sequenceNumber: context.sequence++,
            sourceAE: context.sourceAE,
            targetAE: context.targetAE,
            status,
            metadata: this.eventTracer.createEventMetadata(context.correlationId, context.traceId, `${context.messageId}-${context.sequence}`, {
                messageType: context.messageType,
                sourceProtocol: context.sourceProtocol,
            }),
            snapshot,
            errorMessage,
            correlationId: context.correlationId,
            createdAt: new Date(),
        });
    }
    assertOutboundHl7(message) {
        const validation = this.hl7StandardValidator.validateRawMessage(message);
        if (!validation.valid) {
            throw new Error(`Invalid outbound HL7 message: ${validation.errors.join(', ')}`);
        }
    }
};
exports.MessageFlowService = MessageFlowService;
exports.MessageFlowService = MessageFlowService = MessageFlowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ae_registry_service_1.AERegistryService,
        mapping_engine_service_1.MappingEngineService,
        routing_engine_service_1.RoutingEngineService,
        services_1.HL7BridgeService,
        fhir_bridge_service_1.FHIRBridgeService,
        services_1.HL7ParserService,
        services_1.HL7StandardValidatorService,
        transformers_1.HL7ToCanonicalTransformer,
        transformers_1.CanonicalToHL7Transformer,
        fhir_validator_service_1.FHIRValidatorService,
        transformers_2.FHIRToCanonicalTransformer,
        transformers_2.CanonicalToFHIRTransformer,
        event_tracer_service_1.EventTracerService,
        services_2.ContextEnrichmentService])
], MessageFlowService);
function normalizeCanonicalMessage(message, sourcePayload, protocol, messageType) {
    const normalized = {
        messageType,
        order: message.order,
        patient: message.patient,
        metadata: {
            ...(message.metadata || {}),
        },
    };
    normalized.metadata.sourceProtocol = protocol;
    normalized.metadata.targetAE =
        normalized.metadata.targetAE || extractTargetAE(message, sourcePayload);
    if (!normalized.patient?.id && normalized.order?.subject?.id) {
        normalized.patient = {
            ...(normalized.patient || {}),
            id: normalized.order.subject.id,
        };
    }
    if (!normalized.order?.subject?.id && normalized.patient?.id) {
        normalized.order = {
            ...(normalized.order || {}),
            subject: {
                id: normalized.patient.id,
            },
        };
    }
    const rawCategory = normalized.metadata.orderCategory ||
        extractStructuredCategory(normalized.order?.category?.[0]) ||
        normalized.order?.code?.display ||
        normalized.order?.code?.code ||
        normalized.order?.category?.[0] ||
        (0, path_util_1.getValueByPath)(sourcePayload, 'order_category') ||
        (0, path_util_1.getValueByPath)(sourcePayload, 'category[0].text') ||
        (0, path_util_1.getValueByPath)(sourcePayload, 'code.text') ||
        (0, path_util_1.getValueByPath)(sourcePayload, 'order') ||
        (0, path_util_1.getValueByPath)(sourcePayload, 'order.code.display');
    const normalizedCategory = normalizeOrderCategory(rawCategory);
    if (normalizedCategory) {
        normalized.metadata.orderCategory = normalizedCategory;
        normalized.order = {
            ...(normalized.order || {}),
            category: normalized.order?.category?.length
                ? normalized.order.category
                : [normalizedCategory.toLowerCase()],
        };
    }
    return normalized;
}
function normalizeOrderCategory(value) {
    if (!value) {
        return undefined;
    }
    const normalized = String(value).trim().toUpperCase();
    if (!normalized) {
        return undefined;
    }
    if (normalized.includes('RADIOLOGY') ||
        normalized.includes('IMAGING') ||
        normalized.includes('XRAY') ||
        normalized.includes('X-RAY') ||
        normalized.includes('MRI') ||
        normalized.includes('CT')) {
        return 'RADIOLOGY';
    }
    if (normalized.includes('LAB') ||
        normalized.includes('LABORATORY') ||
        normalized.includes('CBC') ||
        normalized.includes('CHEM')) {
        return 'LABORATORY';
    }
    return normalized;
}
function detectInboundProtocol(payload) {
    if (typeof payload === 'string' && payload.trim().startsWith('MSH')) {
        return enums_1.ProtocolType.HL7_V2;
    }
    if (payload && typeof payload === 'object' && payload.resourceType) {
        return enums_1.ProtocolType.FHIR_R4;
    }
    return enums_1.ProtocolType.CUSTOM_JSON;
}
function inferMessageType(payload, protocol) {
    if (protocol === enums_1.ProtocolType.HL7_V2 && typeof payload === 'string') {
        const mshLine = payload.split(/\r?\n/)[0] || '';
        const messageType = mshLine.split('|')[8] || '';
        return messageType.startsWith('ADT')
            ? enums_1.MessageType.PATIENT
            : enums_1.MessageType.ORDER;
    }
    if (protocol === enums_1.ProtocolType.FHIR_R4 && payload?.resourceType === 'Patient') {
        return enums_1.MessageType.PATIENT;
    }
    return enums_1.MessageType.ORDER;
}
function describeBinding(binding, protocol) {
    return {
        protocol,
        mappingId: binding?.mappingId || null,
        strategy: binding?.mappingId ? 'mapping-engine' : 'built-in',
    };
}
function extractStructuredCategory(value) {
    if (!value || typeof value !== 'object') {
        return undefined;
    }
    const candidate = value;
    return (candidate.text ||
        candidate.coding?.[0]?.display ||
        candidate.coding?.[0]?.code);
}
function buildHl7Message(segments) {
    return segments.filter(Boolean).join('\r');
}
function buildHl7MshSegment(messageType, switchAE, targetAE, route) {
    const timestamp = formatHl7Timestamp(new Date());
    const triggerEvent = messageType === enums_1.MessageType.PATIENT ? 'ADT^A04' : 'ORM^O01';
    const sendingApplication = formatHdField({
        namespaceId: process.env.SWITCH_APPLICATION_NAMESPACE_ID ||
            process.env.SWITCH_APPLICATION_NAME ||
            switchAE.name,
        id: process.env.SWITCH_APPLICATION_UUID ||
            switchAE.customId ||
            switchAE.id,
        idType: process.env.SWITCH_APPLICATION_ID_TYPE ||
            'UUID',
    });
    const sendingFacility = formatHdField(resolveFacilityIdentifier(switchAE));
    const receivingApplication = formatHdField({
        namespaceId: route.applicationIdentifier?.namespaceId || route.applicationName,
        id: route.applicationIdentifier?.id || route.applicationId,
        idType: route.applicationIdentifier?.idType || 'UUID',
    });
    const receivingFacility = formatHdField(resolveFacilityIdentifier(targetAE));
    return `MSH|^~\\&|${sendingApplication}|${sendingFacility}|${receivingApplication}|${receivingFacility}|${timestamp}||${triggerEvent}|${(0, crypto_1.randomUUID)()}|P|2.5`;
}
function buildHttpBaseUrl(config) {
    const base = `http://${config.host}:${config.port}`;
    return config.basePath ? `${base}${config.basePath}` : base;
}
function canonicalOrderToFlowOrder(order) {
    return {
        id: order.id,
        identifier: order.identifier,
        code: {
            code: order.code?.coding?.[0]?.code,
            display: order.code?.text || order.code?.coding?.[0]?.display,
        },
        authoredOn: order.authoredOn?.toISOString(),
        requester: {
            id: order.requester?.reference?.split('/')?.[1] ||
                order.requester?.identifier?.value ||
                order.requester?.display,
        },
        subject: {
            id: order.subject?.reference?.split('/')?.[1] ||
                order.subject?.identifier?.value ||
                order.subject?.display,
        },
        status: order.status,
        priority: order.priority,
        category: order.category,
    };
}
function canonicalPatientToFlowPatient(patient) {
    return {
        id: patient.id,
        identifier: patient.identifiers,
        name: {
            family: patient.name?.[0]?.family || patient.name?.[0]?.text,
            given: patient.name?.[0]?.given,
            text: patient.name?.[0]?.text,
        },
        birthDate: patient.birthDate,
        gender: patient.gender,
    };
}
function normalizeCanonicalOrder(message) {
    const patientId = message.patient?.id || message.order?.subject?.id || 'unknown';
    const authoredOn = message.order?.authoredOn
        ? new Date(message.order.authoredOn)
        : new Date();
    return {
        id: message.order?.id || (0, crypto_1.randomUUID)(),
        resourceType: 'ServiceRequest',
        identifier: message.order?.identifier?.length
            ? message.order.identifier
            : [
                {
                    system: 'urn:rxsoft:switch:order',
                    value: message.order?.id || (0, crypto_1.randomUUID)(),
                },
            ],
        status: normalizeOrderStatus(message.order?.status),
        priority: normalizePriority(message.order?.priority),
        intent: 'order',
        category: message.order?.category || [],
        code: {
            text: message.order?.code?.display ||
                message.order?.code?.code ||
                message.metadata.orderCategory ||
                'Unknown',
            coding: message.order?.code?.code
                ? [
                    {
                        system: 'urn:rxsoft:switch:order-code',
                        code: message.order.code.code,
                        display: message.order.code.display,
                    },
                ]
                : undefined,
        },
        subject: {
            reference: `Patient/${patientId}`,
        },
        authoredOn,
        requester: message.order?.requester?.id
            ? {
                reference: `Practitioner/${message.order.requester.id}`,
            }
            : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}
function normalizeCanonicalPatient(message) {
    return {
        id: message.patient?.id || message.order?.subject?.id || 'unknown',
        resourceType: 'Patient',
        identifiers: message.patient?.identifier?.length
            ? message.patient.identifier
            : [
                {
                    system: 'urn:rxsoft:switch:patient',
                    value: message.patient?.id || message.order?.subject?.id || 'unknown',
                },
            ],
        active: true,
        name: [
            {
                family: message.patient?.name?.family || 'Unknown',
                given: message.patient?.name?.given?.length
                    ? message.patient.name.given
                    : ['Patient'],
                text: message.patient?.name?.text ||
                    [...(message.patient?.name?.given || []), message.patient?.name?.family]
                        .filter(Boolean)
                        .join(' '),
            },
        ],
        gender: normalizePatientGender(message.patient?.gender),
        birthDate: message.patient?.birthDate,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}
function normalizeOrderStatus(status) {
    const normalized = String(status || 'active').toLowerCase();
    if (normalized === 'draft' ||
        normalized === 'active' ||
        normalized === 'on-hold' ||
        normalized === 'revoked' ||
        normalized === 'completed' ||
        normalized === 'entered-in-error' ||
        normalized === 'unknown') {
        return normalized;
    }
    return 'active';
}
function normalizePriority(priority) {
    const normalized = String(priority || 'NORMAL').toUpperCase();
    if (normalized === enums_1.Priority.LOW ||
        normalized === enums_1.Priority.NORMAL ||
        normalized === enums_1.Priority.HIGH ||
        normalized === enums_1.Priority.URGENT) {
        return normalized;
    }
    if (normalized === 'ROUTINE') {
        return enums_1.Priority.NORMAL;
    }
    if (normalized === 'STAT' || normalized === 'ASAP') {
        return enums_1.Priority.URGENT;
    }
    return enums_1.Priority.NORMAL;
}
function normalizePatientGender(gender) {
    const normalized = String(gender || 'unknown').toLowerCase();
    if (normalized === 'male' ||
        normalized === 'female' ||
        normalized === 'other' ||
        normalized === 'unknown') {
        return normalized;
    }
    if (normalized === 'm') {
        return 'male';
    }
    if (normalized === 'f') {
        return 'female';
    }
    return 'unknown';
}
function extractTargetAE(message, sourcePayload) {
    const hl7Target = extractTargetAEFromHl7(sourcePayload);
    const candidates = [
        message?.metadata?.targetAE,
        hl7Target,
        (0, path_util_1.getValueByPath)(sourcePayload, 'targetAE'),
        (0, path_util_1.getValueByPath)(sourcePayload, 'targetAe'),
        (0, path_util_1.getValueByPath)(sourcePayload, 'destination_ae'),
        (0, path_util_1.getValueByPath)(sourcePayload, 'destinationAE'),
        (0, path_util_1.getValueByPath)(sourcePayload, 'metadata.targetAE'),
        (0, path_util_1.getValueByPath)(sourcePayload, 'resource.targetAE'),
    ];
    const resolved = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0);
    return typeof resolved === 'string' ? resolved.trim() : undefined;
}
function extractTargetAEFromHl7(sourcePayload) {
    if (typeof sourcePayload !== 'string') {
        return undefined;
    }
    const zrtLine = sourcePayload
        .split(/\r\n|\n|\r/)
        .find((line) => line.startsWith('ZRT|'));
    if (!zrtLine) {
        return undefined;
    }
    return zrtLine.split('|')[1] || undefined;
}
function formatHl7Timestamp(value) {
    return value.toISOString().replace(/\.\d{3}Z$/, '').replace(/[-:]/g, '').replace('T', '');
}
function formatHdField(input) {
    return [
        input?.namespaceId || '',
        input?.id || '',
        input?.idType || '',
    ].join('^');
}
function resolveFacilityIdentifier(ae) {
    return {
        namespaceId: ae.facilityIdentifier?.namespaceId ||
            ae.facility?.identifier?.namespaceId ||
            ae.facilityName ||
            ae.facility?.facilityName ||
            ae.name,
        id: ae.facilityIdentifier?.id ||
            ae.facility?.identifier?.id ||
            ae.facilityId ||
            ae.facility?.facilityId ||
            ae.id,
        idType: ae.facilityIdentifier?.idType ||
            ae.facility?.identifier?.idType ||
            'UUID',
    };
}
//# sourceMappingURL=message-flow.service.js.map