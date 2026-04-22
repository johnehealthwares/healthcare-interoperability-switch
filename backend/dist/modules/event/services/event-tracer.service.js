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
var EventTracerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTracerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const entities_1 = require("../../core/entities");
const enums_1 = require("../../../common/enums");
let EventTracerService = EventTracerService_1 = class EventTracerService {
    constructor(eventRepository, eventStreamRepository) {
        this.eventRepository = eventRepository;
        this.eventStreamRepository = eventStreamRepository;
        this.logger = new common_1.Logger(EventTracerService_1.name);
        this.activeTraces = new Map();
    }
    startTrace(messageId, correlationId) {
        const trace = {
            messageId,
            events: [],
            status: enums_1.MessageStatus.RECEIVED,
            startTime: new Date(),
            errorCount: 0,
        };
        this.activeTraces.set(messageId, trace);
        this.logger.log(`Trace started for message: ${messageId}`);
    }
    async recordEvent(event) {
        try {
            // Save to database
            await this.eventRepository.save(event);
            // Update active trace
            const trace = this.activeTraces.get(event.messageId);
            if (trace) {
                trace.events.push(event);
                trace.status = event.status;
                if (event.errorMessage) {
                    trace.errorCount++;
                }
            }
            this.logger.debug(`Event recorded: ${event.eventType} for message ${event.messageId}`);
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Failed to record event: ${err.message}`);
        }
    }
    async getEventStream(messageId) {
        const entity = await this.eventStreamRepository.findOne({
            where: { messageId },
        });
        if (entity) {
            return {
                messageId: entity.messageId,
                events: entity.events || [],
                status: entity.status,
                startTime: entity.startTime,
                endTime: entity.endTime,
                totalDuration: entity.totalDuration,
                errorCount: entity.errorCount,
            };
        }
        return null;
    }
    async getAuditTrail(messageId) {
        const events = await this.eventRepository.find({
            where: { messageId },
            order: { sequenceNumber: 'ASC' },
        });
        if (events.length === 0) {
            return null;
        }
        const firstEvent = events[0];
        const lastEvent = events[events.length - 1];
        return {
            id: (0, uuid_1.v4)(),
            messageId,
            events: events,
            sourceAE: firstEvent.sourceAE,
            targetAE: firstEvent.targetAE || '',
            messageType: 'UNKNOWN',
            status: lastEvent.status,
            priority: '',
            createdAt: firstEvent.createdAt,
            updatedAt: lastEvent.createdAt,
            retainedUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        };
    }
    async completeTrace(messageId, finalStatus) {
        const trace = this.activeTraces.get(messageId);
        if (!trace) {
            throw new Error(`No active trace for message: ${messageId}`);
        }
        const now = new Date();
        trace.status = finalStatus;
        trace.endTime = now;
        trace.totalDuration =
            now.getTime() - trace.startTime.getTime();
        // Save to database
        const entity = this.eventStreamRepository.create({
            messageId,
            events: trace.events,
            status: finalStatus,
            startTime: trace.startTime,
            endTime: trace.endTime,
            totalDuration: trace.totalDuration,
            errorCount: trace.errorCount,
        });
        await this.eventStreamRepository.save(entity);
        this.activeTraces.delete(messageId);
        this.logger.log(`Trace completed for message ${messageId} - Duration: ${trace.totalDuration}ms`);
        return trace;
    }
    createEventMetadata(correlationId, traceId, spanId, customData) {
        return {
            correlationId,
            traceId,
            spanId,
            customMetadata: customData,
            userAgent: process.env.USER_AGENT || 'unknown',
            sourceIP: process.env.SOURCE_IP || 'localhost',
        };
    }
    async purgeOldTraces(retentionDays = 90) {
        const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
        const result = await this.eventRepository.delete({
            createdAt: {
                $lt: cutoffDate,
            },
        });
        this.logger.log(`Purged ${result.affected} old events (before ${cutoffDate})`);
        return result.affected || 0;
    }
};
exports.EventTracerService = EventTracerService;
exports.EventTracerService = EventTracerService = EventTracerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.MessageEventEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.EventStreamEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], EventTracerService);
//# sourceMappingURL=event-tracer.service.js.map