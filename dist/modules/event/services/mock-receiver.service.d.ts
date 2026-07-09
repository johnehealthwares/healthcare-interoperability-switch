import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { HL7ParserService } from '../../hl7/services/hl7-parser.service';
export interface MockReceiverSnapshot {
    hl7Messages: string[];
    fhirResources: any[];
    customPayloads: any[];
}
export declare class MockReceiverService implements OnModuleInit, OnModuleDestroy {
    private readonly hl7Parser;
    private readonly logger;
    private hl7Server?;
    private fhirServer?;
    private customServer?;
    private readyPromise?;
    lastHl7Message?: string;
    lastFhirResource?: any;
    lastCustomPayload?: any;
    readonly hl7Messages: string[];
    readonly fhirResources: any[];
    readonly customPayloads: any[];
    constructor(hl7Parser: HL7ParserService);
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    waitUntilReady(): Promise<void>;
    reset(): void;
    snapshot(): MockReceiverSnapshot;
    private startAll;
    private startHl7Receiver;
    private startFhirReceiver;
    private startCustomReceiver;
    private buildAck;
    private getPort;
    private listenServer;
    private closeServer;
    private readJson;
}
//# sourceMappingURL=mock-receiver.service.d.ts.map