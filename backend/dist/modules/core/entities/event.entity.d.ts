export declare class MessageEventEntity {
    id: string;
    eventType: string;
    messageId: string;
    correlationId: string;
    timestamp: Date;
    sequenceNumber: number;
    sourceAE: string;
    targetAE?: string;
    status: string;
    metadata: any;
    snapshot: any;
    duration?: number;
    errorMessage?: string;
    stackTrace?: string;
    createdAt: Date;
}
export declare class EventStreamEntity {
    messageId: string;
    events: any[];
    status: string;
    startTime: Date;
    endTime?: Date;
    totalDuration?: number;
    errorCount: number;
    createdAt: Date;
}
//# sourceMappingURL=event.entity.d.ts.map