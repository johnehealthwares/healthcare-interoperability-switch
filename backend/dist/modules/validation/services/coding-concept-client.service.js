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
var CodingConceptClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodingConceptClientService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let CodingConceptClientService = CodingConceptClientService_1 = class CodingConceptClientService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(CodingConceptClientService_1.name);
        this.httpClient = axios_1.default.create({
            timeout: 10000,
        });
    }
    async searchConcept(module, moduleCode, metadata = false, mode = 'search') {
        const baseUrl = this.configService.get('CODING_CONCEPT_BASE_URL', 'http://127.0.0.1:3011/api/v1');
        const enabled = this.configService.get('ENABLE_ROUTE_VALIDATIONS', 'true') !== 'false';
        if (!enabled) {
            this.logger.debug('Route validations are disabled; skipping coding-concept lookup.');
            return {
                skipped: true,
            };
        }
        const trimmedCode = String(moduleCode || '').trim();
        if (!trimmedCode) {
            return null;
        }
        try {
            const response = await this.httpClient.get(`${baseUrl}/concepts/${mode}/${encodeURIComponent(module)}/${encodeURIComponent(trimmedCode)}`, {
                params: metadata ? { metadata: 'true' } : undefined,
            });
            return response.data?.data ?? response.data ?? null;
        }
        catch (error) {
            const axiosError = error;
            if (axiosError.response?.status === 404) {
                return null;
            }
            const message = axiosError.message || 'Unknown coding concept lookup error';
            this.logger.error(`Coding concept lookup failed: ${message}`);
            throw error;
        }
    }
};
exports.CodingConceptClientService = CodingConceptClientService;
exports.CodingConceptClientService = CodingConceptClientService = CodingConceptClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CodingConceptClientService);
//# sourceMappingURL=coding-concept-client.service.js.map