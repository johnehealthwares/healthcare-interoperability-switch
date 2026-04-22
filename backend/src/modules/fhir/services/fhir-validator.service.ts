import { Injectable, Logger } from '@nestjs/common';

export interface FHIRResource {
  resourceType: string;
  [key: string]: any;
}

@Injectable()
export class FHIRValidatorService {
  private readonly logger = new Logger(FHIRValidatorService.name);

  /**
   * Validate FHIR resource against R4 spec
   */
  validateResource(resource: FHIRResource): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!resource.resourceType) {
      errors.push('Missing resourceType');
    }

    // Type-specific validation
    switch (resource.resourceType) {
      case 'Patient':
        return this.validatePatient(resource, errors);
      case 'ServiceRequest':
        return this.validateServiceRequest(resource, errors);
      default:
        this.logger.warn(`No validation rule for ${resource.resourceType}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private validatePatient(
    patient: any,
    errors: string[],
  ): { valid: boolean; errors: string[] } {
    if (!patient.id) {
      errors.push('Patient must have an id');
    }

    if (!patient.name || patient.name.length === 0) {
      errors.push('Patient must have at least one name');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private validateServiceRequest(
    sr: any,
    errors: string[],
  ): { valid: boolean; errors: string[] } {
    if (!sr.id) {
      errors.push('ServiceRequest must have an id');
    }

    if (!sr.subject) {
      errors.push('ServiceRequest must have a subject');
    }

    if (!sr.code) {
      errors.push('ServiceRequest must have a code');
    }

    if (!sr.status) {
      errors.push('ServiceRequest must have a status');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate FHIR Bundle
   */
  validateBundle(bundle: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (bundle.resourceType !== 'Bundle') {
      errors.push('Root resource must be a Bundle');
    }

    if (!bundle.type) {
      errors.push('Bundle must have a type');
    }

    if (!bundle.entry || bundle.entry.length === 0) {
      errors.push('Bundle must have at least one entry');
    } else {
      for (const entry of bundle.entry) {
        const validation = this.validateResource(entry.resource);
        if (!validation.valid) {
          errors.push(
            `Invalid resource in entry: ${validation.errors.join(', ')}`,
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
