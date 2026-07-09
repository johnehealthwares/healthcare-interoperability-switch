import { CanonicalPatient, CanonicalOrder, EnrichmentContext } from '../../../common/models';
export declare class CanonicalToHL7Transformer {
    private readonly logger;
    /**
     * Transform Canonical Patient to HL7 PID segment
     */
    transformPatient(patient: CanonicalPatient, enrichmentContext?: EnrichmentContext): string;
    /**
     * Transform Canonical Order to HL7 OBR/ORC segments
     */
    transformOrder(order: CanonicalOrder, enrichmentContext?: EnrichmentContext): string[];
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