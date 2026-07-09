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
exports.EventStreamEntity = exports.MessageEventEntity = void 0;
const typeorm_1 = require("typeorm");
let MessageEventEntity = class MessageEventEntity {
};
exports.MessageEventEntity = MessageEventEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 255 }),
    __metadata("design:type", String)
], MessageEventEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], MessageEventEntity.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], MessageEventEntity.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], MessageEventEntity.prototype, "correlationId", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime'),
    __metadata("design:type", Date)
], MessageEventEntity.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], MessageEventEntity.prototype, "sequenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], MessageEventEntity.prototype, "sourceAE", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255, nullable: true }),
    __metadata("design:type", String)
], MessageEventEntity.prototype, "targetAE", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    __metadata("design:type", String)
], MessageEventEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], MessageEventEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], MessageEventEntity.prototype, "snapshot", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Number)
], MessageEventEntity.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], MessageEventEntity.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], MessageEventEntity.prototype, "stackTrace", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MessageEventEntity.prototype, "createdAt", void 0);
exports.MessageEventEntity = MessageEventEntity = __decorate([
    (0, typeorm_1.Entity)('message_events'),
    (0, typeorm_1.Index)(['messageId', 'timestamp']),
    (0, typeorm_1.Index)(['correlationId']),
    (0, typeorm_1.Index)(['sourceAE'])
], MessageEventEntity);
let EventStreamEntity = class EventStreamEntity {
};
exports.EventStreamEntity = EventStreamEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 255 }),
    __metadata("design:type", String)
], EventStreamEntity.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Array)
], EventStreamEntity.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    __metadata("design:type", String)
], EventStreamEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime'),
    __metadata("design:type", Date)
], EventStreamEntity.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', { nullable: true }),
    __metadata("design:type", Date)
], EventStreamEntity.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Number)
], EventStreamEntity.prototype, "totalDuration", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { default: 0 }),
    __metadata("design:type", Number)
], EventStreamEntity.prototype, "errorCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EventStreamEntity.prototype, "createdAt", void 0);
exports.EventStreamEntity = EventStreamEntity = __decorate([
    (0, typeorm_1.Entity)('event_streams'),
    (0, typeorm_1.Index)(['messageId'])
], EventStreamEntity);
//# sourceMappingURL=event.entity.js.map