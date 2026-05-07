import { CanonicalPatient, CanonicalOrder } from '../../../common/models';
export declare class CanonicalToHL7Transformer {
    private readonly logger;
    /**
     * Transform Canonical Patient to HL7 PID segment
     */
    transformPatient(patient: CanonicalPatient): string;
    /**
     * Transform Canonical Order to HL7 OBR/ORC segments
     */
    transformOrder(order: CanonicalOrder): string[];
    private buildORCSegment;
    private buildOBRSegment;
    private mapStatusToHL7;
    private mapPriorityToHL7;
    private buildUniversalServiceIdentifier;
    private formatDate;
    private formatDateTime;
    private mapGenderToHL7;
}
//# sourceMappingURL=canonical-to-hl7.transformer.d.ts.map