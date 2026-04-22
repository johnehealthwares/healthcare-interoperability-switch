import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { RoutingEngineService } from '../services';
import { RoutingRule, RouteEvaluationContext } from '../../../common/models';

@Controller('api/v1/routing')
export class RoutingController {
  constructor(private routingService: RoutingEngineService) {}

  @Post('tables')
  async createRoutingTable(
    @Body() data: { name: string; description?: string },
  ) {
    return this.routingService.createRoutingTable(data.name, data.description);
  }

  @Get('tables/:id')
  async getRoutingTable(@Param('id') id: string) {
    return this.routingService.getRoutingTable(id);
  }

  @Post('tables/:id/routes')
  async addRoute(
    @Param('id') tableId: string,
    @Body() route: Omit<RoutingRule, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    return this.routingService.addRoute(tableId, route);
  }

  @Post('tables/:id/evaluate')
  async evaluateRoute(
    @Param('id') tableId: string,
    @Body() context: RouteEvaluationContext,
  ) {
    return this.routingService.evaluateRoute(tableId, context);
  }
}
