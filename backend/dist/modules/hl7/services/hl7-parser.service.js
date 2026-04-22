"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HL7ParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HL7ParserService = void 0;
const common_1 = require("@nestjs/common");
let HL7ParserService = HL7ParserService_1 = class HL7ParserService {
    constructor() {
        this.logger = new common_1.Logger(HL7ParserService_1.name);
    }
    /**
     * Parse HL7 v2 message into structured format
     */
    parseMessage(rawMessage, config) {
        const lines = rawMessage.trim().split('\r');
        const segments = [];
        for (const line of lines) {
            if (!line)
                continue;
            const segmentId = line.substring(0, 3);
            const fieldSeparator = line.charAt(3) || '|';
            const fields = line.substring(4).split(fieldSeparator);
            segments.push({
                id: segmentId,
                fields,
            });
        }
        this.logger.debug(`Parsed ${segments.length} HL7 segments`);
        return {
            segments,
            raw: rawMessage,
        };
    }
    /**
     * Extract specific segment from message
     */
    getSegment(message, segmentId) {
        return message.segments.find((s) => s.id === segmentId) || null;
    }
    /**
     * Extract multiple segments of same type
     */
    getSegments(message, segmentId) {
        return message.segments.filter((s) => s.id === segmentId);
    }
    /**
     * Get field value from segment
     */
    getFieldValue(segment, fieldIndex) {
        return segment.fields[fieldIndex] || '';
    }
    /**
     * Validate HL7 message structure
     */
    validate(message) {
        const errors = [];
        if (!message.segments || message.segments.length === 0) {
            errors.push('No segments found in message');
        }
        const firstSegment = message.segments[0];
        if (!firstSegment || firstSegment.id !== 'MSH') {
            errors.push('First segment must be MSH (Message Header)');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Generate HL7 message from segments
     */
    generateMessage(segments) {
        return segments
            .map((segment) => {
            if (segment.id === 'MSH') {
                // MSH has special format
                return `${segment.id}${segment.fields[0]}${segment.fields.slice(1).join(segment.fields[0])}`;
            }
            return `${segment.id}|${segment.fields.join('|')}`;
        })
            .join('\r');
    }
    /**
     * Extract PID (Patient Identification) segment
     */
    extractPatientInfo(message) {
        const pidSegment = this.getSegment(message, 'PID');
        if (!pidSegment)
            return null;
        return {
            patientId: this.getFieldValue(pidSegment, 3),
            patientName: this.getFieldValue(pidSegment, 5),
            dateOfBirth: this.getFieldValue(pidSegment, 7),
            gender: this.getFieldValue(pidSegment, 8),
            address: this.getFieldValue(pidSegment, 11),
        };
    }
    /**
     * Extract OBR (Observation Request) segment
     */
    extractOrderInfo(message) {
        const obrSegment = this.getSegment(message, 'OBR');
        if (!obrSegment)
            return null;
        return {
            orderId: this.getFieldValue(obrSegment, 1),
            universalServiceId: this.getFieldValue(obrSegment, 4),
            orderStatus: this.getFieldValue(obrSegment, 25),
            orderDateTime: this.getFieldValue(obrSegment, 6),
        };
    }
    /**
     * Extract ORC (Order Common) segment
     */
    extractOrderControl(message) {
        const orcSegment = this.getSegment(message, 'ORC');
        if (!orcSegment)
            return null;
        return {
            orderControl: this.getFieldValue(orcSegment, 1),
            placerOrderNumber: this.getFieldValue(orcSegment, 2),
            fillerOrderNumber: this.getFieldValue(orcSegment, 3),
            orderStatus: this.getFieldValue(orcSegment, 5),
            priority: this.getFieldValue(orcSegment, 7),
        };
    }
};
exports.HL7ParserService = HL7ParserService;
exports.HL7ParserService = HL7ParserService = HL7ParserService_1 = __decorate([
    (0, common_1.Injectable)()
], HL7ParserService);
//# sourceMappingURL=hl7-parser.service.js.map