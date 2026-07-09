import { RoutingEngineService } from '../services';
import { RoutingRule, RouteEvaluationContext } from '../../../common/models';
export declare class RoutingController {
    private routingService;
    constructor(routingService: RoutingEngineService);
    createRoutingTable(data: {
        name: string;
        description?: string;
    }): Promise<import("../../../common").RoutingTable>;
    getRoutingTable(id: string): Promise<import("../../../common").RoutingTable>;
    addRoute(tableId: string, route: Omit<RoutingRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoutingRule>;
    getRoutes(tableId: string): Promise<RoutingRule[]>;
    evaluateRoute(tableId: string, context: RouteEvaluationContext): Promise<import("../../../common").RouteEvaluationResult>;
}
//# sourceMappingURL=routing.controller.d.ts.map