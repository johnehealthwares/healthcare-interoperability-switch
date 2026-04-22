"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HL7ToCanonicalTransformer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HL7ToCanonicalTransformer = void 0;
const common_1 = require("@nestjs/common");
let HL7ToCanonicalTransformer = HL7ToCanonicalTransformer_1 = class HL7ToCanonicalTransformer {
    constructor() {
        this.logger = new common_1.Logger(HL7ToCanonicalTransformer_1.name);
    }
    /**
     * Transform HL7 PID segment to Canonical Patient
     */
    transformPatient(message) {
        const pidSegment = message.segments.find((s) => s.id === 'PID');
        if (!pidSegment)
            return null;
        const patient = {
            id: pidSegment.fields[3] || '', // Patient ID
            resourceType: 'Patient',
            identifiers: this.extractIdentifiers(pidSegment),
            active: true,
            name: this.extractNames(pidSegment),
            gender: (pidSegment.fields[8] || 'unknown'),
            birthDate: pidSegment.fields[7],
            address: this.extractAddresses(pidSegment),
            telecom: this.extractTelecom(pidSegment),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return patient;
    }
    /**
     * Transform HL7 OBR/ORC to Canonical Order
     */
    transformOrder(message, patientId) {
        const obrSegment = message.segments.find((s) => s.id === 'OBR');
        const orcSegment = message.segments.find((s) => s.id === 'ORC');
        if (!obrSegment)
            return null;
        const order = {
            id: obrSegment.fields[1] || '',
            resourceType: 'ServiceRequest',
            identifier: [
                {
                    system: 'hl7-obr',
                    value: obrSegment.fields[1] || '',
                },
            ],
            status: (this.mapOrderStatus(obrSegment.fields[25] || '')),
            priority: (this.mapPriority(orcSegment?.fields[7] || 'NORMAL')),
            intent: 'order',
            category: ['lab'],
            code: {
                text: obrSegment.fields[4] || 'Unknown',
                coding: [
                    {
                        system: 'hl7-universal-service-id',
                        code: obrSegment.fields[4] || '',
                    },
                ],
            },
            subject: {
                reference: `Patient/${patientId || obrSegment.fields[1]}`,
            },
            authoredOn: new Date(obrSegment.fields[6] || Date.now()),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return order;
    }
    /**
     * Map HL7 order status to canonical status
     */
    mapOrderStatus(hl7Status) {
        const mapping = {
            'O': 'active',
            'C': 'completed',
            'X': 'cancelled',
            'D': 'on-hold',
        };
        return mapping[hl7Status] || 'unknown';
    }
    /**
     * Map HL7 priority to canonical priority
     */
    mapPriority(hl7Priority) {
        const mapping = {
            'R': 'ROUTINE',
            'A': 'ASAP',
            'B': 'URGENT',
            'P': 'PREOP',
            'N': 'NORMAL',
        };
        return mapping[hl7Priority] || 'NORMAL';
    }
    extractIdentifiers(pidSegment) {
        const identifiers = [];
        const patientId = pidSegment.fields[3];
        if (patientId) {
            identifiers.push({
                system: 'hl7-pid',
                value: patientId,
            });
        }
        return identifiers;
    }
    extractNames(pidSegment) {
        const nameField = pidSegment.fields[5];
        if (!nameField)
            return [];
        return [
            {
                text: nameField,
            },
        ];
    }
    extractAddresses(pidSegment) {
        const addressField = pidSegment.fields[11];
        if (!addressField)
            return [];
        return [
            {
                text: addressField,
            },
        ];
    }
    extractTelecom(pidSegment) {
        const telecomField = pidSegment.fields[13];
        if (!telecomField)
            return [];
        return [
            {
                system: 'phone',
                value: telecomField,
            },
        ];
    }
};
exports.HL7ToCanonicalTransformer = HL7ToCanonicalTransformer;
exports.HL7ToCanonicalTransformer = HL7ToCanonicalTransformer = HL7ToCanonicalTransformer_1 = __decorate([
    (0, common_1.Injectable)()
], HL7ToCanonicalTransformer);
//# sourceMappingURL=hl7-to-canonical.transformer.js.map