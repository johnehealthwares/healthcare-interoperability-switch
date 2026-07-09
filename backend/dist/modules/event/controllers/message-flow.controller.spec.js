"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const message_flow_controller_1 = require("./message-flow.controller");
const message_flow_service_1 = require("../services/message-flow.service");
const application_entity_entity_1 = require("../../core/entities/application-entity.entity");
const routing_table_entity_1 = require("../../core/entities/routing-table.entity");
const standard_mapping_entity_1 = require("../../core/entities/standard-mapping.entity");
const validation_rule_entity_1 = require("../../core/entities/validation-rule.entity");
describe('MessageFlowController', () => {
    let controller;
    const flowServiceMock = {
        processHealthstackOrder: jest.fn(),
        processHealthstackPatient: jest.fn(),
        processHealthstackOrderFhir: jest.fn(),
        processHealthstackOrderModel: jest.fn().mockResolvedValue({
            messageId: 'msg-1',
            targetAE: 'openelis',
        }),
        processMessage: jest.fn(),
        listRecentTraces: jest.fn().mockResolvedValue([]),
        getAuditForMessage: jest.fn().mockResolvedValue(null),
    };
    const repositoryMock = { find: jest.fn().mockResolvedValue([]) };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [message_flow_controller_1.MessageFlowController],
            providers: [
                { provide: message_flow_service_1.MessageFlowService, useValue: flowServiceMock },
                { provide: (0, typeorm_1.getRepositoryToken)(application_entity_entity_1.ApplicationEntityEntity), useValue: repositoryMock },
                { provide: (0, typeorm_1.getRepositoryToken)(routing_table_entity_1.RoutingTableEntity), useValue: repositoryMock },
                { provide: (0, typeorm_1.getRepositoryToken)(standard_mapping_entity_1.StandardMappingEntity), useValue: repositoryMock },
                { provide: (0, typeorm_1.getRepositoryToken)(validation_rule_entity_1.ValidationRuleEntity), useValue: repositoryMock },
            ],
        }).compile();
        controller = module.get(message_flow_controller_1.MessageFlowController);
    });
    it('processOrderModel should call flow service and return success', async () => {
        const result = await controller.processOrderModel({
            orderModel: { test: true },
            targetAE: 'openelis',
        });
        expect(flowServiceMock.processHealthstackOrderModel).toHaveBeenCalledWith({
            test: true,
            targetAE: 'openelis',
        });
        expect(result).toEqual({
            success: true,
            result: {
                messageId: 'msg-1',
                targetAE: 'openelis',
            },
        });
    });
    it('getTopology should return application entities, routing tables, mappings, and validations', async () => {
        const result = await controller.getTopology();
        expect(repositoryMock.find).toHaveBeenCalled();
        expect(result).toEqual({
            applicationEntities: [],
            routingTables: [],
            mappings: [],
            validationRules: [],
        });
    });
});
//# sourceMappingURL=message-flow.controller.spec.js.map