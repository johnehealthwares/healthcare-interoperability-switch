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
exports.AEController = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("../services");
const enums_1 = require("../../../common/enums");
let AEController = class AEController {
    constructor(aeService) {
        this.aeService = aeService;
    }
    async registerAE(contract) {
        if (!contract.name) {
            throw new common_1.BadRequestException('AE name is required');
        }
        if (!contract.inboundCapabilities?.length && !contract.outboundCapabilities?.length) {
            throw new common_1.BadRequestException('At least one inbound or outbound capability is required');
        }
        return this.aeService.registerAE(contract);
    }
    async getStatistics() {
        return this.aeService.getAEStatistics();
    }
    async getAE(id) {
        const ae = await this.aeService.getAE(id);
        if (!ae) {
            throw new common_1.NotFoundException(`AE with id ${id} not found`);
        }
        return ae;
    }
    async getAEByName(name) {
        const ae = await this.aeService.getAEByName(name);
        if (!ae) {
            throw new common_1.NotFoundException(`AE with name ${name} not found`);
        }
        return ae;
    }
    async listAEs(query, page, limit) {
        const { page: _, limit: __, ...filters } = query;
        return this.aeService.listAEs({ filters, page, limit });
    }
    async updateAE(id, updates) {
        const ae = await this.aeService.getAE(id);
        if (!ae) {
            throw new common_1.NotFoundException(`AE with id ${id} not found`);
        }
        return this.aeService.updateAE(id, updates);
    }
    async deleteAE(id) {
        const ae = await this.aeService.getAE(id);
        if (!ae) {
            throw new common_1.NotFoundException(`AE with id ${id} not found`);
        }
        await this.aeService.deleteAE(id);
    }
    async deactivateAE(id) {
        const ae = await this.aeService.getAE(id);
        if (!ae) {
            throw new common_1.NotFoundException(`AE with id ${id} not found`);
        }
        await this.aeService.deactivateAE(id);
        return { message: 'AE deactivated successfully', id };
    }
    async activateAE(id) {
        const ae = await this.aeService.getAE(id);
        if (!ae) {
            throw new common_1.NotFoundException(`AE with id ${id} not found`);
        }
        return this.aeService.updateAE(id, { status: enums_1.AEStatus.ACTIVE });
    }
    async testConnectivity(id) {
        const ae = await this.aeService.getAE(id);
        if (!ae) {
            throw new common_1.NotFoundException(`AE with id ${id} not found`);
        }
        return this.aeService.testAEConnectivity(id);
    }
    async getInboundByProtocol(protocol) {
        return this.aeService.getAEsByProtocol(protocol, 'inbound');
    }
    async getOutboundByProtocol(protocol) {
        return this.aeService.getAEsByProtocol(protocol, 'outbound');
    }
    async validateAccess(id, protocol, direction) {
        if (!['inbound', 'outbound'].includes(direction)) {
            throw new common_1.BadRequestException('Direction must be inbound or outbound');
        }
        const isValid = await this.aeService.validateAEAccess(id, protocol, direction);
        return { id, protocol, direction, isValid };
    }
};
exports.AEController = AEController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AEController.prototype, "registerAE", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AEController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AEController.prototype, "getAE", null);
__decorate([
    (0, common_1.Get)('by-name/:name'),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AEController.prototype, "getAEByName", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], AEController.prototype, "listAEs", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AEController.prototype, "updateAE", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AEController.prototype, "deleteAE", null);
__decorate([
    (0, common_1.Put)(':id/deactivate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AEController.prototype, "deactivateAE", null);
__decorate([
    (0, common_1.Put)(':id/activate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AEController.prototype, "activateAE", null);
__decorate([
    (0, common_1.Get)(':id/connectivity'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AEController.prototype, "testConnectivity", null);
__decorate([
    (0, common_1.Get)('protocol/:protocol/inbound'),
    __param(0, (0, common_1.Param)('protocol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AEController.prototype, "getInboundByProtocol", null);
__decorate([
    (0, common_1.Get)('protocol/:protocol/outbound'),
    __param(0, (0, common_1.Param)('protocol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AEController.prototype, "getOutboundByProtocol", null);
__decorate([
    (0, common_1.Post)(':id/validate-access'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('protocol')),
    __param(2, (0, common_1.Body)('direction')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AEController.prototype, "validateAccess", null);
exports.AEController = AEController = __decorate([
    (0, common_1.Controller)('v1/aes'),
    __metadata("design:paramtypes", [services_1.AERegistryService])
], AEController);
//# sourceMappingURL=ae.controller.js.map