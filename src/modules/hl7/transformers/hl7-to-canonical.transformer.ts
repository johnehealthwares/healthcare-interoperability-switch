import { Injectable, Logger } from '@nestjs/common';
import { HL7Message } from '../services/hl7-parser.service';
import {
  CanonicalPatient,
  CanonicalOrder,
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
      id: pidSegment.fields[2] || '', // PID-3 Patient ID
      resourceType: 'Patient',
      identifiers: this.extractIdentifiers(pidSegment),
      active: true,
      name: this.extractNames(pidSegment),
      gender: this.mapGender(pidSegment.fields[7] || 'U'),
      birthDate: this.normalizeBirthDate(pidSegment.fields[6]),
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
      status: (this.mapOrderStatus(obrSegment.fields[24] || '')) as any,
      priority: (this.mapPriority(
        orcSegment?.fields[6] || 'NORMAL',
      )) as any,
      intent: 'order',
      category: [],
      code: {
        text:
          this.extractObrIdentifierComponent(obrSegment.fields[3], 1) ||
          this.extractObrIdentifierComponent(obrSegment.fields[3], 0) ||
          'Unknown',
        coding: [
          {
            system: 'hl7-universal-service-id',
            code: this.extractObrIdentifierComponent(obrSegment.fields[3], 0) || '',
            display: this.extractObrIdentifierComponent(obrSegment.fields[3], 1),
          },
        ],
      },
      subject: {
        reference: `Patient/${patientId || obrSegment.fields[1]}`,
      },
      authoredOn: this.parseHl7DateTime(obrSegment.fields[6]),
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
      'R': 'NORMAL',
      'A': 'HIGH',
      'B': 'URGENT',
      'P': 'HIGH',
      'N': 'NORMAL',
    };

    return mapping[hl7Priority] || 'NORMAL';
  }

  private extractIdentifiers(pidSegment: any) {
    const identifiers = [];
    const patientId = pidSegment.fields[2];
    if (patientId) {
      identifiers.push({
        system: 'hl7-pid',
        value: patientId,
      });
    }
    return identifiers;
  }

  private extractNames(pidSegment: any) {
    const nameField = pidSegment.fields[4];
    if (!nameField) return [];

    const [family, given] = String(nameField).split('^');

    return [
      {
        family,
        given: given ? [given] : [],
        text: [given, family].filter(Boolean).join(' '),
      },
    ];
  }

  private extractAddresses(pidSegment: any) {
    const addressField = pidSegment.fields[10];
    if (!addressField) return [];

    return [
      {
        text: addressField,
      },
    ];
  }

  private extractTelecom(pidSegment: any) {
    const telecomField = pidSegment.fields[12];
    if (!telecomField) return [];

    return [
      {
        system: 'phone' as const,
        value: telecomField,
      },
    ];
  }

  private parseHl7DateTime(value?: string): Date {
    const candidate = String(value || '').trim();
    if (!candidate) {
      return new Date();
    }

    const dateOnlyMatch = /^(\d{4})(\d{2})(\d{2})$/.exec(candidate);
    if (dateOnlyMatch) {
      return new Date(
        `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}-${dateOnlyMatch[3]}T00:00:00.000Z`,
      );
    }

    const dateTimeMatch =
      /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?$/.exec(candidate);
    if (dateTimeMatch) {
      const seconds = dateTimeMatch[6] || '00';
      return new Date(
        `${dateTimeMatch[1]}-${dateTimeMatch[2]}-${dateTimeMatch[3]}T${dateTimeMatch[4]}:${dateTimeMatch[5]}:${seconds}.000Z`,
      );
    }

    const parsed = new Date(candidate);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private mapGender(value?: string): CanonicalPatient['gender'] {
    const normalized = String(value || 'U').toUpperCase();
    if (normalized === 'F') {
      return 'female';
    }

    if (normalized === 'M') {
      return 'male';
    }

    return 'unknown';
  }

  private normalizeBirthDate(value?: string): string | undefined {
    const normalized = String(value || '').trim();
    if (!normalized) {
      return undefined;
    }

    const match = /^(\d{4})(\d{2})(\d{2})/.exec(normalized);
    if (!match) {
      return undefined;
    }

    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  private extractObrIdentifierComponent(value: string, index: number): string | undefined {
    return String(value || '').split('^')[index] || undefined;
  }
}
