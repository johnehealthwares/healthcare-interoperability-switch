import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageFlowService } from '../services/message-flow.service';
import { ApplicationEntityEntity } from '../../core/entities/application-entity.entity';
import { RoutingTableEntity } from '../../core/entities/routing-table.entity';
import { StandardMappingEntity } from '../../core/entities/standard-mapping.entity';
import { ValidationRuleEntity } from '../../core/entities/validation-rule.entity';

@Controller('v1/flow')
export class MessageFlowController {
  constructor(
    private readonly flowService: MessageFlowService,
    @InjectRepository(ApplicationEntityEntity)
    private readonly aeRepository: Repository<ApplicationEntityEntity>,
    @InjectRepository(RoutingTableEntity)
    private readonly routingRepository: Repository<RoutingTableEntity>,
    @InjectRepository(StandardMappingEntity)
    private readonly mappingRepository: Repository<StandardMappingEntity>,
    @InjectRepository(ValidationRuleEntity)
    private readonly validationRepository: Repository<ValidationRuleEntity>,
  ) {}

  @Post('healthstack/order')
  async processOrder(@Body() body: { hl7Message: string; targetAE?: string }) {
    const payload = body.targetAE
      ? `${body.hl7Message}\rZRT|${body.targetAE}`
      : body.hl7Message;
    const result = await this.flowService.processHealthstackOrder(payload);
    return { success: true, result };
  }

  @Post('healthstack/order-fhir')
  async processOrderFhir(
    @Body() body: { resource: Record<string, unknown>; targetAE?: string },
  ) {
    const result = await this.flowService.processHealthstackOrderFhir(
      {
        ...(body.resource as Record<string, any>),
        ...(body.targetAE ? { targetAE: body.targetAE } : {}),
      },
    );
    return { success: true, result };
  }

  @Post('healthstack/patient')
  async processPatient(
    @Body() body: { hl7Message?: string; resource?: Record<string, unknown> },
  ) {
    const payload = body.hl7Message ?? body.resource;
    const result = await this.flowService.processHealthstackPatient(
      payload as string | Record<string, any>,
    );
    return { success: true, result };
  }

  @Post('healthstack/order-model')
  async processOrderModel(
    @Body() body: { orderModel: Record<string, unknown>; targetAE?: string },
  ) {
    const result = await this.flowService.processHealthstackOrderModel(
      {
        ...(body.orderModel as Record<string, any>),
        ...(body.targetAE ? { targetAE: body.targetAE } : {}),
      },
    );
    return { success: true, result };
  }

  @Post('messages')
  async processMessage(
    @Body()
    body: {
      sourceAE: string;
      targetAE: string;
      messageType?: string;
      protocol?: string;
      payload: unknown;
    },
  ) {
    const result = await this.flowService.processMessage({
      sourceAE: body.sourceAE,
      targetAE: body.targetAE,
      messageType: body.messageType as any,
      protocol: body.protocol as any,
      payload: body.payload,
    });
    return { success: true, result };
  }

  @Get('topology')
  async getTopology() {
    const applicationEntities = await this.aeRepository.find();
    const routingTables = await this.routingRepository.find();
    const mappings = await this.mappingRepository.find();
    const validationRules = await this.validationRepository.find();
    return { applicationEntities, routingTables, mappings, validationRules };
  }

  @Get('traces')
  async listTraces(@Query('limit') limit = '20') {
    return this.flowService.listRecentTraces(Number(limit));
  }

  @Get('audit/:messageId')
  async getAudit(@Param('messageId') messageId: string) {
    return this.flowService.getAuditForMessage(messageId);
  }
}
