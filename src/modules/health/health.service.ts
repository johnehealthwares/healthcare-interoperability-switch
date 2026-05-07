import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import net from 'net';
import { AERegistryService } from '../ae/services';
import { ApplicationEntityContract, ProtocolConfig } from '../../common';


@Injectable()
export class HealthService implements OnModuleInit {
    private readonly logger = new Logger(HealthService.name);

    private aes: ApplicationEntityContract[] = [];

    constructor(private readonly aeRegistryService: AERegistryService) { }

    async onModuleInit() {
        const result = await this.aeRegistryService.listAEs({ page: 1, limit: 100, filters: {} })
        this.aes = result.data;
    }

    private async checkWithRetry(config: ProtocolConfig): Promise<string> {
        const retries = config.retryCount ?? 0;
        const delay = config.retryDelayMs ?? 500;
        let status: string;
        for (let attempt = 0; attempt <= retries; attempt++) {
            status = await this.isRemoteOnline(config);
            if (config.status === 'ONLINE') return status;
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, delay));
            }
        }
        return status;
    }

    // Option 1: Cron (runs every 10 seconds)
    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        this.logger.log('Running scheduled socket health checks...');
        for (const ae of this.aes) {
            for (const config of ae.inboundConfig) {
                config.status = await this.checkWithRetry(config);
                this.logger.log(`${ae.name} INBOUND ${config.host}:${config.port} -> ${config.status}`);
            }
            for (const config of ae.outboundConfig) {
                config.status = await this.checkWithRetry(config);
                this.logger.log(`${ae.name} OUTBOUND ${config.host}:${config.port} -> ${config.status}`);
            }
            this.aeRegistryService.updateAE(ae.id, { inboundConfig: ae.inboundConfig, outboundConfig: ae.outboundConfig});
        }
    }

    isRemoteOnline(
        config: ProtocolConfig,
    ): Promise<string> {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            let done = false;

            const finish = (result: string) => {
                if (!done) {
                    done = true;
                    socket.destroy();
                    resolve(result);
                }
            };

            socket.setTimeout(config.timeout || 10_000);
            socket.once('connect', () => finish('ONLINE'));
            socket.once('timeout', () => finish('CONNECTION_TIMED_OUT'));
            socket.once('error', (error) => finish(error.message));
            socket.connect(config.port, config.host);
        });
    }

}