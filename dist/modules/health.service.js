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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
// health.service.ts
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const net_1 = __importDefault(require("net"));
let HealthService = HealthService_1 = class HealthService {
    constructor() {
        this.logger = new common_1.Logger(HealthService_1.name);
        // Example: could come from DB/config service
        this.configs = [
            { protocol: 'HTTP', host: '127.0.0.1', port: 3000, retryCount: 2 },
            { protocol: 'HL7', host: '192.168.1.10', port: 2575 },
        ];
    }
    async checkWithRetry(config) {
        const retries = config.retryCount ?? 0;
        const delay = config.retryDelayMs ?? 500;
        for (let attempt = 0; attempt <= retries; attempt++) {
            const ok = await this.isRemoteOnline(config.host, config.port, config.timeout ?? 3000);
            if (ok)
                return true;
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, delay));
            }
        }
        return false;
    }
    // Option 1: Cron (runs every 10 seconds)
    async handleCron() {
        this.logger.log('Running scheduled health checks...');
        for (const config of this.configs) {
            const isOnline = await this.checkWithRetry(config);
            this.logger.log(`${config.host}:${config.port} -> ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
        }
    }
    isRemoteOnline(host, port, timeout = 3000) {
        return new Promise((resolve) => {
            const socket = new net_1.default.Socket();
            let done = false;
            const finish = (result) => {
                if (!done) {
                    done = true;
                    socket.destroy();
                    resolve(result);
                }
            };
            socket.setTimeout(timeout);
            socket.once('connect', () => finish(true));
            socket.once('timeout', () => finish(false));
            socket.once('error', () => finish(false));
            socket.connect(port, host);
        });
    }
};
exports.HealthService = HealthService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthService.prototype, "handleCron", null);
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)()
], HealthService);
//# sourceMappingURL=health.service.js.map