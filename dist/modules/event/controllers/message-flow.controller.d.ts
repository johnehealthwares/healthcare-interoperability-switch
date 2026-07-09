import { Repository } from 'typeorm';
import { MessageFlowService } from '../services/message-flow.service';
import { ApplicationEntityEntity } from '../../core/entities/application-entity.entity';
import { RoutingTableEntity } from '../../core/entities/routing-table.entity';
import { StandardMappingEntity } from '../../core/entities/standard-mapping.entity';
import { ValidationRuleEntity } from '../../core/entities/validation-rule.entity';
export declare class MessageFlowController {
    private readonly flowService;
    private readonly aeRepository;
    private readonly routingRepository;
    private readonly mappingRepository;
    private readonly validationRepository;
    constructor(flowService: MessageFlowService, aeRepository: Repository<ApplicationEntityEntity>, routingRepository: Repository<RoutingTableEntity>, mappingRepository: Repository<StandardMappingEntity>, validationRepository: Repository<ValidationRuleEntity>);
    processOrder(body: {
        hl7Message: string;
        targetAE?: string;
    }): Promise<{
        success: boolean;
        result: import("../services").ProcessMessageResult;
    }>;
    processOrderFhir(body: {
        resource: Record<string, unknown>;
        targetAE?: string;
    }): Promise<{
        success: boolean;
        result: import("../services").ProcessMessageResult;
    }>;
    processPatient(body: {
        hl7Message?: string;
        resource?: Record<string, unknown>;
    }): Promise<{
        success: boolean;
        result: import("../services").ProcessMessageResult;
    }>;
    processOrderModel(body: {
        orderModel: Record<string, unknown>;
        targetAE?: string;
    }): Promise<{
        success: boolean;
        result: import("../services").ProcessMessageResult;
    }>;
    processMessage(body: {
        sourceAE: string;
        targetAE: string;
        messageType?: string;
        protocol?: string;
        payload: unknown;
    }): Promise<{
        success: boolean;
        result: import("../services").ProcessMessageResult;
    }>;
    getTopology(): Promise<{
        applicationEntities: ApplicationEntityEntity[];
        routingTables: RoutingTableEntity[];
        mappings: StandardMappingEntity[];
        validationRules: ValidationRuleEntity[];
    }>;
    listTraces(limit?: string): Promise<import("../../../common").EventStream[]>;
    getAudit(messageId: string): Promise<import("../../../common").MessageEventAuditEntry>;
}
//# sourceMappingURL=message-flow.controller.d.ts.map