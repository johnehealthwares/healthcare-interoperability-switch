import { Injectable, Logger } from '@nestjs/common';
import { HL7Message } from '../services/hl7-parser.service';
import {
  CanonicalPatient,
  CanonicalOrder,
  CanonicalMessage,
} from '../../../common/models';

@Injectable()
export class CanonicalToHL7Transformer {
  private readonly logger = new Logger(CanonicalToHL7Transformer.name);

  /**
   * Transform Canonical Patient to HL7 PID segment
   */
  transformPatient(patient: CanonicalPatient): string {
    const fields = ['', '', ''];

    // Patient ID
    fields[3] = patient.id;

    // Patient Name
    if (patient.name && patient.name.length > 0) {
      fields[5] = patient.name[0].text || '';
    }

    // Date of Birth
    fields[7] = patient.birthDate || '';

    // Gender
    fields[8] = patient.gender || 'U';

    // Address
    if (patient.address && patient.address.length > 0) {
      fields[11] = patient.address[0].text || '';
    }

    // Phone
    if (patient.telecom && patient.telecom.length > 0) {
      fields[13] = patient.telecom[0].value || '';
    }

    return `PID|${fields.slice(1).join('|')}`;
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
    const fields = [''];

    fields.push(this.mapStatusToHL7(order.status)); // Order Control
    fields.push(order.id); // Placer Order Number
    fields.push(order.id); // Filler Order Number
    fields.push(''); // Order Status
    fields.push(''); // Response Flag
    fields.push(''); // Quantity/Timing
    fields.push(this.mapPriorityToHL7(order.priority)); // Priority

    return `ORC${fields.join('|')}`;
  }

  private buildOBRSegment(order: CanonicalOrder): string {
    const fields = [''];

    fields.push(order.id); // Sequence
    fields.push(order.id); // Placer Order Number
    fields.push(order.id); // Filler Order Number
    fields.push(order.code?.text || 'Unknown'); // Universal Service ID
    fields.push(''); // Priority
    fields.push(new Date().toISOString()); // Requested DateTime

    return `OBR${fields.join('|')}`;
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
      'ROUTINE': 'R',
      'URGENT': 'U',
      'ASAP': 'A',
      'NORMAL': 'R',
    };

    return mapping[priority] || 'R';
  }
}
