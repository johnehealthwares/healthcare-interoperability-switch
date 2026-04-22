export interface HL7Segment {
    id: string;
    fields: string[];
}
export interface HL7Message {
    segments: HL7Segment[];
    raw: string;
}
export declare class HL7ParserService {
    private readonly logger;
    /**
     * Parse HL7 v2 message into structured format
     */
    parseMessage(rawMessage: string, config?: any): HL7Message;
    /**
     * Extract specific segment from message
     */
    getSegment(message: HL7Message, segmentId: string): HL7Segment | null;
    /**
     * Extract multiple segments of same type
     */
    getSegments(message: HL7Message, segmentId: string): HL7Segment[];
    /**
     * Get field value from segment
     */
    getFieldValue(segment: HL7Segment, fieldIndex: number): string;
    /**
     * Validate HL7 message structure
     */
    validate(message: HL7Message): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Generate HL7 message from segments
     */
    generateMessage(segments: HL7Segment[]): string;
    /**
     * Extract PID (Patient Identification) segment
     */
    extractPatientInfo(message: HL7Message): {
        patientId: string;
        patientName: string;
        dateOfBirth: string;
        gender: string;
        address: string;
    };
    /**
     * Extract OBR (Observation Request) segment
     */
    extractOrderInfo(message: HL7Message): {
        orderId: string;
        universalServiceId: string;
        orderStatus: string;
        orderDateTime: string;
    };
    /**
     * Extract ORC (Order Common) segment
     */
    extractOrderControl(message: HL7Message): {
        orderControl: string;
        placerOrderNumber: string;
        fillerOrderNumber: string;
        orderStatus: string;
        priority: string;
    };
}
//# sourceMappingURL=hl7-parser.service.d.ts.map