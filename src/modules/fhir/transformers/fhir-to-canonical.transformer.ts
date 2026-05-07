import { Injectable, Logger } from '@nestjs/common';
import { Priority } from '../../../common/enums';
import {
  CanonicalPatient,
  CanonicalOrder,
} from '../../../common/models';
import { FHIRResource } from '../services/fhir-validator.service';

@Injectable()
export class FHIRToCanonicalTransformer {
  private readonly logger = new Logger(FHIRToCanonicalTransformer.name);

  /**
   * Transform FHIR Patient to Canonical Patient
   */
  transformPatient(fhirPatient: FHIRResource): CanonicalPatient {
    return {
      id: fhirPatient.id || '',
      resourceType: 'Patient',
      identifiers: fhirPatient.identifier || [],
      active: fhirPatient.active ?? true,
      name: fhirPatient.name || [],
      gender: fhirPatient.gender || 'unknown',
      birthDate: fhirPatient.birthDate,
      address: fhirPatient.address || [],
      telecom: fhirPatient.telecom || [],
      contact: fhirPatient.contact,
      generalPractitioner: fhirPatient.generalPractitioner,
      managingOrganization: fhirPatient.managingOrganization,
      link: fhirPatient.link,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Transform FHIR ServiceRequest to Canonical Order
   */
  transformOrder(fhirServiceRequest: FHIRResource): CanonicalOrder {
    return {
      id: fhirServiceRequest.id || '',
      resourceType: 'ServiceRequest',
      identifier: fhirServiceRequest.identifier || [],
      status: fhirServiceRequest.status || 'active',
      intent: fhirServiceRequest.intent || 'order',
      priority: this.mapPriority(fhirServiceRequest.priority),
      category: fhirServiceRequest.category,
      code: fhirServiceRequest.code || { text: '' },
      subject: fhirServiceRequest.subject,
      encounter: fhirServiceRequest.encounter,
      occurrenceDateTime: fhirServiceRequest.occurrenceDateTime,
      occurrencePeriod: fhirServiceRequest.occurrencePeriod,
      authoredOn: new Date(fhirServiceRequest.authoredOn || Date.now()),
      requester: fhirServiceRequest.requester,
      performer: fhirServiceRequest.performer,
      reasonCode: fhirServiceRequest.reasonCode,
      reasonReference: fhirServiceRequest.reasonReference,
      supportingInfo: fhirServiceRequest.supportingInfo,
      specimen: fhirServiceRequest.specimen,
      note: fhirServiceRequest.note,
      patientInstruction: fhirServiceRequest.patientInstruction,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private mapPriority(value?: string): Priority {
    const normalized = String(value || 'NORMAL').toUpperCase();
    if (
      normalized === Priority.LOW ||
      normalized === Priority.NORMAL ||
      normalized === Priority.HIGH ||
      normalized === Priority.URGENT
    ) {
      return normalized as Priority;
    }

    if (normalized === 'ROUTINE') {
      return Priority.NORMAL;
    }

    if (normalized === 'STAT' || normalized === 'ASAP') {
      return Priority.URGENT;
    }

    return Priority.NORMAL;
  }
}
