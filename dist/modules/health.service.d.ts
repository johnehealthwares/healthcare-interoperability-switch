export interface ProtocolConfig {
    protocol: string;
    host: string;
    port: number;
    timeout?: number;
    retryCount?: number;
    retryDelayMs?: number;
}
export declare class HealthService {
    private readonly logger;
    private configs;
    private checkWithRetry;
    handleCron(): Promise<void>;
    isRemoteOnline(host: string, port: number, timeout?: number): Promise<boolean>;
}
//# sourceMappingURL=health.service.d.ts.map