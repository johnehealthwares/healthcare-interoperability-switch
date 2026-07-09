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
            id: pidSegment.fields[2] || '', // PID-3 Patient ID
            resourceType: 'Patient',
            identifiers: this.extractIdentifiers(pidSegment),
            active: true,
            name: this.extractNames(pidSegment),
            gender: this.mapGender(pidSegment.fields[7] || 'U'),
            birthDate: this.normalizeBirthDate(pidSegment.fields[6]),
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
            status: (this.mapOrderStatus(obrSegment.fields[24] || '')),
            priority: (this.mapPriority(orcSegment?.fields[6] || 'NORMAL')),
            intent: 'order',
            category: [],
            code: {
                text: this.extractObrIdentifierComponent(obrSegment.fields[3], 1) ||
                    this.extractObrIdentifierComponent(obrSegment.fields[3], 0) ||
                    'Unknown',
                coding: [
                    {
                        system: 'hl7-universal-service-id',
                        code: this.extractObrIdentifierComponent(obrSegment.fields[3], 0) || '',
                        display: this.extractObrIdentifierComponent(obrSegment.fields[3], 1),
                    },
                ],
            },
            subject: {
                reference: `Patient/${patientId || obrSegment.fields[1]}`,
            },
            authoredOn: this.parseHl7DateTime(obrSegment.fields[6]),
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
            'R': 'NORMAL',
            'A': 'HIGH',
            'B': 'URGENT',
            'P': 'HIGH',
            'N': 'NORMAL',
        };
        return mapping[hl7Priority] || 'NORMAL';
    }
    extractIdentifiers(pidSegment) {
        const identifiers = [];
        const patientId = pidSegment.fields[2];
        if (patientId) {
            identifiers.push({
                system: 'hl7-pid',
                value: patientId,
            });
        }
        return identifiers;
    }
    extractNames(pidSegment) {
        const nameField = pidSegment.fields[4];
        if (!nameField)
            return [];
        const [family, given] = String(nameField).split('^');
        return [
            {
                family,
                given: given ? [given] : [],
                text: [given, family].filter(Boolean).join(' '),
            },
        ];
    }
    extractAddresses(pidSegment) {
        const addressField = pidSegment.fields[10];
        if (!addressField)
            return [];
        return [
            {
                text: addressField,
            },
        ];
    }
    extractTelecom(pidSegment) {
        const telecomField = pidSegment.fields[12];
        if (!telecomField)
            return [];
        return [
            {
                system: 'phone',
                value: telecomField,
            },
        ];
    }
    parseHl7DateTime(value) {
        const candidate = String(value || '').trim();
        if (!candidate) {
            return new Date();
        }
        const dateOnlyMatch = /^(\d{4})(\d{2})(\d{2})$/.exec(candidate);
        if (dateOnlyMatch) {
            return new Date(`${dateOnlyMatch[1]}-${dateOnlyMatch[2]}-${dateOnlyMatch[3]}T00:00:00.000Z`);
        }
        const dateTimeMatch = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?$/.exec(candidate);
        if (dateTimeMatch) {
            const seconds = dateTimeMatch[6] || '00';
            return new Date(`${dateTimeMatch[1]}-${dateTimeMatch[2]}-${dateTimeMatch[3]}T${dateTimeMatch[4]}:${dateTimeMatch[5]}:${seconds}.000Z`);
        }
        const parsed = new Date(candidate);
        return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    mapGender(value) {
        const normalized = String(value || 'U').toUpperCase();
        if (normalized === 'F') {
            return 'female';
        }
        if (normalized === 'M') {
            return 'male';
        }
        return 'unknown';
    }
    normalizeBirthDate(value) {
        const normalized = String(value || '').trim();
        if (!normalized) {
            return undefined;
        }
        const match = /^(\d{4})(\d{2})(\d{2})/.exec(normalized);
        if (!match) {
            return undefined;
        }
        return `${match[1]}-${match[2]}-${match[3]}`;
    }
    extractObrIdentifierComponent(value, index) {
        return String(value || '').split('^')[index] || undefined;
    }
};
exports.HL7ToCanonicalTransformer = HL7ToCanonicalTransformer;
exports.HL7ToCanonicalTransformer = HL7ToCanonicalTransformer = HL7ToCanonicalTransformer_1 = __decorate([
    (0, common_1.Injectable)()
], HL7ToCanonicalTransformer);
//# sourceMappingURL=hl7-to-canonical.transformer.js.map