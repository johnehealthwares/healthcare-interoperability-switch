import { Injectable, Logger } from '@nestjs/common';
import {
  CanonicalPatient,
  CanonicalOrder,
  EnrichmentContext,
} from '../../../common/models';
import { FHIRResource } from '../services/fhir-validator.service';

@Injectable()
export class CanonicalToFHIRTransformer {
  private readonly logger = new Logger(CanonicalToFHIRTransformer.name);

  /**
   * Transform Canonical Patient to FHIR Patient
   */
  transformPatient(
    canonicalPatient: CanonicalPatient,
    enrichmentContext?: EnrichmentContext,
  ): FHIRResource {
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
      managingOrganization:
        canonicalPatient.managingOrganization ||
        (enrichmentContext?.facility?.fhir?.organizationReference
          ? { reference: enrichmentContext.facility.fhir.organizationReference }
          : undefined),
      link: canonicalPatient.link,
    };
  }

  /**
   * Transform Canonical Order to FHIR ServiceRequest
   */
  transformOrder(
    canonicalOrder: CanonicalOrder,
    enrichmentContext?: EnrichmentContext,
  ): FHIRResource {
    return {
      resourceType: 'ServiceRequest',
      id: canonicalOrder.id,
      identifier: canonicalOrder.identifier,
      status: canonicalOrder.status,
      intent: canonicalOrder.intent,
      priority: canonicalOrder.priority?.toLowerCase(),
      category: canonicalOrder.category,
      code: this.enrichCode(canonicalOrder, enrichmentContext),
      subject: canonicalOrder.subject,
      encounter: canonicalOrder.encounter,
      occurrenceDateTime: canonicalOrder.occurrenceDateTime,
      occurrencePeriod: canonicalOrder.occurrencePeriod,
      authoredOn: canonicalOrder.authoredOn.toISOString(),
      requester: canonicalOrder.requester,
      performer:
        canonicalOrder.performer ||
        (enrichmentContext?.facility?.fhir?.organizationReference
          ? [{ reference: enrichmentContext.facility.fhir.organizationReference }]
          : undefined),
      reasonCode: canonicalOrder.reasonCode,
      reasonReference: canonicalOrder.reasonReference,
      supportingInfo: canonicalOrder.supportingInfo,
      specimen: canonicalOrder.specimen,
      note: canonicalOrder.note,
      patientInstruction: canonicalOrder.patientInstruction,
    };
  }

  private enrichCode(
    canonicalOrder: CanonicalOrder,
    enrichmentContext?: EnrichmentContext,
  ) {
    const code = canonicalOrder.code;
    const loinc = enrichmentContext?.terminology?.loinc;
    if (!loinc?.code) {
      return code;
    }

    return {
      ...code,
      coding: [
        ...(code?.coding || []),
        {
          system: loinc.system || 'http://loinc.org',
          code: loinc.code,
          display: loinc.display,
          version: loinc.version,
        },
      ],
      text: code?.text || loinc.display,
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
