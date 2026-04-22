import { CanonicalPatient, CanonicalOrder } from '../../../common/models';
import { FHIRResource } from '../services/fhir-validator.service';
export declare class FHIRToCanonicalTransformer {
    private readonly logger;
    /**
     * Transform FHIR Patient to Canonical Patient
     */
    transformPatient(fhirPatient: FHIRResource): CanonicalPatient;
    /**
     * Transform FHIR ServiceRequest to Canonical Order
     */
    transformOrder(fhirServiceRequest: FHIRResource): CanonicalOrder;
}
//# sourceMappingURL=fhir-to-canonical.transformer.d.ts.map