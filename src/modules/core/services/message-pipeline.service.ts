import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AERegistryService } from '../../ae/services/ae-registry.service';
import { RoutingEngineService } from '../../routing/services/routing-engine.service';
import { MappingEngineService } from '../../mapping/services/mapping-engine.service';
import { EventTracerService } from '../../event/services/event-tracer.service';
import { HL7ParserService } from '../../hl7/services/hl7-parser.service';
import { HL7ToCanonicalTransformer } from '../../hl7/transformers/hl7-to-canonical.transformer';
import { FHIRValidatorService } from '../../fhir/services/fhir-validator.service';
import { FHIRToCanonicalTransformer } from '../../fhir/transformers/fhir-to-canonical.transformer';
import { MessageStatus, EventType } from '../../../common/enums';

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

@Injectable()
export class MessagePipelineService {
  private readonly logger = new Logger(MessagePipelineService.name);

  constructor(
    private aeRegistry: AERegistryService,
    private routingEngine: RoutingEngineService,
    private mappingEngine: MappingEngineService,
    private eventTracer: EventTracerService,
    private hl7Parser: HL7ParserService,
    private hl7ToCanonical: HL7ToCanonicalTransformer,
    private fhirValidator: FHIRValidatorService,
    private fhirToCanonical: FHIRToCanonicalTransformer,
  ) {}

  /**
   * Process incoming message through the pipeline
   */
  async processMessage(
    rawMessage: any,
    protocol: string,
    sourceAE: string,
  ): Promise<{
    success: boolean;
    messageId: string;
    result?: any;
    errors?: string[];
  }> {
    const messageId = randomUUID();
    const correlationId = randomUUID();
    const traceId = randomUUID();
    const spanId = randomUUID();

    const context: MessagePipelineContext = {
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
      const aeValid = await this.aeRegistry.validateAEAccess(
        sourceAE,
        protocol as any,
        'inbound',
      );
      if (!aeValid) {
        throw new Error(`Invalid or inactive AE: ${sourceAE}`);
      }

      // Step 2: Parse message
      let canonicalMessage = await this.parseMessage(
        rawMessage,
        protocol,
        context,
      );

      // Step 3: Evaluate routing
      const routingTable = await this.routingEngine.getRoutingTable('default');
      if (!routingTable) {
        throw new Error('No routing table found');
      }

      const routeResult = await this.routingEngine.evaluateRoute(
        routingTable.id,
        {
          message: canonicalMessage,
          sourceAE,
        },
      );

      if (!routeResult.matched) {
        throw new Error('No matching route found');
      }

      context.targetAE = routeResult.targetAE;

      // Step 4: Apply mapping if needed
      if (routeResult.mappingId) {
        const mapping = await this.mappingEngine.getMapping(routeResult.mappingId);
        if (mapping) {
          const mappingResult = await this.mappingEngine.mapMessage(
            canonicalMessage,
            mapping,
          );
          if (!mappingResult.success) {
            throw new Error(`Mapping failed: ${mappingResult.errors?.join(', ')}`);
          }
          canonicalMessage = mappingResult.targetMessage;
        }
      }

      // Step 5: Complete trace
      await this.eventTracer.completeTrace(
        messageId,
        MessageStatus.SENT,
      );

      return {
        success: true,
        messageId,
        result: {
          canonicalMessage,
          targetAE: context.targetAE,
          routeId: routeResult.route?.id,
        },
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Message processing failed: ${err.message}`,
        err.stack,
      );

      await this.eventTracer.completeTrace(
        messageId,
        MessageStatus.FAILED,
      );

      return {
        success: false,
        messageId,
        errors: [err.message],
      };
    }
  }

  private async parseMessage(
    rawMessage: any,
    protocol: string,
    context: MessagePipelineContext,
  ): Promise<any> {
    try {
      if (protocol === 'HL7_V2') {
        const hl7Msg = this.hl7Parser.parseMessage(
          typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage),
        );

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
      } else if (protocol === 'FHIR_R4') {
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
        } else if (resource.resourceType === 'ServiceRequest') {
          return {
            patients: [],
            orders: [this.fhirToCanonical.transformOrder(resource)],
          };
        }
      }

      return { patients: [], orders: [] };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Message parsing failed: ${err.message}`);
      throw err;
    }
  }
}
