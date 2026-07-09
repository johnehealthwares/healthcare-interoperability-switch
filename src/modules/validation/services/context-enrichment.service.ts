import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { In, Repository } from 'typeorm';
import { ValidationRuleEntity } from '../../core/entities';
import {
  ContextEnrichmentResolveInput,
  ContextEnrichmentResult,
  EnrichmentContext,
  RoutingRule,
  ValidationRule,
} from '../../../common/models';
import { ProtocolType } from '../../../common/enums';
import { getValueByPath } from '../../../common/utils/path.util';
import { CodingConceptClientService } from './coding-concept-client.service';

@Injectable()
export class ContextEnrichmentService {
  constructor(
    @InjectRepository(ValidationRuleEntity)
    private readonly enrichmentRepository: Repository<ValidationRuleEntity>,
    private readonly codingConceptClient: CodingConceptClientService,
  ) {}

  async create(
    payload: Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ValidationRule> {
    const entity = this.enrichmentRepository.create({
      id: randomUUID(),
      ...payload,
    });

    const saved = await this.enrichmentRepository.save(entity);
    return saved as unknown as ValidationRule;
  }

  async list(): Promise<ValidationRule[]> {
    const rules = await this.enrichmentRepository.find({
      order: { name: 'ASC' },
    });
    return rules as unknown as ValidationRule[];
  }

  async get(id: string): Promise<ValidationRule | null> {
    const rule = await this.enrichmentRepository.findOne({ where: { id } });
    return rule as ValidationRule | null;
  }

  async update(
    id: string,
    updates: Partial<ValidationRule>,
  ): Promise<ValidationRule | null> {
    await this.enrichmentRepository.update(id, updates as any);
    return this.get(id);
  }

  async delete(id: string): Promise<void> {
    await this.enrichmentRepository.delete(id);
  }

  async resolve(input: ContextEnrichmentResolveInput): Promise<ContextEnrichmentResult> {
    const canonicalMessage: any = input.canonicalMessage ?? {};
    const route = input.route;
    const context: EnrichmentContext = this.buildBaseContext(input);
    const warnings: string[] = [];
    const errors: string[] = [];

    const enrichmentIds = this.resolveEnrichmentIds(route);
    const enrichmentConfig = route?.enrichmentConfig ?? route?.validationConfig;
    if (
      !route ||
      enrichmentConfig?.enabled === false ||
      enrichmentConfig?.useCodingServer === false ||
      enrichmentIds.length === 0
    ) {
      return { context, warnings, errors };
    }

    const rules = await this.enrichmentRepository.findBy({
      id: In(enrichmentIds),
    });
    const orderedRules = enrichmentIds
      .map((enrichmentId) => rules.find((rule) => rule.id === enrichmentId))
      .filter(Boolean) as ValidationRuleEntity[];

    for (const rule of orderedRules) {
      if (!rule.enabled) {
        continue;
      }

      if (rule.sourceAE && rule.sourceAE !== canonicalMessage?.metadata?.sourceAE) {
        continue;
      }

      if (rule.messageType && rule.messageType !== input.messageType) {
        continue;
      }

      const conditionsPassed = (rule.conditions || []).every((condition) =>
        this.evaluateCondition(canonicalMessage, condition),
      );
      if (!conditionsPassed) {
        continue;
      }

      const codePath = rule.action?.codePath || '';
      const codeValue = getValueByPath(canonicalMessage, codePath);
      const moduleName = String(rule.action?.module || '').toUpperCase();
      const concept = await this.codingConceptClient.searchConcept(
        rule.action.module,
        codeValue,
        enrichmentConfig?.metadata ?? rule.action.includeMetadata ?? true,
        enrichmentConfig?.mode ?? rule.action.searchMode ?? 'search',
      );

      if (concept?.skipped) {
        warnings.push(`Enrichment lookup skipped for rule ${rule.name}`);
        continue;
      }

      if (concept) {
        this.mergeTerminologyContext(context, moduleName, codeValue, concept);
        continue;
      }

      const message =
        rule.failureResponse?.message ||
        `Enrichment lookup did not resolve a concept for rule ${rule.name}`;

      if (route.enrichmentConfig?.stopOnLookupMiss ?? true) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }

    if (errors.length > 0) {
      throw new UnprocessableEntityException({
        message: errors[0],
        code: 'ENRICHMENT_FAILED',
        routeId: route.id,
        targetAE: route.targetAE,
        context,
        warnings,
        errors,
      });
    }

    return { context, warnings, errors };
  }

  private buildBaseContext(input: ContextEnrichmentResolveInput): EnrichmentContext {
    const canonicalMessage: any = input.canonicalMessage ?? {};
    const targetAE = input.targetAE;
    const sourceAE = input.sourceAE;
    const route = input.route;
    const patient = canonicalMessage.patient as any;
    const order = canonicalMessage.order as any;
    const targetProtocol = input.targetProtocol ?? route?.protocol;
    const facilityId =
      targetAE?.facility?.facilityId ||
      targetAE?.facilityId ||
      targetAE?.facilityCode ||
      targetAE?.id ||
      route?.targetAE;
    const facilityCode =
      targetAE?.facilityIdentifier?.namespaceId ||
      targetAE?.facility?.identifier?.namespaceId ||
      targetAE?.facilityCode ||
      targetAE?.customId ||
      targetAE?.id;

    return {
      patient: patient
        ? {
            id: patient.id,
            identifiers: patient.identifier,
            display: patient.name?.text,
          }
        : undefined,
      practitioner: order?.requester?.id
        ? {
            id: order.requester.id,
            display: order.requester.id,
          }
        : undefined,
      facility: facilityId
        ? {
            id: facilityId,
            name: targetAE?.facility?.facilityName || targetAE?.facilityName || targetAE?.name,
            hl7: {
              facilityCode,
              locationCode: targetAE?.facilityIdentifier?.id || targetAE?.facilityId,
            },
            dicom: {
              aet: targetAE?.customId || targetAE?.id,
              modalityWorklistStation: targetAE?.name,
            },
            fhir: {
              organizationReference:
                targetAE?.organizationId || targetAE?.facilityId
                  ? `Organization/${targetAE.organizationId || targetAE.facilityId}`
                  : undefined,
            },
          }
        : undefined,
      terminology: {
        localCode: order?.code?.code,
        local: order?.code?.code
          ? {
              code: order.code.code,
              display: order.code.display,
            }
          : undefined,
        normalizedText: order?.code?.display || order?.code?.code,
      },
      orderMetadata: {
        id: order?.id,
        category: canonicalMessage.metadata?.orderCategory || order?.category?.[0],
        requestedCode: order?.code?.code,
        requestedDisplay: order?.code?.display,
      },
      routingHints: {
        targetAE: route?.targetAE,
        targetSystem: route?.applicationName || targetAE?.name || route?.targetAE,
        targetProtocol,
        routeId: route?.id,
        routeName: route?.name,
        applicationId: route?.applicationId,
        applicationName: route?.applicationName,
      },
      integration: {
        sourceAE: sourceAE?.id || canonicalMessage.metadata?.sourceAE,
        sourceProtocol: input.sourceProtocol || canonicalMessage.metadata?.sourceProtocol,
        targetAE: targetAE?.id || route?.targetAE,
        targetProtocol,
        messageType: input.messageType,
      },
      formulation: this.buildFormulationContext(targetProtocol, route?.targetAE),
      computed: {
        now: new Date().toISOString(),
      },
    };
  }

  private buildFormulationContext(
    targetProtocol?: ProtocolType,
    targetAE?: string,
  ): EnrichmentContext['formulation'] {
    return {
      hl7:
        targetProtocol === ProtocolType.HL7_V2
          ? {
              messageProfile: targetAE,
            }
          : undefined,
      fhir:
        targetProtocol === ProtocolType.FHIR_R4
          ? {
              profileTarget: targetAE,
            }
          : undefined,
      dicom:
        targetAE?.toLowerCase().includes('dcm') || targetAE?.toLowerCase().includes('pacs')
          ? {
              worklistTarget: targetAE,
            }
          : undefined,
      openelis:
        targetAE?.toLowerCase().includes('openelis')
          ? {
              system: 'openelis',
            }
          : undefined,
      risPacs:
        targetAE?.toLowerCase().includes('ris') || targetAE?.toLowerCase().includes('pacs')
          ? {
              system: targetAE,
            }
          : undefined,
    };
  }

  private mergeTerminologyContext(
    context: EnrichmentContext,
    moduleName: string,
    codeValue: unknown,
    concept: any,
  ): void {
    const terminology = context.terminology ?? {};
    const resolvedConcept = {
      id: concept.id || concept.uuid,
      code: concept.code || concept.moduleCode || concept.value || String(codeValue || ''),
      display: concept.display || concept.name || concept.description,
      system: concept.system || concept.module || moduleName,
      version: concept.version,
      metadata: concept.metadata,
    };

    terminology.mappings = [...(terminology.mappings || []), resolvedConcept];

    if (moduleName.includes('LOINC')) {
      terminology.loinc = resolvedConcept;
    } else if (moduleName.includes('SNOMED')) {
      terminology.snomed = resolvedConcept;
    } else if (
      moduleName.includes('DICOM') ||
      moduleName.includes('MODALITY') ||
      moduleName.includes('RAD')
    ) {
      terminology.modality = resolvedConcept;
    } else {
      terminology.local = resolvedConcept;
    }

    context.terminology = terminology;
  }

  private resolveEnrichmentIds(route?: RoutingRule): string[] {
    return route?.enrichmentIds?.length
      ? route.enrichmentIds
      : route?.validationIds || [];
  }

  private evaluateCondition(message: any, condition: any): boolean {
    const value = getValueByPath(message, condition.field);
    const expected = condition.value;

    switch (condition.operator) {
      case 'equals':
        return value === expected;
      case 'contains':
        return Array.isArray(value)
          ? value.includes(expected)
          : String(value || '').includes(String(expected || ''));
      case 'in':
        return Array.isArray(expected) && expected.includes(value);
      default:
        return false;
    }
  }
}
