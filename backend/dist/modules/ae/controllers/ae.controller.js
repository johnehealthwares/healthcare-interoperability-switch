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
        return this.aeService.registerAE(contract);
    }
    async getAE(id) {
        return this.aeService.getAE(id);
    }
    async getAEByName(name) {
        return this.aeService.getAEByName(name);
    }
    async listAEs(status, protocol) {
        return this.aeService.listAEs({ status, protocol });
    }
    async updateAE(id, updates) {
        return this.aeService.updateAE(id, updates);
    }
    async deleteAE(id) {
        await this.aeService.deleteAE(id);
        return { message: 'AE deleted successfully' };
    }
    async deactivateAE(id) {
        await this.aeService.deactivateAE(id);
        return { message: 'AE deactivated successfully' };
    }
};
exports.AEController = AEController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AEController.prototype, "registerAE", null);
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
    __param(0, (0, common_1.Param)('status')),
    __param(1, (0, common_1.Param)('protocol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
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
exports.AEController = AEController = __decorate([
    (0, common_1.Controller)('api/v1/aes'),
    __metadata("design:paramtypes", [services_1.AERegistryService])
], AEController);
//# sourceMappingURL=ae.controller.js.map