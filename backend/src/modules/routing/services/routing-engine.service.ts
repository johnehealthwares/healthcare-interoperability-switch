import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RoutingTableEntity } from '../../core/entities';
import {
  RoutingTable,
  RoutingRule,
  RouteEvaluationContext,
  RouteEvaluationResult,
} from '../../../common/models';

@Injectable()
export class RoutingEngineService {
  private readonly logger = new Logger(RoutingEngineService.name);
  private routingCache = new Map<string, RoutingTable>();

  constructor(
    @InjectRepository(RoutingTableEntity)
    private routingRepository: Repository<RoutingTableEntity>,
  ) {}

  async createRoutingTable(
    name: string,
    description?: string,
  ): Promise<RoutingTable> {
    const id = uuidv4();
    const table = this.routingRepository.create({
      id,
      name,
      description,
      routes: [],
    });
    const saved = await this.routingRepository.save(table);
    this.routingCache.set(id, saved);
    this.logger.log(`Routing table created: ${saved.id}`);
    return saved;
  }

  async getRoutingTable(id: string): Promise<RoutingTable | null> {
    let table = this.routingCache.get(id);
    if (!table) {
      const entity = await this.routingRepository.findOne({ where: { id } });
      if (entity) {
        table = entity as unknown as RoutingTable;
        this.routingCache.set(id, table);
      }
    }
    return table || null;
  }

  async addRoute(
    tableId: string,
    route: Omit<RoutingRule, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<RoutingRule> {
    const table = await this.getRoutingTable(tableId);
    if (!table) {
      throw new Error(`Routing table not found: ${tableId}`);
    }

    const newRoute: RoutingRule = {
      id: uuidv4(),
      ...route,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!table.routes) {
      table.routes = [];
    }

    table.routes.push(newRoute);
    table.routes.sort((a: any, b: any) => a.priority - b.priority);

    await this.routingRepository.update(tableId, { routes: table.routes as any });
    this.routingCache.delete(tableId);
    this.logger.log(
      `Route added to table ${tableId}: ${route.sourceAE} -> ${route.targetAE}`,
    );

    return newRoute;
  }

  async evaluateRoute(
    tableId: string,
    context: RouteEvaluationContext,
  ): Promise<RouteEvaluationResult> {
    const table = await this.getRoutingTable(tableId);
    if (!table) {
      return {
        matched: false,
        targetAE: '',
        metadata: { error: 'Routing table not found' },
      };
    }

    // Sort by priority and evaluate
    const sortedRoutes = [...(table.routes || [])].sort(
      (a, b) => a.priority - b.priority,
    );

    for (const route of sortedRoutes) {
      if (!route.enabled) continue;

      if (this.evaluateConditions(context.message, route.conditions)) {
        this.logger.debug(
          `Route matched: ${route.name} (${route.sourceAE} -> ${route.targetAE})`,
        );
        return {
          matched: true,
          route,
          targetAE: route.targetAE,
          mappingId: route.mappingId,
          metadata: { routeName: route.name, routeId: route.id },
        };
      }
    }

    // Try default route
    if (table.defaultRoute) {
      const defaultRoute = (table.routes || []).find(
        (r) => r.id === table.defaultRoute,
      );
      if (defaultRoute) {
        this.logger.debug(`Using default route: ${defaultRoute.name}`);
        return {
          matched: true,
          route: defaultRoute,
          targetAE: defaultRoute.targetAE,
          mappingId: defaultRoute.mappingId,
        };
      }
    }

    return {
      matched: false,
      targetAE: context.targetAE || '',
      metadata: { error: 'No matching route found' },
    };
  }

  private evaluateConditions(
    message: any,
    conditions: any[],
  ): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every((condition) =>
      this.evaluateCondition(message, condition),
    );
  }

  private evaluateCondition(message: any, condition: any): boolean {
    const { field, operator, value } = condition;
    const messageValue = this.getFieldValue(message, field);

    switch (operator) {
      case 'equals':
        return messageValue === value;
      case 'contains':
        return String(messageValue).includes(String(value));
      case 'startsWith':
        return String(messageValue).startsWith(String(value));
      case 'endsWith':
        return String(messageValue).endsWith(String(value));
      case 'regex':
        return new RegExp(value).test(String(messageValue));
      case 'in':
        return Array.isArray(value) && value.includes(messageValue);
      case 'gt':
        return Number(messageValue) > Number(value);
      case 'lt':
        return Number(messageValue) < Number(value);
      case 'gte':
        return Number(messageValue) >= Number(value);
      case 'lte':
        return Number(messageValue) <= Number(value);
      default:
        return false;
    }
  }

  private getFieldValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
