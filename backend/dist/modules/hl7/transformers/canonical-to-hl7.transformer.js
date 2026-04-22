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
        const fields = ['', '', ''];
        // Patient ID
        fields[3] = patient.id;
        // Patient Name
        if (patient.name && patient.name.length > 0) {
            fields[5] = patient.name[0].text || '';
        }
        // Date of Birth
        fields[7] = patient.birthDate || '';
        // Gender
        fields[8] = patient.gender || 'U';
        // Address
        if (patient.address && patient.address.length > 0) {
            fields[11] = patient.address[0].text || '';
        }
        // Phone
        if (patient.telecom && patient.telecom.length > 0) {
            fields[13] = patient.telecom[0].value || '';
        }
        return `PID|${fields.slice(1).join('|')}`;
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
        const fields = [''];
        fields.push(this.mapStatusToHL7(order.status)); // Order Control
        fields.push(order.id); // Placer Order Number
        fields.push(order.id); // Filler Order Number
        fields.push(''); // Order Status
        fields.push(''); // Response Flag
        fields.push(''); // Quantity/Timing
        fields.push(this.mapPriorityToHL7(order.priority)); // Priority
        return `ORC${fields.join('|')}`;
    }
    buildOBRSegment(order) {
        const fields = [''];
        fields.push(order.id); // Sequence
        fields.push(order.id); // Placer Order Number
        fields.push(order.id); // Filler Order Number
        fields.push(order.code?.text || 'Unknown'); // Universal Service ID
        fields.push(''); // Priority
        fields.push(new Date().toISOString()); // Requested DateTime
        return `OBR${fields.join('|')}`;
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
            'ROUTINE': 'R',
            'URGENT': 'U',
            'ASAP': 'A',
            'NORMAL': 'R',
        };
        return mapping[priority] || 'R';
    }
};
exports.CanonicalToHL7Transformer = CanonicalToHL7Transformer;
exports.CanonicalToHL7Transformer = CanonicalToHL7Transformer = CanonicalToHL7Transformer_1 = __decorate([
    (0, common_1.Injectable)()
], CanonicalToHL7Transformer);
//# sourceMappingURL=canonical-to-hl7.transformer.js.map