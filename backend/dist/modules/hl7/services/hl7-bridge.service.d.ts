import { OnModuleDestroy } from '@nestjs/common';
import { HL7ParserService } from './hl7-parser.service';
export declare class HL7BridgeService implements OnModuleDestroy {
    private readonly hl7Parser;
    private readonly logger;
    private server;
    private clients;
    constructor(hl7Parser: HL7ParserService);
    onModuleDestroy(): void;
    private initializeServer;
    private handleIncomingMessage;
    private createACK;
    sendMessage(host: string, port: number, message: string): Promise<void>;
    pingAE(host: string, port: number): Promise<boolean>;
    echoMessage(host: string, port: number, message: string): Promise<string>;
    private sendToClient;
    getConnectedClients(): string[];
    disconnectClient(clientId: string): void;
}
//# sourceMappingURL=hl7-bridge.service.d.ts.map