import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as http from 'http';
import * as net from 'net';
import { HL7ParserService } from '../../hl7/services/hl7-parser.service';

export interface MockReceiverSnapshot {
  hl7Messages: string[];
  fhirResources: any[];
  customPayloads: any[];
}

@Injectable()
export class MockReceiverService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MockReceiverService.name);
  private hl7Server?: net.Server;
  private fhirServer?: http.Server;
  private customServer?: http.Server;
  private readyPromise?: Promise<void>;

  public lastHl7Message?: string;
  public lastFhirResource?: any;
  public lastCustomPayload?: any;
  public readonly hl7Messages: string[] = [];
  public readonly fhirResources: any[] = [];
  public readonly customPayloads: any[] = [];

  constructor(private readonly hl7Parser: HL7ParserService) {}

  onModuleInit() {
    this.readyPromise = this.startAll();
  }

  async onModuleDestroy() {
    await Promise.all([
      this.closeServer(this.hl7Server),
      this.closeServer(this.fhirServer),
      this.closeServer(this.customServer),
    ]);
  }

  async waitUntilReady(): Promise<void> {
    await this.readyPromise;
  }

  reset(): void {
    this.lastHl7Message = undefined;
    this.lastFhirResource = undefined;
    this.lastCustomPayload = undefined;
    this.hl7Messages.length = 0;
    this.fhirResources.length = 0;
    this.customPayloads.length = 0;
  }

  snapshot(): MockReceiverSnapshot {
    return {
      hl7Messages: [...this.hl7Messages],
      fhirResources: [...this.fhirResources],
      customPayloads: [...this.customPayloads],
    };
  }

  private async startAll(): Promise<void> {
    const hl7Port = this.getPort('MOCK_DCM4CHEE_HL7_PORT', 18080);
    const fhirPort = this.getPort('MOCK_OPENELIS_FHIR_PORT', 18081);
    const customPort = this.getPort('MOCK_CUSTOM_JSON_PORT', 18082);

    await Promise.all([
      this.startHl7Receiver(hl7Port),
      this.startFhirReceiver(fhirPort),
      this.startCustomReceiver(customPort),
    ]);
  }

  private async startHl7Receiver(port: number): Promise<void> {
    this.hl7Server = net.createServer((socket) => {
      const remote = `${socket.remoteAddress}:${socket.remotePort}`;
      this.logger.log(`Mock DCM4CHEE HL7 receiver connected: ${remote}`);

      socket.on('data', (data) => {
        const message = data.toString();
        this.lastHl7Message = message;
        this.hl7Messages.push(message);
        this.logger.log(
          `Mock DCM4CHEE received HL7 payload (${remote}): ${message.substring(0, 200)}`,
        );

        let ack = this.buildAck('MSGID');

        try {
          const parsed = this.hl7Parser.parseMessage(message);
          const messageControlId =
            parsed.segments.find((segment) => segment.id === 'MSH')?.fields[8] ||
            'MSGID';
          ack = this.buildAck(messageControlId);
        } catch {
          // The mock receiver should still acknowledge the message even if parsing fails.
        }

        socket.write(ack);
        socket.end();
      });

      socket.on('error', (error) => {
        this.logger.error(`Mock DCM4CHEE HL7 socket error: ${error.message}`);
      });
    });

    await this.listenServer(this.hl7Server, port);
    this.logger.log(`Mock DCM4CHEE HL7 receiver listening on port ${port}`);
  }

  private async startFhirReceiver(port: number): Promise<void> {
    this.fhirServer = http.createServer((req, res) => {
      const path = req.url?.split('?')[0] ?? '/';

      if (req.method === 'GET' && path === '/metadata') {
        res.writeHead(200, { 'Content-Type': 'application/fhir+json' });
        res.end(
          JSON.stringify({
            resourceType: 'CapabilityStatement',
            status: 'active',
          }),
        );
        return;
      }

      if (req.method === 'POST' && path === '/') {
        this.readJson(req)
          .then((body) => {
            this.lastFhirResource = body;
            this.fhirResources.push(body);
            this.logger.log(
              `Mock OpenELIS received FHIR payload: ${JSON.stringify(body).substring(0, 300)}`,
            );
            res.writeHead(201, { 'Content-Type': 'application/fhir+json' });
            res.end(
              JSON.stringify({
                resourceType: 'OperationOutcome',
                issue: [
                  {
                    severity: 'information',
                    code: 'informational',
                    diagnostics: 'Received by mock OpenELIS',
                  },
                ],
              }),
            );
          })
          .catch((error) => {
            res.statusCode = 400;
            res.end(String(error));
          });
        return;
      }

      res.statusCode = 404;
      res.end('Not found');
    });

    await this.listenServer(this.fhirServer, port);
    this.logger.log(`Mock OpenELIS FHIR receiver listening on port ${port}`);
  }

  private async startCustomReceiver(port: number): Promise<void> {
    this.customServer = http.createServer((req, res) => {
      if (req.method === 'POST' && req.url === '/') {
        this.readJson(req)
          .then((body) => {
            this.lastCustomPayload = body;
            this.customPayloads.push(body);
            this.logger.log(
              `Mock custom receiver received payload: ${JSON.stringify(body).substring(0, 300)}`,
            );
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                status: 'accepted',
                receivedAt: new Date().toISOString(),
              }),
            );
          })
          .catch((error) => {
            res.statusCode = 400;
            res.end(String(error));
          });
        return;
      }

      res.statusCode = 404;
      res.end('Not found');
    });

    const live = await this.listenServer(this.customServer, port);
    console.log({live, port}, this.customServer)
    this.logger.log(`Mock custom receiver listening on port ${port} live=${this.customServer.listening}`);
  }

  private buildAck(messageControlId: string): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+/, '');

    return [
      `MSH|^~\\&|MOCK|MOCKFAC|SWITCH|SWITCHFAC|${timestamp}||ACK|${messageControlId}|P|2.5`,
      `MSA|AA|${messageControlId}`,
    ].join('\r');
  }

  private getPort(name: string, fallback: number): number {
    return Number(process.env[name] || fallback);
  }

  private listenServer(server: net.Server | http.Server, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', () => {
        server.off('error', reject);
        resolve();
      });
    });
  }

  private closeServer(server?: net.Server | http.Server): Promise<void> {
    if (!server || !server.listening) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  private readJson(req: http.IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(body || '{}'));
        } catch (error) {
          reject(error);
        }
      });
      req.on('error', reject);
    });
  }
}
