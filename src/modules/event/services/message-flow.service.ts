import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  AEStatus,
  EventType,
  MessageStatus,
  MessageType,
  Priority,
  ProtocolType,
} from '../../../common/enums';
import {
  ApplicationEntityContract,
  AEMappingBinding,
  CanonicalOrder,
  CanonicalPatient,
  ProtocolConfig,
  RoutingRule,
  StandardMapping,
} from '../../../common/models';
import { AERegistryService } from '../../ae/services/ae-registry.service';
import { MappingEngineService } from '../../mapping/services/mapping-engine.service';
import { RoutingEngineService } from '../../routing/services/routing-engine.service';
import {
  HL7BridgeService,
  HL7ParserService,
  HL7StandardValidatorService,
} from '../../hl7/services';
import {
  CanonicalToHL7Transformer,
  HL7ToCanonicalTransformer,
} from '../../hl7/transformers';
import { FHIRBridgeService } from '../../fhir/services/fhir-bridge.service';
import {
  CanonicalToFHIRTransformer,
  FHIRToCanonicalTransformer,
} from '../../fhir/transformers';
import { FHIRValidatorService } from '../../fhir/services/fhir-validator.service';
import { EventTracerService } from './event-tracer.service';
import { getValueByPath } from '../../../common/utils/path.util';
import { postJson } from './message-flow.transport';
import { ValidationRuleService } from '../../validation/services';

export interface CanonicalFlowMessage {
  messageType: MessageType;
  order?: {
    id?: string;
    identifier?: Array<{ system: string; value: string }>;
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
    identifier?: Array<{ system: string; value: string }>;
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
  message: string;
}

interface MessageContext {
  messageId: string;
  correlationId: string;
  traceId: string;
  sourceAE: string;
  sourceProtocol: ProtocolType;
  messageType: MessageType;
  timestamp: Date;
  sequence: number;
  targetAE?: string;
}

@Injectable()
export class MessageFlowService {
  private readonly logger = new Logger(MessageFlowService.name);

  constructor(
    private readonly aeRegistry: AERegistryService,
    private readonly mappingEngine: MappingEngineService,
    private readonly routingEngine: RoutingEngineService,
    private readonly hl7Bridge: HL7BridgeService,
    private readonly fhirBridge: FHIRBridgeService,
    private readonly hl7Parser: HL7ParserService,
    private readonly hl7StandardValidator: HL7StandardValidatorService,
    private readonly hl7ToCanonical: HL7ToCanonicalTransformer,
    private readonly canonicalToHl7: CanonicalToHL7Transformer,
    private readonly fhirValidator: FHIRValidatorService,
    private readonly fhirToCanonical: FHIRToCanonicalTransformer,
    private readonly canonicalToFhir: CanonicalToFHIRTransformer,
    private readonly eventTracer: EventTracerService,
    private readonly validationRuleService: ValidationRuleService,
  ) {}

  async processHealthstackOrderModel(orderModel: Record<string, any>) {
    return this.processMessage({
      sourceAE: 'healthstack',
      targetAE: 'dcm4chee',
      messageType: MessageType.ORDER,
      protocol: ProtocolType.CUSTOM_JSON,
      payload: orderModel,
    });
  }

  async processHealthstackOrder(hl7Message: string) {
    return this.processMessage({
      sourceAE: 'healthstack',
      messageType: MessageType.ORDER,
      protocol: ProtocolType.HL7_V2,
      payload: hl7Message,
    });
  }

  async processHealthstackOrderFhir(resource: Record<string, any>) {
    return this.processMessage({
      sourceAE: 'healthstack',
      messageType: MessageType.ORDER,
      protocol: ProtocolType.FHIR_R4,
      payload: resource,
    });
  }

  async processHealthstackPatient(payload: string | Record<string, any>) {
    return this.processMessage({
      sourceAE: 'healthstack',
      messageType: MessageType.PATIENT,
      protocol:
        typeof payload === 'string'
          ? ProtocolType.HL7_V2
          : ProtocolType.FHIR_R4,
      payload,
    });
  }

