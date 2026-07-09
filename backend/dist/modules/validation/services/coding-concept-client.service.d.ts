import { ConfigService } from '@nestjs/config';
export declare class CodingConceptClientService {
    private readonly configService;
    private readonly logger;
    private readonly httpClient;
    constructor(configService: ConfigService);
    searchConcept(module: string, moduleCode: string, metadata?: boolean, mode?: 'search' | 'match'): Promise<any | null>;
}
//# sourceMappingURL=coding-concept-client.service.d.ts.map