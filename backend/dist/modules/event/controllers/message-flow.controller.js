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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageFlowController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_flow_service_1 = require("../services/message-flow.service");
const application_entity_entity_1 = require("../../core/entities/application-entity.entity");
const routing_table_entity_1 = require("../../core/entities/routing-table.entity");
const standard_mapping_entity_1 = require("../../core/entities/standard-mapping.entity");
const validation_rule_entity_1 = require("../../core/entities/validation-rule.entity");
let MessageFlowController = class MessageFlowController {
    constructor(flowService, aeRepository, routingRepository, mappingRepository, validationRepository) {
        this.flowService = flowService;
        this.aeRepository = aeRepository;
        this.routingRepository = routingRepository;
        this.mappingRepository = mappingRepository;
        this.validationRepository = validationRepository;
    }
    async processOrder(body) {
        const payload = body.targetAE
            ? `${body.hl7Message}\rZRT|${body.targetAE}`
            : body.hl7Message;
        const result = await this.flowService.processHealthstackOrder(payload);
        return { success: true, result };
    }
    async processOrderFhir(body) {
        const result = await this.flowService.processHealthstackOrderFhir({
            ...body.resource,
            ...(body.targetAE ? { targetAE: body.targetAE } : {}),
        });
        return { success: true, result };
    }
    async processPatient(body) {
        const payload = body.hl7Message ?? body.resource;
        const result = await this.flowService.processHealthstackPatient(payload);
        return { success: true, result };
    }
    async processOrderModel(body) {
        const result = await this.flowService.processHealthstackOrderModel({
            ...body.orderModel,
            ...(body.targetAE ? { targetAE: body.targetAE } : {}),
        });
        return { success: true, result };
    }
    async processMessage(body) {
        const result = await this.flowService.processMessage({
            sourceAE: body.sourceAE,
            targetAE: body.targetAE,
            messageType: body.messageType,
            protocol: body.protocol,
            payload: body.payload,
        });
        return { success: true, result };
    }
    async getTopology() {
        const applicationEntities = await this.aeRepository.find();
        const routingTables = await this.routingRepository.find();
        const mappings = await this.mappingRepository.find();
        const validationRules = await this.validationRepository.find();
        return { applicationEntities, routingTables, mappings, validationRules };
    }
    async listTraces(limit = '20') {
        return this.flowService.listRecentTraces(Number(limit));
    }
    async getAudit(messageId) {
        return this.flowService.getAuditForMessage(messageId);
    }
};
exports.MessageFlowController = MessageFlowController;
__decorate([
    (0, common_1.Post)('healthstack/order'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageFlowController.prototype, "processOrder", null);
__decorate([
    (0, common_1.Post)('healthstack/order-fhir'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageFlowController.prototype, "processOrderFhir", null);
__decorate([
    (0, common_1.Post)('healthstack/patient'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageFlowController.prototype, "processPatient", null);
__decorate([
    (0, common_1.Post)('healthstack/order-model'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageFlowController.prototype, "processOrderModel", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageFlowController.prototype, "processMessage", null);
__decorate([
    (0, common_1.Get)('topology'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MessageFlowController.prototype, "getTopology", null);
__decorate([
    (0, common_1.Get)('traces'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageFlowController.prototype, "listTraces", null);
__decorate([
    (0, common_1.Get)('audit/:messageId'),
    __param(0, (0, common_1.Param)('messageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessageFlowController.prototype, "getAudit", null);
exports.MessageFlowController = MessageFlowController = __decorate([
    (0, common_1.Controller)('v1/flow'),
    __param(1, (0, typeorm_1.InjectRepository)(application_entity_entity_1.ApplicationEntityEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(routing_table_entity_1.RoutingTableEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(standard_mapping_entity_1.StandardMappingEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(validation_rule_entity_1.ValidationRuleEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof message_flow_service_1.MessageFlowService !== "undefined" && message_flow_service_1.MessageFlowService) === "function" ? _a : Object, typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MessageFlowController);
//# sourceMappingURL=message-flow.controller.js.map