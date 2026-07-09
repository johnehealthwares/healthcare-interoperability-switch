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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextEnrichmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../core/entities");
const enums_1 = require("../../../common/enums");
const path_util_1 = require("../../../common/utils/path.util");
const coding_concept_client_service_1 = require("./coding-concept-client.service");
let ContextEnrichmentService = class ContextEnrichmentService {
    constructor(enrichmentRepository, codingConceptClient) {
        this.enrichmentRepository = enrichmentRepository;
        this.codingConceptClient = codingConceptClient;
    }
    async create(payload) {
        const entity = this.enrichmentRepository.create({
            id: (0, crypto_1.randomUUID)(),
            ...payload,
        });
        const saved = await this.enrichmentRepository.save(entity);
        return saved;
    }
    async list() {
        const rules = await this.enrichmentRepository.find({
            order: { name: 'ASC' },
        });
        return rules;
    }
    async get(id) {
        const rule = await this.enrichmentRepository.findOne({ where: { id } });
        return rule;
    }
    async update(id, updates) {
        await this.enrichmentRepository.update(id, updates);
        return this.get(id);
    }
    async delete(id) {
        await this.enrichmentRepository.delete(id);
    }
    async resolve(input) {
        const canonicalMessage = input.canonicalMessage ?? {};
        const route = input.route;
        const context = this.buildBaseContext(input);
        const warnings = [];
        const errors = [];
        const enrichmentIds = this.resolveEnrichmentIds(route);
        const enrichmentConfig = route?.enrichmentConfig ?? route?.validationConfig;
        if (!route ||
            enrichmentConfig?.enabled === false ||
            enrichmentConfig?.useCodingServer === false ||
            enrichmentIds.length === 0) {
            return { context, warnings, errors };
        }
        const rules = await this.enrichmentRepository.findBy({
            id: (0, typeorm_2.In)(enrichmentIds),
        });
        const orderedRules = enrichmentIds
            .map((enrichmentId) => rules.find((rule) => rule.id === enrichmentId))
            .filter(Boolean);
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
            const conditionsPassed = (rule.conditions || []).every((condition) => this.evaluateCondition(canonicalMessage, condition));
            if (!conditionsPassed) {
                continue;
            }
            const codePath = rule.action?.codePath || '';
            const codeValue = (0, path_util_1.getValueByPath)(canonicalMessage, codePath);
            const moduleName = String(rule.action?.module || '').toUpperCase();
            const concept = await this.codingConceptClient.searchConcept(rule.action.module, codeValue, enrichmentConfig?.metadata ?? rule.action.includeMetadata ?? true, enrichmentConfig?.mode ?? rule.action.searchMode ?? 'search');
            if (concept?.skipped) {
                warnings.push(`Enrichment lookup skipped for rule ${rule.name}`);
                continue;
            }
            if (concept) {
                this.mergeTerminologyContext(context, moduleName, codeValue, concept);
                continue;
            }
            const message = rule.failureResponse?.message ||
                `Enrichment lookup did not resolve a concept for rule ${rule.name}`;
            if (route.enrichmentConfig?.stopOnLookupMiss ?? true) {
                errors.push(message);
            }
            else {
                warnings.push(message);
            }
        }
        if (errors.length > 0) {
            throw new common_1.UnprocessableEntityException({
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
    buildBaseContext(input) {
        const canonicalMessage = input.canonicalMessage ?? {};
        const targetAE = input.targetAE;
        const sourceAE = input.sourceAE;
        const route = input.route;
        const patient = canonicalMessage.patient;
        const order = canonicalMessage.order;
        const targetProtocol = input.targetProtocol ?? route?.protocol;
        const facilityId = targetAE?.facility?.facilityId ||
            targetAE?.facilityId ||
            targetAE?.facilityCode ||
            targetAE?.id ||
            route?.targetAE;
        const facilityCode = targetAE?.facilityIdentifier?.namespaceId ||
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
                        organizationReference: targetAE?.organizationId || targetAE?.facilityId
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
    buildFormulationContext(targetProtocol, targetAE) {
        return {
            hl7: targetProtocol === enums_1.ProtocolType.HL7_V2
                ? {
                    messageProfile: targetAE,
                }
                : undefined,
            fhir: targetProtocol === enums_1.ProtocolType.FHIR_R4
                ? {
                    profileTarget: targetAE,
                }
                : undefined,
            dicom: targetAE?.toLowerCase().includes('dcm') || targetAE?.toLowerCase().includes('pacs')
                ? {
                    worklistTarget: targetAE,
                }
                : undefined,
            openelis: targetAE?.toLowerCase().includes('openelis')
                ? {
                    system: 'openelis',
                }
                : undefined,
            risPacs: targetAE?.toLowerCase().includes('ris') || targetAE?.toLowerCase().includes('pacs')
                ? {
                    system: targetAE,
                }
                : undefined,
        };
    }
    mergeTerminologyContext(context, moduleName, codeValue, concept) {
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
        }
        else if (moduleName.includes('SNOMED')) {
            terminology.snomed = resolvedConcept;
        }
        else if (moduleName.includes('DICOM') ||
            moduleName.includes('MODALITY') ||
            moduleName.includes('RAD')) {
            terminology.modality = resolvedConcept;
        }
        else {
            terminology.local = resolvedConcept;
        }
        context.terminology = terminology;
    }
    resolveEnrichmentIds(route) {
        return route?.enrichmentIds?.length
            ? route.enrichmentIds
            : route?.validationIds || [];
    }
    evaluateCondition(message, condition) {
        const value = (0, path_util_1.getValueByPath)(message, condition.field);
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
};
exports.ContextEnrichmentService = ContextEnrichmentService;
exports.ContextEnrichmentService = ContextEnrichmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.ValidationRuleEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        coding_concept_client_service_1.CodingConceptClientService])
], ContextEnrichmentService);
//# sourceMappingURL=context-enrichment.service.js.map