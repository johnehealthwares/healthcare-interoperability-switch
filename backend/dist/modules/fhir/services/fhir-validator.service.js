"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FHIRValidatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FHIRValidatorService = void 0;
const common_1 = require("@nestjs/common");
let FHIRValidatorService = FHIRValidatorService_1 = class FHIRValidatorService {
    constructor() {
        this.logger = new common_1.Logger(FHIRValidatorService_1.name);
    }
    /**
     * Validate FHIR resource against R4 spec
     */
    validateResource(resource) {
        const errors = [];
        if (!resource.resourceType) {
            errors.push('Missing resourceType');
        }
        // Type-specific validation
        switch (resource.resourceType) {
            case 'Patient':
                return this.validatePatient(resource, errors);
            case 'ServiceRequest':
                return this.validateServiceRequest(resource, errors);
            default:
                this.logger.warn(`No validation rule for ${resource.resourceType}`);
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    validatePatient(patient, errors) {
        if (!patient.id) {
            errors.push('Patient must have an id');
        }
        if (!patient.name || patient.name.length === 0) {
            errors.push('Patient must have at least one name');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    validateServiceRequest(sr, errors) {
        if (!sr.id) {
            errors.push('ServiceRequest must have an id');
        }
        if (!sr.subject) {
            errors.push('ServiceRequest must have a subject');
        }
        if (!sr.code) {
            errors.push('ServiceRequest must have a code');
        }
        if (!sr.status) {
            errors.push('ServiceRequest must have a status');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Validate FHIR Bundle
     */
    validateBundle(bundle) {
        const errors = [];
        if (bundle.resourceType !== 'Bundle') {
            errors.push('Root resource must be a Bundle');
        }
        if (!bundle.type) {
            errors.push('Bundle must have a type');
        }
        if (!bundle.entry || bundle.entry.length === 0) {
            errors.push('Bundle must have at least one entry');
        }
        else {
            for (const entry of bundle.entry) {
                const validation = this.validateResource(entry.resource);
                if (!validation.valid) {
                    errors.push(`Invalid resource in entry: ${validation.errors.join(', ')}`);
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
};
exports.FHIRValidatorService = FHIRValidatorService;
exports.FHIRValidatorService = FHIRValidatorService = FHIRValidatorService_1 = __decorate([
    (0, common_1.Injectable)()
], FHIRValidatorService);
//# sourceMappingURL=fhir-validator.service.js.map