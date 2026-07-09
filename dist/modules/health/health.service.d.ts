import { OnModuleInit } from '@nestjs/common';
import { AERegistryService } from '../ae/services';
import { ProtocolConfig } from '../../common';
export declare class HealthService implements OnModuleInit {
    private readonly aeRegistryService;
    private readonly logger;
    private aes;
    constructor(aeRegistryService: AERegistryService);
    onModuleInit(): Promise<void>;
    private checkWithRetry;
    handleCron(): Promise<void>;
    isRemoteOnline(config: ProtocolConfig): Promise<string>;
}
//# sourceMappingURL=health.service.d.ts.map