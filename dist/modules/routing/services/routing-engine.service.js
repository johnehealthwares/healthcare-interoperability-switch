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
var RoutingEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingEngineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const entities_1 = require("../../core/entities");
const path_util_1 = require("../../../common/utils/path.util");
let RoutingEngineService = RoutingEngineService_1 = class RoutingEngineService {
    constructor(routingRepository) {
        this.routingRepository = routingRepository;
        this.logger = new common_1.Logger(RoutingEngineService_1.name);
        this.routingCache = new Map();
    }
    async createRoutingTable(name, description) {
        const id = (0, crypto_1.randomUUID)();
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
    async getRoutingTable(id) {
        let table = this.routingCache.get(id);
        if (!table) {
            const entity = await this.routingRepository.findOne({ where: { id } });
            if (entity) {
                table = entity;
                this.routingCache.set(id, table);
            }
        }
        return table || null;
    }
    async getRoutingTableByName(name) {
        const entity = await this.routingRepository.findOne({ where: { name } });
        return entity;
    }
    async addRoute(tableId, route) {
        const table = await this.getRoutingTable(tableId);
        if (!table) {
            throw new Error(`Routing table not found: ${tableId}`);
        }
        const newRoute = {
            id: (0, crypto_1.randomUUID)(),
            ...route,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        if (!table.routes) {
            table.routes = [];
        }
        table.routes.push(newRoute);
        table.routes.sort((a, b) => a.priority - b.priority);
        await this.routingRepository.update(tableId, { routes: table.routes });
        this.routingCache.delete(tableId);
        this.logger.log(`Route added to table ${tableId}: ${route.sourceAE} -> ${route.targetAE}`);
        return newRoute;
    }
    async evaluateRoute(tableId, context) {
        const table = await this.getRoutingTable(tableId);
        if (!table) {
            return {
                matched: false,
                targetAE: '',
                metadata: { error: 'Routing table not found' },
            };
        }
        // Sort by priority and evaluate
        const sortedRoutes = [...(table.routes || [])].sort((a, b) => a.priority - b.priority);
        for (const route of sortedRoutes) {
            if (!route.enabled)
                continue;
            if (route.sourceAE && route.sourceAE !== context.sourceAE)
                continue;
            if (context.targetAE && route.targetAE !== context.targetAE)
                continue;
            if (route.messageType && route.messageType !== context.metadata?.messageType) {
                continue;
            }
            if (this.evaluateConditions(context.message, route.conditions)) {
                this.logger.debug(`Route matched: ${route.name} (${route.sourceAE} -> ${route.targetAE})`);
                return {
                    matched: true,
                    route,
                    targetAE: route.targetAE,
                    applicationId: route.applicationId,
                    applicationName: route.applicationName,
                    mappingId: route.mappingId,
                    metadata: {
                        routeName: route.name,
                        routeId: route.id,
                        applicationId: route.applicationId,
                        applicationName: route.applicationName,
                    },
                };
            }
        }
        // Try default route
        if (table.defaultRoute) {
            const defaultRoute = (table.routes || []).find((r) => r.id === table.defaultRoute);
            if (defaultRoute) {
                this.logger.debug(`Using default route: ${defaultRoute.name}`);
                return {
                    matched: true,
                    route: defaultRoute,
                    targetAE: defaultRoute.targetAE,
                    applicationId: defaultRoute.applicationId,
                    applicationName: defaultRoute.applicationName,
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
    evaluateConditions(message, conditions) {
        if (!conditions || conditions.length === 0)
            return true;
        return conditions.every((condition) => this.evaluateCondition(message, condition));
    }
    evaluateCondition(message, condition) {
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
    getFieldValue(obj, path) {
        return (0, path_util_1.getValueByPath)(obj, path);
    }
};
exports.RoutingEngineService = RoutingEngineService;
exports.RoutingEngineService = RoutingEngineService = RoutingEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.RoutingTableEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RoutingEngineService);
//# sourceMappingURL=routing-engine.service.js.map