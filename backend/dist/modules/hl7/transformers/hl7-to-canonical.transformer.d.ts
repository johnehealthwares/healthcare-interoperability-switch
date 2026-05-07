import { HL7Message } from '../services/hl7-parser.service';
import { CanonicalPatient, CanonicalOrder } from '../../../common/models';
export declare class HL7ToCanonicalTransformer {
    private readonly logger;
    /**
     * Transform HL7 PID segment to Canonical Patient
     */
    transformPatient(message: HL7Message): CanonicalPatient | null;
    /**
     * Transform HL7 OBR/ORC to Canonical Order
     */
    transformOrder(message: HL7Message, patientId?: string): CanonicalOrder | null;
    /**
     * Map HL7 order status to canonical status
     */
    private mapOrderStatus;
    /**
     * Map HL7 priority to canonical priority
     */
    private mapPriority;
    private extractIdentifiers;
    private extractNames;
    private extractAddresses;
    private extractTelecom;
    private parseHl7DateTime;
    private mapGender;
    private normalizeBirthDate;
    private extractObrIdentifierComponent;
}
//# sourceMappingURL=hl7-to-canonical.transformer.d.ts.map