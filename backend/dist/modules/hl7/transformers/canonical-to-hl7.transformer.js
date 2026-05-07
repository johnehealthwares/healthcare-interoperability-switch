"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CanonicalToHL7Transformer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalToHL7Transformer = void 0;
const common_1 = require("@nestjs/common");
let CanonicalToHL7Transformer = CanonicalToHL7Transformer_1 = class CanonicalToHL7Transformer {
    constructor() {
        this.logger = new common_1.Logger(CanonicalToHL7Transformer_1.name);
    }
    /**
     * Transform Canonical Patient to HL7 PID segment
     */
    transformPatient(patient) {
        const fields = new Array(13).fill('');
        // Patient ID
        fields[2] = patient.id;
        // Patient Name
        if (patient.name && patient.name.length > 0) {
            const primaryName = patient.name[0];
            fields[4] = [
                primaryName.family || '',
                primaryName.given?.[0] || '',
            ].join('^');
        }
        // Date of Birth
        fields[6] = this.formatDate(patient.birthDate);
        // Gender
        fields[7] = this.mapGenderToHL7(patient.gender);
        // Address
        if (patient.address && patient.address.length > 0) {
            fields[10] = patient.address[0].text || '';
        }
        // Phone
        if (patient.telecom && patient.telecom.length > 0) {
            fields[12] = patient.telecom[0].value || '';
        }
        return `PID|${fields.join('|')}`;
    }
    /**
     * Transform Canonical Order to HL7 OBR/ORC segments
     */
    transformOrder(order) {
        const segments = [];
        // ORC segment
        segments.push(this.buildORCSegment(order));
        // OBR segment
        segments.push(this.buildOBRSegment(order));
        return segments;
    }
    buildORCSegment(order) {
        const fields = new Array(7).fill('');
        fields[0] = this.mapStatusToHL7(order.status); // ORC-1
        fields[1] = order.id; // ORC-2
        fields[6] = this.mapPriorityToHL7(order.priority); // ORC-7
        return `ORC|${fields.join('|')}`;
    }
    buildOBRSegment(order) {
        const fields = new Array(6).fill('');
        fields[0] = '1'; // OBR-1
        fields[1] = order.id; // OBR-2
        fields[3] = this.buildUniversalServiceIdentifier(order); // OBR-4
        fields[5] = this.formatDateTime(order.authoredOn); // OBR-7
        return `OBR|${fields.join('|')}`;
    }
    mapStatusToHL7(status) {
        const mapping = {
            'active': 'NW',
            'completed': 'CM',
            'cancelled': 'CA',
            'on-hold': 'HD',
        };
        return mapping[status] || 'NW';
    }
    mapPriorityToHL7(priority) {
        const mapping = {
            'LOW': 'R',
            'NORMAL': 'R',
            'HIGH': 'A',
            'URGENT': 'U',
        };
        return mapping[priority] || 'R';
    }
    buildUniversalServiceIdentifier(order) {
        const coding = order.code?.coding?.[0];
        return [
            coding?.code || order.code?.text || 'UNKNOWN',
            coding?.display || order.code?.text || 'Unknown',
            coding?.system || '',
        ].join('^');
    }
    formatDate(value) {
        if (!value) {
            return '';
        }
        return String(value).replace(/-/g, '').slice(0, 8);
    }
    formatDateTime(value) {
        if (!value) {
            return '';
        }
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        const iso = date.toISOString().replace(/\.\d{3}Z$/, '');
        return iso.replace(/[-:]/g, '').replace('T', '');
    }
    mapGenderToHL7(gender) {
        switch (String(gender || '').toLowerCase()) {
            case 'female':
            case 'f':
                return 'F';
            case 'male':
            case 'm':
                return 'M';
            default:
                return 'U';
        }
    }
};
exports.CanonicalToHL7Transformer = CanonicalToHL7Transformer;
exports.CanonicalToHL7Transformer = CanonicalToHL7Transformer = CanonicalToHL7Transformer_1 = __decorate([
    (0, common_1.Injectable)()
], CanonicalToHL7Transformer);
//# sourceMappingURL=canonical-to-hl7.transformer.js.map