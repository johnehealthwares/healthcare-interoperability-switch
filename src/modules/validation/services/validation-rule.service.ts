import {
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { In, Repository } from 'typeorm';
import { ValidationRuleEntity } from '../../core/entities';
import {
  RoutingRule,
  ValidationExecutionResult,
  ValidationRule,
} from '../../../common/models';
import { getValueByPath } from '../../../common/utils/path.util';
import { CodingConceptClientService } from './coding-concept-client.service';

@Injectable()
export class ValidationRuleService {
  constructor(
    @InjectRepository(ValidationRuleEntity)
    private readonly validationRepository: Repository<ValidationRuleEntity>,
    private readonly codingConceptClient: CodingConceptClientService,
  ) {}

  async create(
    payload: Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ValidationRule> {
    const entity = this.validationRepository.create({
      id: randomUUID(),
      ...payload,
    });

    const saved = await this.validationRepository.save(entity);
    return saved as unknown as ValidationRule;
  }

  async list(): Promise<ValidationRule[]> {
    const rules = await this.validationRepository.find({
      order: { name: 'ASC' },
    });
    return rules as unknown as ValidationRule[];
  }

  async get(id: string): Promise<ValidationRule | null> {
    const rule = await this.validationRepository.findOne({ where: { id } });
    return rule as ValidationRule | null;
  }

  async update(
    id: string,
    updates: Partial<ValidationRule>,
  ): Promise<ValidationRule | null> {
    await this.validationRepository.update(id, updates as any);
    return this.get(id);
  }

  async delete(id: string): Promise<void> {
    await this.validationRepository.delete(id);
  }

  async evaluateRouteValidations(
    route: RoutingRule,
    canonicalMessage: Record<string, any>,
  ): Promise<ValidationExecutionResult[]> {
    if (
      !route.validationConfig?.enabled ||
      route.validationConfig?.useCodingServer === false ||
      !route.validationIds?.length
    ) {
      return [];
    }

    const rules = await this.validationRepository.findBy({
      id: In(route.validationIds),
    });
    const orderedRules = route.validationIds
      .map((validationId) =>
        rules.find((rule) => rule.id === validationId),
      )
      .filter(Boolean) as ValidationRuleEntity[];

    const results: ValidationExecutionResult[] = [];

    for (const rule of orderedRules) {
      if (!rule.enabled) {
        continue;
      }

      if (rule.sourceAE && rule.sourceAE !== canonicalMessage?.metadata?.sourceAE) {
        continue;
      }

      if (rule.messageType && rule.messageType !== canonicalMessage?.messageType) {
        continue;
      }

      const conditionsPassed = (rule.conditions || []).every((condition) =>
        this.evaluateCondition(canonicalMessage, condition),
      );
      if (!conditionsPassed) {
        continue;
      }

      const codeValue = getValueByPath(canonicalMessage, rule.action?.codePath || '');
      const concept = await this.codingConceptClient.searchConcept(
        rule.action.module,
        codeValue, 
        route.validationConfig?.metadata ?? rule.action.includeMetadata ?? false,
        route.validationConfig?.mode ?? rule.action.searchMode ?? 'search',
      );

      if (concept?.skipped) { 
        results.push({
          id: rule.id,
          name: rule.name,
          passed: true,
          codeValue,
          module: rule.action.module,
          metadata: { skipped: true },
        });
        continue;
      }

      if (concept && !concept.skipped) {
        results.push({
          id: rule.id,
          name: rule.name,
          passed: true,
          codeValue,
          module: rule.action.module,
          metadata: concept.metadata,
        });
        continue;
      }

      const failure = {
        statusCode: rule.failureResponse?.statusCode || 422,
        code: rule.failureResponse?.code || 'VALIDATION_FAILED',
        message:
          rule.failureResponse?.message ||
          `Validation failed for rule ${rule.name}`,
      };

      results.push({
        id: rule.id,
        name: rule.name,
        passed: false,
        codeValue,
        module: rule.action.module,
        failure,
      });

      throw new UnprocessableEntityException({
        message: failure.message,
        code: failure.code,
        routeId: route.id,
        targetAE: route.targetAE,
        validation: {
          id: rule.id,
          name: rule.name,
          module: rule.action.module,
          codeValue,
        },
        results,
      });
    }

    return results;
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
