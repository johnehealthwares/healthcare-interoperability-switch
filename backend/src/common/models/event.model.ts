import { EventType, MessageStatus } from '../enums';

export interface EventSnapshot {
  [key: string]: any;
}

export interface EventMetadata {
  correlationId: string;
  traceId: string;
  spanId: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  sourceIP?: string;
  customMetadata?: Record<string, any>;
}

export interface MessageEvent {
  id: string;
  eventType: EventType;
  messageId: string;
  timestamp: Date;
  sequenceNumber: number;
  sourceAE: string;
  targetAE?: string;
  status: MessageStatus;
  metadata: EventMetadata;
  snapshot: EventSnapshot;
  duration?: number; // milliseconds
  errorMessage?: string;
  stackTrace?: string;
  createdAt: Date;
}

export interface EventStream {
  messageId: string;
  events: MessageEvent[];
  status: MessageStatus;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  errorCount: number;
}

export interface MessageEventAuditEntry {
  id: string;
  messageId: string;
  events: MessageEvent[];
  sourceAE: string;
  targetAE: string;
  messageType: string;
  status: MessageStatus;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  retainedUntil?: Date;
}

export interface EventTracer {
  startTrace(messageId: string, correlationId: string): void;
  recordEvent(event: MessageEvent): Promise<void>;
  getEventStream(messageId: string): Promise<EventStream>;
  getAuditTrail(messageId: string): Promise<MessageEventAuditEntry>;
}
