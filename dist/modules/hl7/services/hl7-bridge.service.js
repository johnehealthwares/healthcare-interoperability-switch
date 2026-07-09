"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HL7BridgeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HL7BridgeService = void 0;
const common_1 = require("@nestjs/common");
const net = __importStar(require("net"));
const hl7_parser_service_1 = require("./hl7-parser.service");
let HL7BridgeService = HL7BridgeService_1 = class HL7BridgeService {
    constructor(hl7Parser) {
        this.hl7Parser = hl7Parser;
        this.logger = new common_1.Logger(HL7BridgeService_1.name);
        this.clients = new Map();
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
    initializeServer() {
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
    handleIncomingMessage(clientId, data) {
        try {
            const message = data.toString();
            this.logger.log(`Received HL7 message from ${clientId}: ${message.substring(0, 100)}...`);
            // Parse HL7 message
            const parsed = this.hl7Parser.parseMessage(message);
            this.logger.log(`Parsed HL7 message: ${JSON.stringify(parsed, null, 2)}`);
            // Send ACK
            const ack = this.createACK(parsed.segments.find(s => s.id === 'MSH')?.fields[9] || 'UNKNOWN');
            this.sendToClient(clientId, ack);
        }
        catch (error) {
            this.logger.error(`Error handling HL7 message: ${error.message}`);
        }
    }
    createACK(messageId) {
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
        return `MSH|^~\\&|RECEIVING_APP|RECEIVING_FACILITY|SENDING_APP|SENDING_FACILITY|${timestamp}||ACK|${messageId}|P|2.5
MSA|AA|${messageId}`;
    }
    async sendMessage(host, port, message) {
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
    async pingAE(host, port) {
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
    async echoMessage(host, port, message) {
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
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client) {
            client.write(message);
        }
    }
    getConnectedClients() {
        return Array.from(this.clients.keys());
    }
    disconnectClient(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            client.end();
            this.clients.delete(clientId);
        }
    }
};
exports.HL7BridgeService = HL7BridgeService;
exports.HL7BridgeService = HL7BridgeService = HL7BridgeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hl7_parser_service_1.HL7ParserService])
], HL7BridgeService);
//# sourceMappingURL=hl7-bridge.service.js.map