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
var FHIRBridgeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FHIRBridgeService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fhir_validator_service_1 = require("./fhir-validator.service");
let FHIRBridgeService = FHIRBridgeService_1 = class FHIRBridgeService {
    constructor(validator) {
        this.validator = validator;
        this.logger = new common_1.Logger(FHIRBridgeService_1.name);
        this.httpClient = axios_1.default.create({
            timeout: 10000,
            headers: {
                'Content-Type': 'application/fhir+json',
                'Accept': 'application/fhir+json',
            },
        });
    }
    async sendResource(baseUrl, resource) {
        try {
            this.logger.log(`Sending FHIR resource to ${baseUrl}`);
            // Validate resource
            const validation = this.validator.validateResource(resource);
            if (!validation.valid) {
                throw new Error(`Invalid FHIR resource: ${validation.errors.join(', ')}`);
            }
            const response = await this.httpClient.post(baseUrl, resource);
            this.logger.log(`Successfully sent FHIR resource: ${response.status}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error sending FHIR resource: ${error.message}`);
            throw error;
        }
    }
    async getResource(baseUrl, resourceType, id) {
        try {
            const url = `${baseUrl}/${resourceType}/${id}`;
            this.logger.log(`Getting FHIR resource from ${url}`);
            const response = await this.httpClient.get(url);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error getting FHIR resource: ${error.message}`);
            throw error;
        }
    }
    async pingEndpoint(baseUrl) {
        try {
            const response = await this.httpClient.get(`${baseUrl}/metadata`);
            return response.status === 200;
        }
        catch (error) {
            this.logger.error(`Ping failed: ${error.message}`);
            return false;
        }
    }
    async echoResource(baseUrl, resource) {
        try {
            this.logger.log(`Echoing FHIR resource to ${baseUrl}`);
            const response = await this.httpClient.post(`${baseUrl}/$echo`, resource);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Echo failed: ${error.message}`);
            throw error;
        }
    }
    async searchResources(baseUrl, resourceType, params) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${baseUrl}/${resourceType}?${queryString}`;
            this.logger.log(`Searching FHIR resources: ${url}`);
            const response = await this.httpClient.get(url);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Search failed: ${error.message}`);
            throw error;
        }
    }
};
exports.FHIRBridgeService = FHIRBridgeService;
exports.FHIRBridgeService = FHIRBridgeService = FHIRBridgeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [fhir_validator_service_1.FHIRValidatorService])
], FHIRBridgeService);
//# sourceMappingURL=fhir-bridge.service.js.map