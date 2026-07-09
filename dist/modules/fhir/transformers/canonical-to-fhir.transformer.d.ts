import { CanonicalPatient, CanonicalOrder, EnrichmentContext } from '../../../common/models';
import { FHIRResource } from '../services/fhir-validator.service';
export declare class CanonicalToFHIRTransformer {
    private readonly logger;
    /**
     * Transform Canonical Patient to FHIR Patient
     */
    transformPatient(canonicalPatient: CanonicalPatient, enrichmentContext?: EnrichmentContext): FHIRResource;
    /**
     * Transform Canonical Order to FHIR ServiceRequest
     */
    transformOrder(canonicalOrder: CanonicalOrder, enrichmentContext?: EnrichmentContext): FHIRResource;
    private enrichCode;
    /**
     * Create FHIR Bundle from resources
     */
    createBundle(resources: FHIRResource[], bundleType?: string): FHIRResource;
}
//# sourceMappingURL=canonical-to-fhir.transformer.d.ts.map