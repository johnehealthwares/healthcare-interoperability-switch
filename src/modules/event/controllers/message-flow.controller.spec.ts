import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageFlowController } from './message-flow.controller';
import { MessageFlowService } from '../services/message-flow.service';
import { ApplicationEntityEntity } from '../../core/entities/application-entity.entity';
import { RoutingTableEntity } from '../../core/entities/routing-table.entity';
import { StandardMappingEntity } from '../../core/entities/standard-mapping.entity';
import { ValidationRuleEntity } from '../../core/entities/validation-rule.entity';

describe('MessageFlowController', () => {
  let controller: MessageFlowController;
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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageFlowController],
      providers: [
        { provide: MessageFlowService, useValue: flowServiceMock },
        { provide: getRepositoryToken(ApplicationEntityEntity), useValue: repositoryMock },
        { provide: getRepositoryToken(RoutingTableEntity), useValue: repositoryMock },
        { provide: getRepositoryToken(StandardMappingEntity), useValue: repositoryMock },
        { provide: getRepositoryToken(ValidationRuleEntity), useValue: repositoryMock },
      ],
    }).compile();

    controller = module.get<MessageFlowController>(MessageFlowController);
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
