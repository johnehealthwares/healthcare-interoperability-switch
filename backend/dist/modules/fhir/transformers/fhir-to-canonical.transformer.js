"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FHIRToCanonicalTransformer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FHIRToCanonicalTransformer = void 0;
const common_1 = require("@nestjs/common");
let FHIRToCanonicalTransformer = FHIRToCanonicalTransformer_1 = class FHIRToCanonicalTransformer {
    constructor() {
        this.logger = new common_1.Logger(FHIRToCanonicalTransformer_1.name);
    }
    /**
     * Transform FHIR Patient to Canonical Patient
     */
    transformPatient(fhirPatient) {
        return {
            id: fhirPatient.id || '',
            resourceType: 'Patient',
            identifiers: fhirPatient.identifier || [],
            active: fhirPatient.active ?? true,
            name: fhirPatient.name || [],
            gender: fhirPatient.gender || 'unknown',
            birthDate: fhirPatient.birthDate,
            address: fhirPatient.address || [],
            telecom: fhirPatient.telecom || [],
            contact: fhirPatient.contact,
            generalPractitioner: fhirPatient.generalPractitioner,
            managingOrganization: fhirPatient.managingOrganization,
            link: fhirPatient.link,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
    /**
     * Transform FHIR ServiceRequest to Canonical Order
     */
    transformOrder(fhirServiceRequest) {
        return {
            id: fhirServiceRequest.id || '',
            resourceType: 'ServiceRequest',
            identifier: fhirServiceRequest.identifier || [],
            status: fhirServiceRequest.status || 'active',
            intent: fhirServiceRequest.intent || 'order',
            priority: fhirServiceRequest.priority || 'NORMAL',
            category: fhirServiceRequest.category,
            code: fhirServiceRequest.code || { text: '' },
            subject: fhirServiceRequest.subject,
            encounter: fhirServiceRequest.encounter,
            occurrenceDateTime: fhirServiceRequest.occurrenceDateTime,
            occurrencePeriod: fhirServiceRequest.occurrencePeriod,
            authoredOn: new Date(fhirServiceRequest.authoredOn || Date.now()),
            requester: fhirServiceRequest.requester,
            performer: fhirServiceRequest.performer,
            reasonCode: fhirServiceRequest.reasonCode,
            reasonReference: fhirServiceRequest.reasonReference,
            supportingInfo: fhirServiceRequest.supportingInfo,
            specimen: fhirServiceRequest.specimen,
            note: fhirServiceRequest.note,
            patientInstruction: fhirServiceRequest.patientInstruction,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
};
exports.FHIRToCanonicalTransformer = FHIRToCanonicalTransformer;
exports.FHIRToCanonicalTransformer = FHIRToCanonicalTransformer = FHIRToCanonicalTransformer_1 = __decorate([
    (0, common_1.Injectable)()
], FHIRToCanonicalTransformer);
//# sourceMappingURL=fhir-to-canonical.transformer.js.map