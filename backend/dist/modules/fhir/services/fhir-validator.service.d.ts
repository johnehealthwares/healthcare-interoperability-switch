export interface FHIRResource {
    resourceType: string;
    [key: string]: any;
}
export declare class FHIRValidatorService {
    private readonly logger;
    /**
     * Validate FHIR resource against R4 spec
     */
    validateResource(resource: FHIRResource): {
        valid: boolean;
        errors: string[];
    };
    private validatePatient;
    private validateServiceRequest;
    /**
     * Validate FHIR Bundle
     */
    validateBundle(bundle: any): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=fhir-validator.service.d.ts.map