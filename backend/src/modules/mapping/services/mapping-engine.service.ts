import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { StandardMappingEntity } from '../../core/entities';
import {
  StandardMapping,
  MappingResult,
  MappingContext,
  MappingEngine,
} from '../../../common/models';

@Injectable()
export class MappingEngineService implements MappingEngine {
  private readonly logger = new Logger(MappingEngineService.name);

  constructor(
    @InjectRepository(StandardMappingEntity)
    private mappingRepository: Repository<StandardMappingEntity>,
  ) {}

  async createMapping(
    mapping: Omit<StandardMapping, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<StandardMapping> {
    const id = uuidv4();
    const entity = this.mappingRepository.create({
      id,
      ...mapping,
    });
    const saved = await this.mappingRepository.save(entity);
    this.logger.log(`Mapping created: ${saved.id} (${saved.name})`);
    return saved as unknown as StandardMapping;
  }

  async getMapping(id: string): Promise<StandardMapping | null> {
    const entity = await this.mappingRepository.findOne({ where: { id } });
    return entity as StandardMapping | null;
  }

  async updateMapping(
    id: string,
    updates: Partial<StandardMapping>,
  ): Promise<StandardMapping> {
    await this.mappingRepository.update(id, updates as any);
    const updated = await this.getMapping(id);
    this.logger.log(`Mapping updated: ${id}`);
    return updated!;
  }

  async listMappings(
    filters?: {
      sourceProtocol?: string;
      targetProtocol?: string;
      active?: boolean;
    },
  ): Promise<StandardMapping[]> {
    const query = this.mappingRepository.createQueryBuilder('m');

    if (filters?.sourceProtocol) {
      query.andWhere('m.sourceProtocol = :sourceProtocol', {
        sourceProtocol: filters.sourceProtocol,
      });
    }

    if (filters?.targetProtocol) {
      query.andWhere('m.targetProtocol = :targetProtocol', {
        targetProtocol: filters.targetProtocol,
      });
    }

    if (filters?.active !== undefined) {
      query.andWhere('m.active = :active', { active: filters.active });
    }

    const entities = await query.getMany();
    return entities as unknown as StandardMapping[];
  }

  async mapMessage(
    message: any,
    mapping: StandardMapping,
    context?: MappingContext,
  ): Promise<MappingResult> {
    const startTime = Date.now();

    try {
      if (!mapping.active) {
        return {
          success: false,
          errors: ['Mapping is not active'],
        };
      }

      const targetMessage: any = {};
      const errors: string[] = [];
      const mappingContext = context || { sourceMessage: message };

      // Execute mapping steps
      for (const step of mapping.mappingSteps) {
        try {
          const result = await this.executeStep(step, message, mappingContext);
          if (result.error) {
            if (step.required) {
              errors.push(result.error);
            } else {
              this.logger.warn(`Non-critical mapping error: ${result.error}`);
            }
          } else {
            this.setFieldValue(targetMessage, step.targetField, result.value);
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          const errorMsg = `Error in step ${step.name}: ${err.message}`;
          if (step.required) {
            errors.push(errorMsg);
          } else {
            this.logger.warn(errorMsg);
          }
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          errors,
          targetMessage,
          executionTime: Date.now() - startTime,
        };
      }

      return {
        success: true,
        targetMessage,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Mapping failed: ${err.message}`, err.stack);
      return {
        success: false,
        errors: [err.message],
        executionTime: Date.now() - startTime,
      };
    }
  }

  private async executeStep(step: any, source: any, context: MappingContext) {
    const sourceValue = this.getFieldValue(source, step.sourceField);

    let value = sourceValue;

    if (step.transformation) {
      if (typeof step.transformation === 'string') {
        value = await this.applySimpleTransformation(
          step.transformation,
          sourceValue,
        );
      } else {
        value = await this.applyComplexTransformation(
          step.transformation,
          sourceValue,
          context,
        );
      }
    }

    if (step.condition) {
      const conditionMet = this.evaluateCondition(step.condition, {
        value: sourceValue,
        ...context.variables,
      });
      if (!conditionMet && step.fallbackValue !== undefined) {
        value = step.fallbackValue;
      }
    }

    return { value, error: null };
  }

  private applySimpleTransformation(transformation: string, value: any): string {
    switch (transformation) {
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      case 'trim':
        return String(value).trim();
      default:
        return value;
    }
  }

  private async applyComplexTransformation(
    transformation: any,
    value: any,
    context: MappingContext,
  ): Promise<any> {
    switch (transformation.type) {
      case 'concat':
        return (transformation.params?.prefix || '') +
          value +
          (transformation.params?.suffix || '');
      case 'split':
        return String(value).split(transformation.params?.delimiter || ',');
      case 'custom':
        return this.evaluateExpression(
          transformation.expression,
          { value, ...context.variables },
        );
      default:
        return value;
    }
  }

  private evaluateCondition(expression: string, variables: Record<string, any>): boolean {
    try {
      const func = new Function(
        ...Object.keys(variables),
        `return ${expression}`,
      );
      return func(...Object.values(variables)) as boolean;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.warn(`Condition evaluation failed: ${err.message}`);
      return false;
    }
  }

  private evaluateExpression(expression: string, variables: Record<string, any>): any {
    try {
      const func = new Function(...Object.keys(variables), `return ${expression}`);
      return func(...Object.values(variables));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.warn(`Expression evaluation failed: ${err.message}`);
      return null;
    }
  }

  private getFieldValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setFieldValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop();

    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }
}