  async processMessage(request: ProcessMessageRequest): Promise<ProcessMessageResult> {
    const sourceProtocol =
      request.protocol || detectInboundProtocol(request.payload);
    const messageType =
      request.messageType || inferMessageType(request.payload, sourceProtocol);

    const context: MessageContext = {
      messageId: randomUUID(),
      correlationId: randomUUID(),
      traceId: randomUUID(),
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

      await this.recordEvent(context, EventType.MESSAGE_RECEIVED, MessageStatus.RECEIVED, {
        sourceAE: sourceAE.id,
        sourceProtocol,
        payload: request.payload,
      });

      const inboundBinding = this.resolveMappingBinding(
        sourceAE,
        'inbound',
        sourceProtocol,
        messageType,
      );

      const canonicalMessage = await this.toCanonical(
        request.payload,
        messageType,
        sourceProtocol,
        inboundBinding,
      );
      canonicalMessage.metadata = {
        ...(canonicalMessage.metadata || {}),
        sourceAE: sourceAE.id,
      };

      await this.recordEvent(context, EventType.MESSAGE_MAPPED, MessageStatus.MAPPING, {
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
        throw new NotFoundException(
          `No route matched for source '${sourceAE.id}', provided target '${context.targetAE}' and message type ${messageType}`,
        );
      }

      context.targetAE = routeResult.targetAE;
      canonicalMessage.metadata.targetAE = routeResult.targetAE;
      canonicalMessage.metadata.routeApplicationId = routeResult.applicationId;
      canonicalMessage.metadata.routeApplicationName = routeResult.applicationName;

      await this.recordEvent(context, EventType.ROUTE_EVALUATED, MessageStatus.ROUTING, {
        routingTableId: routingTable.id,
        routeId: routeResult.route.id,
        routeName: routeResult.route.name,
        targetAE: routeResult.targetAE,
        applicationId: routeResult.applicationId,
        applicationName: routeResult.applicationName,
      });

      const targetAE = await this.resolveAE(routeResult.targetAE);
      const targetProtocol =
        routeResult.route.protocol ||
        this.resolvePreferredProtocol(targetAE, messageType, 'outbound');

      this.assertAEAccess(targetAE, targetProtocol, 'outbound');

      const validationResults =
        await this.validationRuleService.evaluateRouteValidations(
          routeResult.route,
          canonicalMessage,
        );

      const outboundBinding = this.resolveMappingBinding(
        targetAE,
        'outbound',
        targetProtocol,
        messageType,
        routeResult.mappingId,
      );

      const outboundMessage = await this.fromCanonical(
        canonicalMessage,
        messageType,
        targetProtocol,
        outboundBinding,
        routeResult.route,
        targetAE,
      );

      await this.recordEvent(
        context,
        EventType.TRANSFORMATION_APPLIED,
        MessageStatus.MAPPING,
        {
          direction: 'outbound',
          targetAE: targetAE.id,
          targetProtocol,
          mapping: describeBinding(outboundBinding, targetProtocol),
          validationResults,
          outboundPreview: outboundMessage,
        },
      );

      await this.dispatchMessage(targetAE, targetProtocol, outboundMessage, messageType);

      await this.recordEvent(context, EventType.MESSAGE_SENT, MessageStatus.SENT, {
        targetAE: targetAE.id,
        targetProtocol,
        outboundMessage,
      });

      await this.eventTracer.completeTrace(context.messageId, MessageStatus.SENT);

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
        message: 'Success'
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Message flow failed: ${message}`);

      await this.recordEvent(
        context,
        EventType.ERROR_OCCURRED,
        MessageStatus.FAILED,
        {
          error: message,
        },
        message,
      );

      await this.eventTracer.completeTrace(context.messageId, MessageStatus.FAILED);
      throw error;
    }
  }

  async listRecentTraces(limit: number) {
    return this.eventTracer.listRecentTraces(limit);
  }

  async getAuditForMessage(messageId: string) {
    return this.eventTracer.getAuditTrail(messageId);
  }

  private async resolveAE(identifier: string): Promise<ApplicationEntityContract> {
    const byId = await this.aeRegistry.getAE(identifier);
    if (byId) {
      return byId;
    }

    const all = await this.aeRegistry.listAEs({page: 1, limit: 100, filters: []});
    const matched = all.data.find(
      (ae) =>
        ae.id.toLowerCase() === identifier.toLowerCase() ||
        ae.name.toLowerCase() === identifier.toLowerCase(),
    );

    if (!matched) {
      throw new Error(`Application entity not found: ${identifier}`);
    }

    return matched;
  }

  private assertAEAccess(
    ae: ApplicationEntityContract,
    protocol: ProtocolType,
    direction: 'inbound' | 'outbound',
  ): void {
    if (ae.status !== AEStatus.ACTIVE) {
      throw new Error(`AE is not active: ${ae.id}`);
    }

    const capabilities =
      direction === 'inbound' ? ae.inboundCapabilities : ae.outboundCapabilities;

    if (!capabilities.includes(protocol)) {
      throw new Error(
        `AE ${ae.id} does not support ${direction} protocol ${protocol}`,
      );
    }
  }

  private resolveMappingBinding(
    ae: ApplicationEntityContract,
    direction: 'inbound' | 'outbound',
    protocol: ProtocolType,
    messageType: MessageType,
    overrideMappingId?: string,
  ): AEMappingBinding | null {
    if (overrideMappingId) {
      return {
        messageType,
        protocol,
        mappingId: overrideMappingId,
      };
    }

    const bindings = ae.mappings?.[direction];
    if (Array.isArray(bindings)) {
      const exactMatch = bindings.find(
        (binding) =>
          binding.messageType === messageType && binding.protocol === protocol,
      );
      if (exactMatch) {
        return exactMatch;
      }
    }

    const legacyMappingId =
      direction === 'inbound'
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

  private async toCanonical(
    payload: any,
    messageType: MessageType,
    protocol: ProtocolType,
    binding: AEMappingBinding | null,
  ): Promise<CanonicalFlowMessage> {
    if (protocol === ProtocolType.CUSTOM_JSON) {
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

      return normalizeCanonicalMessage(
        result.targetMessage as CanonicalFlowMessage,
        payload,
        protocol,
        messageType,
      );
    }

    if (protocol === ProtocolType.HL7_V2) {
      const rawMessage = typeof payload === 'string' ? payload : String(payload);
      const validation = this.hl7StandardValidator.validateRawMessage(rawMessage);
      if (!validation.valid) {
        throw new Error(`Invalid HL7 message: ${validation.errors.join(', ')}`);
      }
      const parsed = this.hl7Parser.parseMessage(rawMessage);

      const patient = this.hl7ToCanonical.transformPatient(parsed);
      if (messageType === MessageType.PATIENT) {
        return normalizeCanonicalMessage(
          {
            messageType,
            patient: patient
              ? canonicalPatientToFlowPatient(patient)
              : undefined,
            metadata: {},
          },
          payload,
          protocol,
          messageType,
        );
      }

      const order = this.hl7ToCanonical.transformOrder(parsed, patient?.id);
      return normalizeCanonicalMessage(
        {
          messageType,
          order: order ? canonicalOrderToFlowOrder(order) : undefined,
          patient: patient ? canonicalPatientToFlowPatient(patient) : undefined,
          metadata: {},
        },
        payload,
        protocol,
        messageType,
      );
    }

    if (protocol === ProtocolType.FHIR_R4) {
      const resource =
        typeof payload === 'string' ? JSON.parse(payload) : payload;
      const validation = this.fhirValidator.validateResource(resource);
      if (!validation.valid) {
        throw new Error(`Invalid FHIR resource: ${validation.errors.join(', ')}`);
      }

      if (messageType === MessageType.PATIENT || resource.resourceType === 'Patient') {
        const patient = this.fhirToCanonical.transformPatient(resource);
        return normalizeCanonicalMessage(
          {
            messageType: MessageType.PATIENT,
            patient: canonicalPatientToFlowPatient(patient),
            metadata: {},
          },
          payload,
          protocol,
          MessageType.PATIENT,
        );
      }

      const order = this.fhirToCanonical.transformOrder(resource);
      const subjectId =
        resource.subject?.reference?.split('/')?.[1] || order.subject?.reference?.split('/')?.[1];

      return normalizeCanonicalMessage(
        {
          messageType: MessageType.ORDER,
          order: canonicalOrderToFlowOrder(order),
          patient: subjectId ? { id: subjectId } : undefined,
          metadata: {},
        },
        payload,
        protocol,
        MessageType.ORDER,
      );
    }

    throw new Error(`Unsupported inbound protocol: ${protocol}`);
  }

  private async fromCanonical(
    canonicalMessage: CanonicalFlowMessage,
    messageType: MessageType,
    protocol: ProtocolType,
    binding: AEMappingBinding | null,
    route: RoutingRule,
    targetAE: ApplicationEntityContract,
  ): Promise<any> {
    if (protocol === ProtocolType.CUSTOM_JSON) {
      const mapping = await this.requireMapping(binding, protocol, messageType, 'outbound');
      const result = await this.mappingEngine.mapMessage(canonicalMessage, mapping);

      if (!result.success || result.targetMessage === undefined) {
        throw new Error(result.errors?.join(', ') || 'Custom outbound mapping failed');
      }

      return result.targetMessage;
    }

    if (protocol === ProtocolType.HL7_V2) {
      const switchAE = await this.resolveSwitchAE();

      if (messageType === MessageType.PATIENT) {
        const patientMessage = normalizeCanonicalPatient(canonicalMessage);
        const outbound = buildHl7Message([
          buildHl7MshSegment(messageType, switchAE, targetAE, route),
          this.canonicalToHl7.transformPatient(patientMessage),
        ]);
        this.assertOutboundHl7(outbound);
        return outbound;
      }

      const orderMessage = normalizeCanonicalOrder(canonicalMessage);
      const patientMessage = normalizeCanonicalPatient(canonicalMessage);
      const orderSegments = this.canonicalToHl7.transformOrder(orderMessage);

      const outbound = buildHl7Message([
        buildHl7MshSegment(messageType, switchAE, targetAE, route),
        this.canonicalToHl7.transformPatient(patientMessage),
        ...orderSegments,
      ]);
      this.assertOutboundHl7(outbound);
      return outbound;
    }

    if (protocol === ProtocolType.FHIR_R4) {
      if (messageType === MessageType.PATIENT) {
        return this.canonicalToFhir.transformPatient(
          normalizeCanonicalPatient(canonicalMessage),
        );
      }

      return this.canonicalToFhir.transformOrder(
        normalizeCanonicalOrder(canonicalMessage),
      );
    }

    throw new Error(`Unsupported outbound protocol: ${protocol}`);
  }

  private async dispatchMessage(
    targetAE: ApplicationEntityContract,
    protocol: ProtocolType,
    outboundMessage: any,
    messageType: MessageType,
  ): Promise<void> {
    const config = this.resolveProtocolConfig(targetAE, protocol, 'outbound');

    if (protocol === ProtocolType.HL7_V2) {
      await this.hl7Bridge.sendMessage(config.host, config.port, String(outboundMessage));
      return;
    }

    if (protocol === ProtocolType.FHIR_R4) {
      await this.fhirBridge.sendResource(buildHttpBaseUrl(config), outboundMessage);
      return;
    }

    if (protocol === ProtocolType.CUSTOM_JSON) {
      await postJson(buildHttpBaseUrl(config), outboundMessage);
      return;
    }

    throw new Error(
      `Unsupported outbound protocol ${protocol} for message type ${messageType}`,
    );
  }

  private resolveProtocolConfig(
    ae: ApplicationEntityContract,
    protocol: ProtocolType,
    direction: 'inbound' | 'outbound',
  ): ProtocolConfig {
    const configs =
      direction === 'inbound' ? ae.inboundConfig : ae.outboundConfig;
    const matched = configs.find((config) => config.protocol === protocol);

    if (!matched) {
      throw new Error(
        `No ${direction} config found for AE ${ae.id} and protocol ${protocol}`,
      );
    }

    return matched;
  }

  private resolvePreferredProtocol(
    ae: ApplicationEntityContract,
    messageType: MessageType,
    direction: 'inbound' | 'outbound',
  ): ProtocolType {
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

  private async resolveRoutingTable() {
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

  private async resolveSwitchAE() {
    const configuredId = process.env.SWITCH_AE_ID || 'switch';
    return this.resolveAE(configuredId);
  }

  private async requireMapping(
    binding: AEMappingBinding | null,
    protocol: ProtocolType,
    messageType: MessageType,
    direction: 'inbound' | 'outbound',
  ): Promise<StandardMapping> {
    if (!binding?.mappingId) {
      throw new Error(
        `A ${direction} mapping is required for protocol ${protocol} and message type ${messageType}`,
      );
    }

    const mapping = await this.mappingEngine.getMapping(binding.mappingId);
    if (!mapping) {
      throw new Error(`Mapping not found: ${binding.mappingId}`);
    }

    return mapping;
  }

  private async recordEvent(
    context: MessageContext,
    eventType: EventType,
    status: MessageStatus,
    snapshot: Record<string, any>,
    errorMessage?: string,
  ): Promise<void> {
    await this.eventTracer.recordEvent({
      id: randomUUID(),
      eventType,
      messageId: context.messageId,
      timestamp: new Date(),
      sequenceNumber: context.sequence++,
      sourceAE: context.sourceAE,
      targetAE: context.targetAE,
      status,
      metadata: this.eventTracer.createEventMetadata(
        context.correlationId,
        context.traceId,
        `${context.messageId}-${context.sequence}`,
        {
          messageType: context.messageType,
          sourceProtocol: context.sourceProtocol,
        },
      ),
      snapshot,
      errorMessage,
      correlationId: context.correlationId,
      createdAt: new Date(),
    });
  }

  private assertOutboundHl7(message: string): void {
    const validation = this.hl7StandardValidator.validateRawMessage(message);
    if (!validation.valid) {
      throw new Error(`Invalid outbound HL7 message: ${validation.errors.join(', ')}`);
    }
  }
}

export function normalizeCanonicalMessage(
  message: CanonicalFlowMessage,
  sourcePayload: any,
  protocol: ProtocolType,
  messageType: MessageType,
): CanonicalFlowMessage {
  const normalized: CanonicalFlowMessage = {
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

  const rawCategory =
    normalized.metadata.orderCategory ||
    extractStructuredCategory(normalized.order?.category?.[0]) ||
    normalized.order?.code?.display ||
    normalized.order?.code?.code ||
    normalized.order?.category?.[0] ||
    getValueByPath(sourcePayload, 'order_category') ||
    getValueByPath(sourcePayload, 'category[0].text') ||
    getValueByPath(sourcePayload, 'code.text') ||
    getValueByPath(sourcePayload, 'order') ||
    getValueByPath(sourcePayload, 'order.code.display');

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

export function normalizeOrderCategory(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = String(value).trim().toUpperCase();
  if (!normalized) {
    return undefined;
  }

  if (
    normalized.includes('RADIOLOGY') ||
    normalized.includes('IMAGING') ||
    normalized.includes('XRAY') ||
    normalized.includes('X-RAY') ||
    normalized.includes('MRI') ||
    normalized.includes('CT')
  ) {
    return 'RADIOLOGY';
  }

  if (
    normalized.includes('LAB') ||
    normalized.includes('LABORATORY') ||
    normalized.includes('CBC') ||
    normalized.includes('CHEM')
  ) {
    return 'LABORATORY';
  }

  return normalized;
}

export function detectInboundProtocol(payload: any): ProtocolType {
  if (typeof payload === 'string' && payload.trim().startsWith('MSH')) {
    return ProtocolType.HL7_V2;
  }

  if (payload && typeof payload === 'object' && payload.resourceType) {
    return ProtocolType.FHIR_R4;
  }

  return ProtocolType.CUSTOM_JSON;
}

export function inferMessageType(payload: any, protocol: ProtocolType): MessageType {
  if (protocol === ProtocolType.HL7_V2 && typeof payload === 'string') {
    const mshLine = payload.split(/\r?\n/)[0] || '';
    const messageType = mshLine.split('|')[8] || '';
    return messageType.startsWith('ADT')
      ? MessageType.PATIENT
      : MessageType.ORDER;
  }

  if (protocol === ProtocolType.FHIR_R4 && payload?.resourceType === 'Patient') {
    return MessageType.PATIENT;
  }

  return MessageType.ORDER;
}

function describeBinding(
  binding: AEMappingBinding | null,
  protocol: ProtocolType,
): Record<string, any> {
  return {
    protocol,
    mappingId: binding?.mappingId || null,
    strategy: binding?.mappingId ? 'mapping-engine' : 'built-in',
  };
}

function extractStructuredCategory(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const candidate = value as {
    text?: string;
    coding?: Array<{ display?: string; code?: string }>;
  };

  return (
    candidate.text ||
    candidate.coding?.[0]?.display ||
    candidate.coding?.[0]?.code
  );
}

function buildHl7Message(segments: string[]): string {
  return segments.filter(Boolean).join('\r');
}

function buildHl7MshSegment(
  messageType: MessageType,
  switchAE: ApplicationEntityContract,
  targetAE: ApplicationEntityContract,
  route: RoutingRule,
): string {
  const timestamp = formatHl7Timestamp(new Date());
  const triggerEvent =
    messageType === MessageType.PATIENT ? 'ADT^A04' : 'ORM^O01';

  const sendingApplication = formatHdField({
    namespaceId:
      process.env.SWITCH_APPLICATION_NAMESPACE_ID ||
      process.env.SWITCH_APPLICATION_NAME ||
      switchAE.name,
    id:
      process.env.SWITCH_APPLICATION_UUID ||
      switchAE.customId ||
      switchAE.id,
    idType:
      process.env.SWITCH_APPLICATION_ID_TYPE ||
      'UUID',
  });
  const sendingFacility = formatHdField(resolveFacilityIdentifier(switchAE));
  const receivingApplication = formatHdField({
    namespaceId: route.applicationIdentifier?.namespaceId || route.applicationName,
    id: route.applicationIdentifier?.id || route.applicationId,
    idType: route.applicationIdentifier?.idType || 'UUID',
  });
  const receivingFacility = formatHdField(resolveFacilityIdentifier(targetAE));

  return `MSH|^~\\&|${sendingApplication}|${sendingFacility}|${receivingApplication}|${receivingFacility}|${timestamp}||${triggerEvent}|${randomUUID()}|P|2.5`;
}

function buildHttpBaseUrl(config: ProtocolConfig): string {
  return `http://${config.host}:${config.port}`;
}

function canonicalOrderToFlowOrder(order: CanonicalOrder): CanonicalFlowMessage['order'] {
  return {
    id: order.id,
    identifier: order.identifier,
    code: {
      code: order.code?.coding?.[0]?.code,
      display: order.code?.text || order.code?.coding?.[0]?.display,
    },
    authoredOn: order.authoredOn?.toISOString(),
    requester: {
      id:
        order.requester?.reference?.split('/')?.[1] ||
        order.requester?.identifier?.value ||
        order.requester?.display,
    },
    subject: {
      id:
        order.subject?.reference?.split('/')?.[1] ||
        order.subject?.identifier?.value ||
        order.subject?.display,
    },
    status: order.status,
    priority: order.priority,
    category: order.category,
  };
}

function canonicalPatientToFlowPatient(
  patient: CanonicalPatient,
): CanonicalFlowMessage['patient'] {
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

function normalizeCanonicalOrder(message: CanonicalFlowMessage): CanonicalOrder {
  const patientId = message.patient?.id || message.order?.subject?.id || 'unknown';
  const authoredOn = message.order?.authoredOn
    ? new Date(message.order.authoredOn)
    : new Date();

  return {
    id: message.order?.id || randomUUID(),
    resourceType: 'ServiceRequest',
    identifier:
      message.order?.identifier?.length
        ? message.order.identifier
        : [
            {
              system: 'urn:rxsoft:switch:order',
              value: message.order?.id || randomUUID(),
            },
          ],
    status: normalizeOrderStatus(message.order?.status),
    priority: normalizePriority(message.order?.priority),
    intent: 'order',
    category: message.order?.category || [],
    code: {
      text:
        message.order?.code?.display ||
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

function normalizeCanonicalPatient(message: CanonicalFlowMessage): CanonicalPatient {
  return {
    id: message.patient?.id || message.order?.subject?.id || 'unknown',
    resourceType: 'Patient',
    identifiers:
      message.patient?.identifier?.length
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
        text:
          message.patient?.name?.text ||
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

function normalizeOrderStatus(status?: string): CanonicalOrder['status'] {
  const normalized = String(status || 'active').toLowerCase();
  if (
    normalized === 'draft' ||
    normalized === 'active' ||
    normalized === 'on-hold' ||
    normalized === 'revoked' ||
    normalized === 'completed' ||
    normalized === 'entered-in-error' ||
    normalized === 'unknown'
  ) {
    return normalized as CanonicalOrder['status'];
  }

  return 'active';
}

function normalizePriority(priority?: string): Priority {
  const normalized = String(priority || 'NORMAL').toUpperCase();
  if (
    normalized === Priority.LOW ||
    normalized === Priority.NORMAL ||
    normalized === Priority.HIGH ||
    normalized === Priority.URGENT
  ) {
    return normalized as Priority;
  }

  if (normalized === 'ROUTINE') {
    return Priority.NORMAL;
  }

  if (normalized === 'STAT' || normalized === 'ASAP') {
    return Priority.URGENT;
  }

  return Priority.NORMAL;
}

function normalizePatientGender(gender?: string): CanonicalPatient['gender'] {
  const normalized = String(gender || 'unknown').toLowerCase();
  if (
    normalized === 'male' ||
    normalized === 'female' ||
    normalized === 'other' ||
    normalized === 'unknown'
  ) {
    return normalized as CanonicalPatient['gender'];
  }

  if (normalized === 'm') {
    return 'male';
  }

  if (normalized === 'f') {
    return 'female';
  }

  return 'unknown';
}

export function extractTargetAE(
  message: CanonicalFlowMessage | undefined,
  sourcePayload: any,
): string | undefined {
  const hl7Target = extractTargetAEFromHl7(sourcePayload);
  const candidates = [
    message?.metadata?.targetAE,
    hl7Target,
    getValueByPath(sourcePayload, 'targetAE'),
    getValueByPath(sourcePayload, 'targetAe'),
    getValueByPath(sourcePayload, 'destination_ae'),
    getValueByPath(sourcePayload, 'destinationAE'),
    getValueByPath(sourcePayload, 'metadata.targetAE'),
    getValueByPath(sourcePayload, 'resource.targetAE'),
  ];

  const resolved = candidates.find(
    (candidate) => typeof candidate === 'string' && candidate.trim().length > 0,
  );

  return typeof resolved === 'string' ? resolved.trim() : undefined;
}

function extractTargetAEFromHl7(sourcePayload: any): string | undefined {
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

function formatHl7Timestamp(value: Date): string {
  return value.toISOString().replace(/\.\d{3}Z$/, '').replace(/[-:]/g, '').replace('T', '');
}

function formatHdField(input?: { namespaceId?: string; id?: string; idType?: string }): string {
  return [
    input?.namespaceId || '',
    input?.id || '',
    input?.idType || '',
  ].join('^');
}

function resolveFacilityIdentifier(ae: ApplicationEntityContract) {
  return {
    namespaceId:
      ae.facilityIdentifier?.namespaceId ||
      ae.facility?.identifier?.namespaceId ||
      ae.facilityName ||
      ae.facility?.facilityName ||
      ae.name,
    id:
      ae.facilityIdentifier?.id ||
      ae.facility?.identifier?.id ||
      ae.facilityId ||
      ae.facility?.facilityId ||
      ae.id,
    idType:
      ae.facilityIdentifier?.idType ||
      ae.facility?.identifier?.idType ||
      'UUID',
  };
}
