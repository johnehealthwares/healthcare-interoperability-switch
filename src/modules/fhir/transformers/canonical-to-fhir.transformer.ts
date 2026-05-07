import { Injectable, Logger } from '@nestjs/common';
import {
  CanonicalPatient,
  CanonicalOrder,
} from '../../../common/models';
import { FHIRResource } from '../services/fhir-validator.service';

@Injectable()
export class CanonicalToFHIRTransformer {
  private readonly logger = new Logger(CanonicalToFHIRTransformer.name);

  /**
   * Transform Canonical Patient to FHIR Patient
   */
  transformPatient(canonicalPatient: CanonicalPatient): FHIRResource {
    return {
      resourceType: 'Patient',
      id: canonicalPatient.id,
      identifier: canonicalPatient.identifiers,
      active: canonicalPatient.active,
      name: canonicalPatient.name,
      gender: canonicalPatient.gender,
      birthDate: canonicalPatient.birthDate,
      address: canonicalPatient.address,
      telecom: canonicalPatient.telecom,
      contact: canonicalPatient.contact,
      generalPractitioner: canonicalPatient.generalPractitioner,
      managingOrganization: canonicalPatient.managingOrganization,
      link: canonicalPatient.link,
    };
  }

  /**
   * Transform Canonical Order to FHIR ServiceRequest
   */
  transformOrder(canonicalOrder: CanonicalOrder): FHIRResource {
    return {
      resourceType: 'ServiceRequest',
      id: canonicalOrder.id,
      identifier: canonicalOrder.identifier,
      status: canonicalOrder.status,
      intent: canonicalOrder.intent,
      priority: canonicalOrder.priority?.toLowerCase(),
      category: canonicalOrder.category,
      code: canonicalOrder.code,
      subject: canonicalOrder.subject,
      encounter: canonicalOrder.encounter,
      occurrenceDateTime: canonicalOrder.occurrenceDateTime,
      occurrencePeriod: canonicalOrder.occurrencePeriod,
      authoredOn: canonicalOrder.authoredOn.toISOString(),
      requester: canonicalOrder.requester,
      performer: canonicalOrder.performer,
      reasonCode: canonicalOrder.reasonCode,
      reasonReference: canonicalOrder.reasonReference,
      supportingInfo: canonicalOrder.supportingInfo,
      specimen: canonicalOrder.specimen,
      note: canonicalOrder.note,
      patientInstruction: canonicalOrder.patientInstruction,
    };
  }

  /**
   * Create FHIR Bundle from resources
   */
  createBundle(
    resources: FHIRResource[],
    bundleType: string = 'transaction',
  ): FHIRResource {
    return {
      resourceType: 'Bundle',
      type: bundleType,
      meta: {
        lastUpdated: new Date().toISOString(),
      },
      entry: resources.map((resource) => ({
        resource,
        request: {
          method: 'POST',
          url: `${resource.resourceType}`,
        },
      })),
    };
  }
}
