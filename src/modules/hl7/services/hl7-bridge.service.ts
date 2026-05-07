import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as net from 'net';
import { HL7ParserService } from './hl7-parser.service';

@Injectable()
export class HL7BridgeService implements OnModuleDestroy {
  private readonly logger = new Logger(HL7BridgeService.name);
  private server: net.Server;
  private clients: Map<string, net.Socket> = new Map();

  constructor(private readonly hl7Parser: HL7ParserService) {
    if (process.env.ENABLE_HL7_LISTENER === 'true') {
      this.initializeServer();
    }
  }

  onModuleDestroy() {
    for (const client of this.clients.values()) {
      client.destroy();
    }
    this.clients.clear();

    if (this.server?.listening) {
      this.server.close();
    }
  }

  private initializeServer() {
    const listenerPort = Number(process.env.SWITCH_HL7_LISTENER_PORT || 2575);

    this.server = net.createServer((socket) => {
      const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
      this.logger.log(`HL7 client connected: ${clientId}`);
      this.clients.set(clientId, socket);

      socket.on('data', (data) => {
        this.handleIncomingMessage(clientId, data);
      });

      socket.on('close', () => {
        this.logger.log(`HL7 client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      socket.on('error', (err) => {
        this.logger.error(`HL7 client error: ${clientId}`, err);
      });
    });

    this.server.listen(listenerPort, () => {
      this.logger.log(`HL7 MLLP server listening on port ${listenerPort}`);
    });
  }

  private handleIncomingMessage(clientId: string, data: any) {
    try {
      const message = data.toString();
      this.logger.log(`Received HL7 message from ${clientId}: ${message.substring(0, 100)}...`);

      // Parse HL7 message
      const parsed = this.hl7Parser.parseMessage(message);
      this.logger.log(`Parsed HL7 message: ${JSON.stringify(parsed, null, 2)}`);

      // Send ACK
      const ack = this.createACK(parsed.segments.find(s => s.id === 'MSH')?.fields[9] || 'UNKNOWN');
      this.sendToClient(clientId, ack);

    } catch (error) {
      this.logger.error(`Error handling HL7 message: ${error.message}`);
    }
  }

  private createACK(messageId: string): string {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
    return `MSH|^~\\&|RECEIVING_APP|RECEIVING_FACILITY|SENDING_APP|SENDING_FACILITY|${timestamp}||ACK|${messageId}|P|2.5
MSA|AA|${messageId}`;
  }

  async sendMessage(host: string, port: number, message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();

      client.connect(port, host, () => {
        this.logger.log(`Connected to HL7 server at ${host}:${port}`);
        client.write(message);
      });

      client.on('data', (data) => {
        this.logger.log(`Received response: ${data.toString()}`);
        client.end();
        resolve();
      });

      client.on('error', (err) => {
        this.logger.error(`Connection error: ${err.message}`);
        reject(err);
      });

      client.on('close', () => {
        this.logger.log('Connection closed');
      });
    });
  }

  async pingAE(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const client = new net.Socket();
      const timeout = setTimeout(() => {
        client.destroy();
        resolve(false);
      }, 5000);

      client.connect(port, host, () => {
        clearTimeout(timeout);
        client.end();
        resolve(true);
      });

      client.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  async echoMessage(host: string, port: number, message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();

      client.connect(port, host, () => {
        client.write(message);
      });

      client.on('data', (data) => {
        const response = data.toString();
        client.end();
        resolve(response);
      });

      client.on('error', (err) => {
        reject(err);
      });
    });
  }

  private sendToClient(clientId: string, message: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.write(message);
    }
  }

  getConnectedClients(): string[] {
    return Array.from(this.clients.keys());
  }

  disconnectClient(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.end();
      this.clients.delete(clientId);
    }
  }
}
