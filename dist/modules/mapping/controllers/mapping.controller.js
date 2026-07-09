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
exports.MappingController = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("../services");
let MappingController = class MappingController {
    constructor(mappingService) {
        this.mappingService = mappingService;
    }
    async createMapping(mapping) {
        return this.mappingService.createMapping(mapping);
    }
    async getMapping(id) {
        return this.mappingService.getMapping(id);
    }
    async updateMapping(id, updates) {
        return this.mappingService.updateMapping(id, updates);
    }
    async listMappings(sourceProtocol, targetProtocol, active) {
        return this.mappingService.listMappings({
            sourceProtocol,
            targetProtocol,
            active,
        });
    }
    async mapMessage(mappingId, data) {
        const mapping = await this.mappingService.getMapping(mappingId);
        if (!mapping) {
            return { success: false, errors: ['Mapping not found'] };
        }
        return this.mappingService.mapMessage(data.message, mapping, data.context);
    }
};
exports.MappingController = MappingController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MappingController.prototype, "createMapping", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MappingController.prototype, "getMapping", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MappingController.prototype, "updateMapping", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('sourceProtocol')),
    __param(1, (0, common_1.Query)('targetProtocol')),
    __param(2, (0, common_1.Query)('active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean]),
    __metadata("design:returntype", Promise)
], MappingController.prototype, "listMappings", null);
__decorate([
    (0, common_1.Post)(':id/map'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MappingController.prototype, "mapMessage", null);
exports.MappingController = MappingController = __decorate([
    (0, common_1.Controller)('v1/mappings'),
    __metadata("design:paramtypes", [services_1.MappingEngineService])
], MappingController);
//# sourceMappingURL=mapping.controller.js.map