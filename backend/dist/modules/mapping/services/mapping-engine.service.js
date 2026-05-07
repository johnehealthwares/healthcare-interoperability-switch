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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MappingEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingEngineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const entities_1 = require("../../core/entities");
const path_util_1 = require("../../../common/utils/path.util");
let MappingEngineService = MappingEngineService_1 = class MappingEngineService {
    constructor(mappingRepository) {
        this.mappingRepository = mappingRepository;
        this.logger = new common_1.Logger(MappingEngineService_1.name);
    }
    async createMapping(mapping) {
        const id = (0, crypto_1.randomUUID)();
        const entity = this.mappingRepository.create({
            id,
            ...mapping,
        });
        const saved = await this.mappingRepository.save(entity);
        this.logger.log(`Mapping created: ${saved.id} (${saved.name})`);
        return saved;
    }
    async getMapping(id) {
        const entity = await this.mappingRepository.findOne({ where: { id } });
        return entity;
    }
    async updateMapping(id, updates) {
        await this.mappingRepository.update(id, updates);
        const updated = await this.getMapping(id);
        this.logger.log(`Mapping updated: ${id}`);
        return updated;
    }
    async listMappings(filters) {
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
        return entities;
    }
    async mapMessage(message, mapping, context) {
        const startTime = Date.now();
        try {
            if (!mapping.active) {
                return {
                    success: false,
                    errors: ['Mapping is not active'],
                };
            }
            const targetMessage = {};
            const errors = [];
            const mappingContext = {
                sourceMessage: message,
                targetMessage,
                variables: context?.variables || {},
                lookupCache: context?.lookupCache,
            };
            // Execute mapping steps
            for (const step of mapping.mappingSteps) {
                try {
                    const result = await this.executeStep(step, message, mappingContext);
                    if (result.error) {
                        if (step.required) {
                            errors.push(result.error);
                        }
                        else {
                            this.logger.warn(`Non-critical mapping error: ${result.error}`);
                        }
                    }
                    else {
                        (0, path_util_1.setValueByPath)(targetMessage, step.targetField, result.value);
                    }
                }
                catch (error) {
                    const err = error instanceof Error ? error : new Error(String(error));
                    const errorMsg = `Error in step ${step.name}: ${err.message}`;
                    if (step.required) {
                        errors.push(errorMsg);
                    }
                    else {
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
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Mapping failed: ${err.message}`, err.stack);
            return {
                success: false,
                errors: [err.message],
                executionTime: Date.now() - startTime,
            };
        }
    }
    async executeStep(step, source, context) {
        const sourceValue = (0, path_util_1.getValueByPath)(source, step.sourceField);
        let value = sourceValue;
        if (step.transformation) {
            if (typeof step.transformation === 'string') {
                value = await this.applySimpleTransformation(step.transformation, sourceValue, context);
            }
            else {
                value = await this.applyComplexTransformation(step.transformation, sourceValue, context);
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
    applySimpleTransformation(transformation, value, context) {
        switch (transformation) {
            case 'value':
                return value;
            case 'uppercase':
                return String(value).toUpperCase();
            case 'lowercase':
                return String(value).toLowerCase();
            case 'trim':
                return String(value).trim();
            default:
                return this.evaluateExpression(transformation, {
                    value,
                    sourceMessage: context.sourceMessage,
                    targetMessage: context.targetMessage,
                    ...context.variables,
                });
        }
    }
    async applyComplexTransformation(transformation, value, context) {
        switch (transformation.type) {
            case 'concat':
                return (transformation.params?.prefix || '') +
                    value +
                    (transformation.params?.suffix || '');
            case 'split':
                return String(value).split(transformation.params?.delimiter || ',');
            case 'custom':
                return this.evaluateExpression(transformation.expression, {
                    value,
                    sourceMessage: context.sourceMessage,
                    targetMessage: context.targetMessage,
                    ...context.variables,
                });
            default:
                return value;
        }
    }
    evaluateCondition(expression, variables) {
        try {
            const func = new Function(...Object.keys(variables), `return ${expression}`);
            return func(...Object.values(variables));
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.warn(`Condition evaluation failed: ${err.message}`);
            return false;
        }
    }
    evaluateExpression(expression, variables) {
        try {
            const func = new Function(...Object.keys(variables), `return ${expression}`);
            return func(...Object.values(variables));
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.warn(`Expression evaluation failed: ${err.message}`);
            return null;
        }
    }
};
exports.MappingEngineService = MappingEngineService;
exports.MappingEngineService = MappingEngineService = MappingEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.StandardMappingEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MappingEngineService);
//# sourceMappingURL=mapping-engine.service.js.map