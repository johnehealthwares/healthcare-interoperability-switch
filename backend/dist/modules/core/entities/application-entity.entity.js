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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationEntityEntity = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../../../common/enums");
let ApplicationEntityEntity = class ApplicationEntityEntity {
};
exports.ApplicationEntityEntity = ApplicationEntityEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 255 }),
    __metadata("design:type", String)
], ApplicationEntityEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], ApplicationEntityEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ApplicationEntityEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 100, nullable: true }),
    __metadata("design:type", String)
], ApplicationEntityEntity.prototype, "facilityCode", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255, nullable: true }),
    __metadata("design:type", String)
], ApplicationEntityEntity.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', { enum: enums_1.AEStatus, default: enums_1.AEStatus.ACTIVE }),
    __metadata("design:type", String)
], ApplicationEntityEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array'),
    __metadata("design:type", Array)
], ApplicationEntityEntity.prototype, "inboundCapabilities", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array'),
    __metadata("design:type", Array)
], ApplicationEntityEntity.prototype, "outboundCapabilities", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: {} }),
    __metadata("design:type", Array)
], ApplicationEntityEntity.prototype, "inboundConfig", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: {} }),
    __metadata("design:type", Array)
], ApplicationEntityEntity.prototype, "outboundConfig", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], ApplicationEntityEntity.prototype, "mappings", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: {} }),
    __metadata("design:type", Object)
], ApplicationEntityEntity.prototype, "securitySettings", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], ApplicationEntityEntity.prototype, "attributes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ApplicationEntityEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ApplicationEntityEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ nullable: true }),
    __metadata("design:type", Date)
], ApplicationEntityEntity.prototype, "deletedAt", void 0);
exports.ApplicationEntityEntity = ApplicationEntityEntity = __decorate([
    (0, typeorm_1.Entity)('application_entities'),
    (0, typeorm_1.Index)(['facilityCode', 'name'], { unique: true })
], ApplicationEntityEntity);
//# sourceMappingURL=application-entity.entity.js.map