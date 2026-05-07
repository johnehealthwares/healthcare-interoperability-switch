import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';

@Injectable()
export class CodingConceptClientService {
  private readonly logger = new Logger(CodingConceptClientService.name);
  private readonly httpClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.httpClient = axios.create({
      timeout: 10000,
    });

    this.logger.log('CodingConceptClientService initialized');
  }

  async searchConcept(
    module: string,
    moduleCode: string,
    metadata = false,
    mode: 'search' | 'match' = 'search',
  ): Promise<any | null> {
    const baseUrl = this.configService.get<string>(
      'CODING_CONCEPT_BASE_URL',
      'http://127.0.0.1:3011/api/v1',
    );

    const enabled =
      this.configService.get<string>(
        'ENABLE_ROUTE_VALIDATIONS',
        'true',
      ) !== 'false';

    this.logger.debug(
      `searchConcept called | module=${module} | code=${moduleCode} | mode=${mode} | metadata=${metadata}`,
    );

    if (!enabled) {
      this.logger.warn(
        'Route validations are disabled; skipping coding-concept lookup.',
      );

      return {
        skipped: true,
      };
    }

    const trimmedCode = String(moduleCode || '').trim();

    if (!trimmedCode) {
      this.logger.warn(
        `Skipping coding-concept lookup because moduleCode is empty | module=${module}`,
      );

      return null;
    }

    const url = `${baseUrl}/concepts/${mode}/${encodeURIComponent(
      module,
    )}/${encodeURIComponent(trimmedCode)}`;

    this.logger.debug(`Sending coding-concept request to ${url}`);

    try {
      const response = await this.httpClient.get(url, {
        params: metadata ? { metadata: 'true' } : undefined,
      });

      this.logger.log(
        `Coding-concept lookup successful | module=${module} | code=${trimmedCode} | status=${response.status}`,
      );

      this.logger.verbose(
        `Coding-concept response: ${JSON.stringify(response.data)}`,
      );

      return response.data?.data ?? response.data ?? null;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 404) {
        this.logger.warn(
          `Coding concept not found | module=${module} | code=${trimmedCode}`,
        );

        return null;
      }

      const message =
        axiosError.message || 'Unknown coding concept lookup error';

      this.logger.error(
        `Coding concept lookup failed | module=${module} | code=${trimmedCode} | message=${message}`,
        axiosError.stack,
      );

      if (axiosError.response) {
        this.logger.error(
          `Response status=${axiosError.response.status} data=${JSON.stringify(
            axiosError.response.data,
          )}`,
        );
      }

      throw error;
    }
  }
}