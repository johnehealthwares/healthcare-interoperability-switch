import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { FHIRValidatorService } from './fhir-validator.service';

@Injectable()
export class FHIRBridgeService {
  private readonly logger = new Logger(FHIRBridgeService.name);
  private httpClient: AxiosInstance;

  constructor(private readonly validator: FHIRValidatorService) {
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json',
      },
    });
  }

  async sendResource(baseUrl: string, resource: any): Promise<any> {
    try {
      this.logger.log(`Sending FHIR resource to ${baseUrl}`);

      // Validate resource
      const validation = this.validator.validateResource(resource);
      if (!validation.valid) {
        throw new Error(`Invalid FHIR resource: ${validation.errors.join(', ')}`);
      }

      const response = await this.httpClient.post(baseUrl, resource);
      this.logger.log(`Successfully sent FHIR resource: ${response.status}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error sending FHIR resource: ${error.message}`);
      throw error;
    }
  }

  async getResource(baseUrl: string, resourceType: string, id: string): Promise<any> {
    try {
      const url = `${baseUrl}/${resourceType}/${id}`;
      this.logger.log(`Getting FHIR resource from ${url}`);

      const response = await this.httpClient.get(url);
      return response.data;
    } catch (error) {
      this.logger.error(`Error getting FHIR resource: ${error.message}`);
      throw error;
    }
  }

  async pingEndpoint(baseUrl: string): Promise<boolean> {
    try {
      const response = await this.httpClient.get(`${baseUrl}/metadata`);
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Ping failed: ${error.message}`);
      return false;
    }
  }

  async echoResource(baseUrl: string, resource: any): Promise<any> {
    try {
      this.logger.log(`Echoing FHIR resource to ${baseUrl}`);

      const response = await this.httpClient.post(`${baseUrl}/$echo`, resource);
      return response.data;
    } catch (error) {
      this.logger.error(`Echo failed: ${error.message}`);
      throw error;
    }
  }

  async searchResources(baseUrl: string, resourceType: string, params: Record<string, string>): Promise<any> {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${baseUrl}/${resourceType}?${queryString}`;

      this.logger.log(`Searching FHIR resources: ${url}`);
      const response = await this.httpClient.get(url);
      return response.data;
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      throw error;
    }
  }
}
