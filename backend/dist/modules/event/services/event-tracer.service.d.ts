import { Repository } from 'typeorm';
import { MessageEventEntity, EventStreamEntity } from '../../core/entities';
import { MessageEvent, EventStream, EventTracer, MessageEventAuditEntry, EventMetadata } from '../../../common/models';
import { MessageStatus } from '../../../common/enums';
export declare class EventTracerService implements EventTracer {
    private eventRepository;
    private eventStreamRepository;
    private readonly logger;
    private activeTraces;
    constructor(eventRepository: Repository<MessageEventEntity>, eventStreamRepository: Repository<EventStreamEntity>);
    startTrace(messageId: string, correlationId: string): void;
    recordEvent(event: MessageEvent): Promise<void>;
    getEventStream(messageId: string): Promise<EventStream | null>;
    getAuditTrail(messageId: string): Promise<MessageEventAuditEntry | null>;
    completeTrace(messageId: string, finalStatus: MessageStatus): Promise<EventStream>;
    createEventMetadata(correlationId: string, traceId: string, spanId: string, customData?: Record<string, any>): EventMetadata;
    purgeOldTraces(retentionDays?: number): Promise<number>;
}
//# sourceMappingURL=event-tracer.service.d.ts.map