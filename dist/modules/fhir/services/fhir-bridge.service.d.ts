import { FHIRValidatorService } from './fhir-validator.service';
export declare class FHIRBridgeService {
    private readonly validator;
    private readonly logger;
    private httpClient;
    constructor(validator: FHIRValidatorService);
    sendResource(baseUrl: string, resource: any): Promise<any>;
    getResource(baseUrl: string, resourceType: string, id: string): Promise<any>;
    pingEndpoint(baseUrl: string): Promise<boolean>;
    echoResource(baseUrl: string, resource: any): Promise<any>;
    searchResources(baseUrl: string, resourceType: string, params: Record<string, string>): Promise<any>;
}
//# sourceMappingURL=fhir-bridge.service.d.ts.map