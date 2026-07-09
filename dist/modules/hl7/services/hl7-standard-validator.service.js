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
var HL7StandardValidatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HL7StandardValidatorService = void 0;
const common_1 = require("@nestjs/common");
let HL7StandardValidatorService = HL7StandardValidatorService_1 = class HL7StandardValidatorService {
    constructor() {
        this.logger = new common_1.Logger(HL7StandardValidatorService_1.name);
        try {
            const loaded = require('hl7-standard');
            this.hl7Standard = (loaded?.default || loaded);
        }
        catch (error) {
            this.logger.warn('hl7-standard is not installed; falling back to structural HL7 validation.');
        }
    }
    validateRawMessage(message) {
        const errors = [];
        const rawMessage = String(message || '').trim();
        if (!rawMessage) {
            errors.push('HL7 message is empty');
            return { valid: false, errors };
        }
        if (!rawMessage.startsWith('MSH')) {
            errors.push('HL7 message must start with MSH');
        }
        if (this.hl7Standard) {
            try {
                const document = new this.hl7Standard(rawMessage);
                document.transform();
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'hl7-standard rejected the message';
                errors.push(message);
            }
        }
        else {
            const segments = rawMessage.split(/\r\n|\n|\r/).filter(Boolean);
            if (segments.length === 0) {
                errors.push('HL7 message does not contain any segments');
            }
            if (!segments.some((segment) => segment.startsWith('PID|'))) {
                this.logger.debug('HL7 message does not contain a PID segment.');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
};
exports.HL7StandardValidatorService = HL7StandardValidatorService;
exports.HL7StandardValidatorService = HL7StandardValidatorService = HL7StandardValidatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], HL7StandardValidatorService);
//# sourceMappingURL=hl7-standard-validator.service.js.map