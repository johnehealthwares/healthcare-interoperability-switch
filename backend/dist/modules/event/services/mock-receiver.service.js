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
var MockReceiverService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockReceiverService = void 0;
const common_1 = require("@nestjs/common");
const http = __importStar(require("http"));
const net = __importStar(require("net"));
const hl7_parser_service_1 = require("../../hl7/services/hl7-parser.service");
let MockReceiverService = MockReceiverService_1 = class MockReceiverService {
    constructor(hl7Parser) {
        this.hl7Parser = hl7Parser;
        this.logger = new common_1.Logger(MockReceiverService_1.name);
        this.hl7Messages = [];
        this.fhirResources = [];
        this.customPayloads = [];
    }
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
    async waitUntilReady() {
        await this.readyPromise;
    }
    reset() {
        this.lastHl7Message = undefined;
        this.lastFhirResource = undefined;
        this.lastCustomPayload = undefined;
        this.hl7Messages.length = 0;
        this.fhirResources.length = 0;
        this.customPayloads.length = 0;
    }
    snapshot() {
        return {
            hl7Messages: [...this.hl7Messages],
            fhirResources: [...this.fhirResources],
            customPayloads: [...this.customPayloads],
        };
    }
    async startAll() {
        const hl7Port = this.getPort('MOCK_DCM4CHEE_HL7_PORT', 18080);
        const fhirPort = this.getPort('MOCK_OPENELIS_FHIR_PORT', 18081);
        const customPort = this.getPort('MOCK_CUSTOM_JSON_PORT', 18082);
        await Promise.all([
            this.startHl7Receiver(hl7Port),
            this.startFhirReceiver(fhirPort),
            this.startCustomReceiver(customPort),
        ]);
    }
    async startHl7Receiver(port) {
        this.hl7Server = net.createServer((socket) => {
            const remote = `${socket.remoteAddress}:${socket.remotePort}`;
            this.logger.log(`Mock DCM4CHEE HL7 receiver connected: ${remote}`);
            socket.on('data', (data) => {
                const message = data.toString();
                this.lastHl7Message = message;
                this.hl7Messages.push(message);
                this.logger.log(`Mock DCM4CHEE received HL7 payload (${remote}): ${message.substring(0, 200)}`);
                let ack = this.buildAck('MSGID');
                try {
                    const parsed = this.hl7Parser.parseMessage(message);
                    const messageControlId = parsed.segments.find((segment) => segment.id === 'MSH')?.fields[8] ||
                        'MSGID';
                    ack = this.buildAck(messageControlId);
                }
                catch {
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
    async startFhirReceiver(port) {
        this.fhirServer = http.createServer((req, res) => {
            const path = req.url?.split('?')[0] ?? '/';
            if (req.method === 'GET' && path === '/metadata') {
                res.writeHead(200, { 'Content-Type': 'application/fhir+json' });
                res.end(JSON.stringify({
                    resourceType: 'CapabilityStatement',
                    status: 'active',
                }));
                return;
            }
            if (req.method === 'POST' && path === '/') {
                this.readJson(req)
                    .then((body) => {
                    this.lastFhirResource = body;
                    this.fhirResources.push(body);
                    this.logger.log(`Mock OpenELIS received FHIR payload: ${JSON.stringify(body).substring(0, 300)}`);
                    res.writeHead(201, { 'Content-Type': 'application/fhir+json' });
                    res.end(JSON.stringify({
                        resourceType: 'OperationOutcome',
                        issue: [
                            {
                                severity: 'information',
                                code: 'informational',
                                diagnostics: 'Received by mock OpenELIS',
                            },
                        ],
                    }));
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
    async startCustomReceiver(port) {
        this.customServer = http.createServer((req, res) => {
            if (req.method === 'POST' && req.url === '/') {
                this.readJson(req)
                    .then((body) => {
                    this.lastCustomPayload = body;
                    this.customPayloads.push(body);
                    this.logger.log(`Mock custom receiver received payload: ${JSON.stringify(body).substring(0, 300)}`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'accepted',
                        receivedAt: new Date().toISOString(),
                    }));
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
        await this.listenServer(this.customServer, port);
        this.logger.log(`Mock custom receiver listening on port ${port}`);
    }
    buildAck(messageControlId) {
        const timestamp = new Date()
            .toISOString()
            .replace(/[-:]/g, '')
            .replace(/\..+/, '');
        return [
            `MSH|^~\\&|MOCK|MOCKFAC|SWITCH|SWITCHFAC|${timestamp}||ACK|${messageControlId}|P|2.5`,
            `MSA|AA|${messageControlId}`,
        ].join('\r');
    }
    getPort(name, fallback) {
        return Number(process.env[name] || fallback);
    }
    listenServer(server, port) {
        return new Promise((resolve, reject) => {
            server.once('error', reject);
            server.listen(port, '127.0.0.1', () => {
                server.off('error', reject);
                resolve();
            });
        });
    }
    closeServer(server) {
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
    readJson(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    resolve(JSON.parse(body || '{}'));
                }
                catch (error) {
                    reject(error);
                }
            });
            req.on('error', reject);
        });
    }
};
exports.MockReceiverService = MockReceiverService;
exports.MockReceiverService = MockReceiverService = MockReceiverService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hl7_parser_service_1.HL7ParserService])
], MockReceiverService);
//# sourceMappingURL=mock-receiver.service.js.map