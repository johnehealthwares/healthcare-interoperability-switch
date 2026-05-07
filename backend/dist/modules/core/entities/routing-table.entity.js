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
exports.RoutingTableEntity = void 0;
const typeorm_1 = require("typeorm");
let RoutingTableEntity = class RoutingTableEntity {
};
exports.RoutingTableEntity = RoutingTableEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 255 }),
    __metadata("design:type", String)
], RoutingTableEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], RoutingTableEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], RoutingTableEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Array)
], RoutingTableEntity.prototype, "routes", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255, nullable: true }),
    __metadata("design:type", String)
], RoutingTableEntity.prototype, "defaultRoute", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RoutingTableEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RoutingTableEntity.prototype, "updatedAt", void 0);
exports.RoutingTableEntity = RoutingTableEntity = __decorate([
    (0, typeorm_1.Entity)('routing_tables'),
    (0, typeorm_1.Index)(['name'], { unique: true })
], RoutingTableEntity);
//# sourceMappingURL=routing-table.entity.js.map