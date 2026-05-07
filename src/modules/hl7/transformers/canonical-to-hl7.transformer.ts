import { Injectable, Logger } from '@nestjs/common';
import {
  CanonicalPatient,
  CanonicalOrder,
} from '../../../common/models';

@Injectable()
export class CanonicalToHL7Transformer {
  private readonly logger = new Logger(CanonicalToHL7Transformer.name);

  /**
   * Transform Canonical Patient to HL7 PID segment
   */
  transformPatient(patient: CanonicalPatient): string {
    const fields = new Array(13).fill('');

    // Patient ID
    fields[2] = patient.id;

    // Patient Name
    if (patient.name && patient.name.length > 0) {
      const primaryName = patient.name[0];
      fields[4] = [
        primaryName.family || '',
        primaryName.given?.[0] || '',
      ].join('^');
    }

    // Date of Birth
    fields[6] = this.formatDate(patient.birthDate);

    // Gender
    fields[7] = this.mapGenderToHL7(patient.gender);

    // Address
    if (patient.address && patient.address.length > 0) {
      fields[10] = patient.address[0].text || '';
    }

    // Phone
    if (patient.telecom && patient.telecom.length > 0) {
      fields[12] = patient.telecom[0].value || '';
    }

    return `PID|${fields.join('|')}`;
  }

  /**
   * Transform Canonical Order to HL7 OBR/ORC segments
   */
  transformOrder(order: CanonicalOrder): string[] {
    const segments: string[] = [];

    // ORC segment
    segments.push(this.buildORCSegment(order));

    // OBR segment
    segments.push(this.buildOBRSegment(order));

    return segments;
  }

  private buildORCSegment(order: CanonicalOrder): string {
    const fields = new Array(7).fill('');

    fields[0] = this.mapStatusToHL7(order.status); // ORC-1
    fields[1] = order.id; // ORC-2
    fields[6] = this.mapPriorityToHL7(order.priority); // ORC-7

    return `ORC|${fields.join('|')}`;
  }

  private buildOBRSegment(order: CanonicalOrder): string {
    const fields = new Array(6).fill('');

    fields[0] = '1'; // OBR-1
    fields[1] = order.id; // OBR-2
    fields[3] = this.buildUniversalServiceIdentifier(order); // OBR-4
    fields[5] = this.formatDateTime(order.authoredOn); // OBR-7

    return `OBR|${fields.join('|')}`;
  }

  private mapStatusToHL7(status: string): string {
    const mapping: Record<string, string> = {
      'active': 'NW',
      'completed': 'CM',
      'cancelled': 'CA',
      'on-hold': 'HD',
    };

    return mapping[status] || 'NW';
  }

  private mapPriorityToHL7(priority: string): string {
    const mapping: Record<string, string> = {
      'LOW': 'R',
      'NORMAL': 'R',
      'HIGH': 'A',
      'URGENT': 'U',
    };

    return mapping[priority] || 'R';
  }

  private buildUniversalServiceIdentifier(order: CanonicalOrder): string {
    const coding = order.code?.coding?.[0];
    return [
      coding?.code || order.code?.text || 'UNKNOWN',
      coding?.display || order.code?.text || 'Unknown',
      coding?.system || '',
    ].join('^');
  }

  private formatDate(value?: string): string {
    if (!value) {
      return '';
    }

    return String(value).replace(/-/g, '').slice(0, 8);
  }

  private formatDateTime(value?: Date | string): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const iso = date.toISOString().replace(/\.\d{3}Z$/, '');
    return iso.replace(/[-:]/g, '').replace('T', '');
  }

  private mapGenderToHL7(gender?: string): string {
    switch (String(gender || '').toLowerCase()) {
      case 'female':
      case 'f':
        return 'F';
      case 'male':
      case 'm':
        return 'M';
      default:
        return 'U';
    }
  }
}
