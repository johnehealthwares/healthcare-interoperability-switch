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
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const net_1 = __importDefault(require("net"));
const services_1 = require("../ae/services");
let HealthService = HealthService_1 = class HealthService {
    constructor(aeRegistryService) {
        this.aeRegistryService = aeRegistryService;
        this.logger = new common_1.Logger(HealthService_1.name);
        this.aes = [];
    }
    async onModuleInit() {
        const result = await this.aeRegistryService.listAEs({ page: 1, limit: 100, filters: {} });
        this.aes = result.data;
    }
    async checkWithRetry(config) {
        const retries = config.retryCount ?? 0;
        const delay = config.retryDelayMs ?? 500;
        let status;
        for (let attempt = 0; attempt <= retries; attempt++) {
            status = await this.isRemoteOnline(config);
            if (config.status === 'ONLINE')
                return status;
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, delay));
            }
        }
        return status;
    }
    // Option 1: Cron (runs every 10 seconds)
    async handleCron() {
        this.logger.log('Running scheduled socket health checks...');
        for (const ae of this.aes) {
            for (const config of ae.inboundConfig) {
                config.status = await this.checkWithRetry(config);
                this.logger.log(`${ae.name} INBOUND ${config.host}:${config.port} -> ${config.status}`);
            }
            for (const config of ae.outboundConfig) {
                config.status = await this.checkWithRetry(config);
                this.logger.log(`${ae.name} OUTBOUND ${config.host}:${config.port} -> ${config.status}`);
            }
            this.aeRegistryService.updateAE(ae.id, { inboundConfig: ae.inboundConfig, outboundConfig: ae.outboundConfig });
        }
    }
    isRemoteOnline(config) {
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
            socket.setTimeout(config.timeout || 10000);
            socket.once('connect', () => finish('ONLINE'));
            socket.once('timeout', () => finish('CONNECTION_TIMED_OUT'));
            socket.once('error', (error) => finish(error.message));
            socket.connect(config.port, config.host);
        });
    }
};
exports.HealthService = HealthService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthService.prototype, "handleCron", null);
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [services_1.AERegistryService])
], HealthService);
//# sourceMappingURL=health.service.js.map