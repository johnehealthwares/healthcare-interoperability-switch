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
exports.RoutingController = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("../services");
let RoutingController = class RoutingController {
    constructor(routingService) {
        this.routingService = routingService;
    }
    async createRoutingTable(data) {
        return this.routingService.createRoutingTable(data.name, data.description);
    }
    async getRoutingTable(id) {
        return this.routingService.getRoutingTable(id);
    }
    async addRoute(tableId, route) {
        return this.routingService.addRoute(tableId, route);
    }
    async evaluateRoute(tableId, context) {
        return this.routingService.evaluateRoute(tableId, context);
    }
};
exports.RoutingController = RoutingController;
__decorate([
    (0, common_1.Post)('tables'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoutingController.prototype, "createRoutingTable", null);
__decorate([
    (0, common_1.Get)('tables/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoutingController.prototype, "getRoutingTable", null);
__decorate([
    (0, common_1.Post)('tables/:id/routes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoutingController.prototype, "addRoute", null);
__decorate([
    (0, common_1.Post)('tables/:id/evaluate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoutingController.prototype, "evaluateRoute", null);
exports.RoutingController = RoutingController = __decorate([
    (0, common_1.Controller)('api/v1/routing'),
    __metadata("design:paramtypes", [services_1.RoutingEngineService])
], RoutingController);
//# sourceMappingURL=routing.controller.js.map