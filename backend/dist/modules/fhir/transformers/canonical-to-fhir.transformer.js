"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CanonicalToFHIRTransformer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalToFHIRTransformer = void 0;
const common_1 = require("@nestjs/common");
let CanonicalToFHIRTransformer = CanonicalToFHIRTransformer_1 = class CanonicalToFHIRTransformer {
    constructor() {
        this.logger = new common_1.Logger(CanonicalToFHIRTransformer_1.name);
    }
    /**
     * Transform Canonical Patient to FHIR Patient
     */
    transformPatient(canonicalPatient) {
        return {
            resourceType: 'Patient',
            id: canonicalPatient.id,
            identifier: canonicalPatient.identifiers,
            active: canonicalPatient.active,
            name: canonicalPatient.name,
            gender: canonicalPatient.gender,
            birthDate: canonicalPatient.birthDate,
            address: canonicalPatient.address,
            telecom: canonicalPatient.telecom,
            contact: canonicalPatient.contact,
            generalPractitioner: canonicalPatient.generalPractitioner,
            managingOrganization: canonicalPatient.managingOrganization,
            link: canonicalPatient.link,
        };
    }
    /**
     * Transform Canonical Order to FHIR ServiceRequest
     */
    transformOrder(canonicalOrder) {
        return {
            resourceType: 'ServiceRequest',
            id: canonicalOrder.id,
            identifier: canonicalOrder.identifier,
            status: canonicalOrder.status,
            intent: canonicalOrder.intent,
            priority: canonicalOrder.priority,
            category: canonicalOrder.category,
            code: canonicalOrder.code,
            subject: canonicalOrder.subject,
            encounter: canonicalOrder.encounter,
            occurrenceDateTime: canonicalOrder.occurrenceDateTime,
            occurrencePeriod: canonicalOrder.occurrencePeriod,
            authoredOn: canonicalOrder.authoredOn.toISOString(),
            requester: canonicalOrder.requester,
            performer: canonicalOrder.performer,
            reasonCode: canonicalOrder.reasonCode,
            reasonReference: canonicalOrder.reasonReference,
            supportingInfo: canonicalOrder.supportingInfo,
            specimen: canonicalOrder.specimen,
            note: canonicalOrder.note,
            patientInstruction: canonicalOrder.patientInstruction,
        };
    }
    /**
     * Create FHIR Bundle from resources
     */
    createBundle(resources, bundleType = 'transaction') {
        return {
            resourceType: 'Bundle',
            type: bundleType,
            meta: {
                lastUpdated: new Date().toISOString(),
            },
            entry: resources.map((resource) => ({
                resource,
                request: {
                    method: 'POST',
                    url: `${resource.resourceType}`,
                },
            })),
        };
    }
};
exports.CanonicalToFHIRTransformer = CanonicalToFHIRTransformer;
exports.CanonicalToFHIRTransformer = CanonicalToFHIRTransformer = CanonicalToFHIRTransformer_1 = __decorate([
    (0, common_1.Injectable)()
], CanonicalToFHIRTransformer);
//# sourceMappingURL=canonical-to-fhir.transformer.js.map