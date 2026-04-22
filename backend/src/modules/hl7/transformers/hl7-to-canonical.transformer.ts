import { Injectable, Logger } from '@nestjs/common';
import { HL7Message } from '../services/hl7-parser.service';
import {
  CanonicalPatient,
  CanonicalOrder,
  CanonicalMessage,
} from '../../../common/models';

@Injectable()
export class HL7ToCanonicalTransformer {
  private readonly logger = new Logger(HL7ToCanonicalTransformer.name);

  /**
   * Transform HL7 PID segment to Canonical Patient
   */
  transformPatient(message: HL7Message): CanonicalPatient | null {
    const pidSegment = message.segments.find((s) => s.id === 'PID');
    if (!pidSegment) return null;

    const patient: CanonicalPatient = {
      id: pidSegment.fields[3] || '', // Patient ID
      resourceType: 'Patient',
      identifiers: this.extractIdentifiers(pidSegment),
      active: true,
      name: this.extractNames(pidSegment),
      gender: (pidSegment.fields[8] || 'unknown') as any,
      birthDate: pidSegment.fields[7],
      address: this.extractAddresses(pidSegment),
      telecom: this.extractTelecom(pidSegment),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return patient;
  }

  /**
   * Transform HL7 OBR/ORC to Canonical Order
   */
  transformOrder(message: HL7Message, patientId?: string): CanonicalOrder | null {
    const obrSegment = message.segments.find((s) => s.id === 'OBR');
    const orcSegment = message.segments.find((s) => s.id === 'ORC');

    if (!obrSegment) return null;

    const order: CanonicalOrder = {
      id: obrSegment.fields[1] || '',
      resourceType: 'ServiceRequest',
      identifier: [
        {
          system: 'hl7-obr',
          value: obrSegment.fields[1] || '',
        },
      ],
      status: (this.mapOrderStatus(obrSegment.fields[25] || '')) as any,
      priority: (this.mapPriority(
        orcSegment?.fields[7] || 'NORMAL',
      )) as any,
      intent: 'order',
      category: ['lab'],
      code: {
        text: obrSegment.fields[4] || 'Unknown',
        coding: [
          {
            system: 'hl7-universal-service-id',
            code: obrSegment.fields[4] || '',
          },
        ],
      },
      subject: {
        reference: `Patient/${patientId || obrSegment.fields[1]}`,
      },
      authoredOn: new Date(obrSegment.fields[6] || Date.now()),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return order;
  }

  /**
   * Map HL7 order status to canonical status
   */
  private mapOrderStatus(hl7Status: string): string {
    const mapping: Record<string, string> = {
      'O': 'active',
      'C': 'completed',
      'X': 'cancelled',
      'D': 'on-hold',
    };

    return mapping[hl7Status] || 'unknown';
  }

  /**
   * Map HL7 priority to canonical priority
   */
  private mapPriority(hl7Priority: string): string {
    const mapping: Record<string, string> = {
      'R': 'ROUTINE',
      'A': 'ASAP',
      'B': 'URGENT',
      'P': 'PREOP',
      'N': 'NORMAL',
    };

    return mapping[hl7Priority] || 'NORMAL';
  }

  private extractIdentifiers(pidSegment: any) {
    const identifiers = [];
    const patientId = pidSegment.fields[3];
    if (patientId) {
      identifiers.push({
        system: 'hl7-pid',
        value: patientId,
      });
    }
    return identifiers;
  }

  private extractNames(pidSegment: any) {
    const nameField = pidSegment.fields[5];
    if (!nameField) return [];

    return [
      {
        text: nameField,
      },
    ];
  }

  private extractAddresses(pidSegment: any) {
    const addressField = pidSegment.fields[11];
    if (!addressField) return [];

    return [
      {
        text: addressField,
      },
    ];
  }

  private extractTelecom(pidSegment: any) {
    const telecomField = pidSegment.fields[13];
    if (!telecomField) return [];

    return [
      {
        system: 'phone' as const,
        value: telecomField,
      },
    ];
  }
}
