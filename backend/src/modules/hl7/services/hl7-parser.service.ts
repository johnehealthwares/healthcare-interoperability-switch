import { Injectable, Logger } from '@nestjs/common';

export interface HL7Segment {
  id: string;
  fields: string[];
}

export interface HL7Message {
  segments: HL7Segment[];
  raw: string;
}

@Injectable()
export class HL7ParserService {
  private readonly logger = new Logger(HL7ParserService.name);

  /**
   * Parse HL7 v2 message into structured format
   */
  parseMessage(rawMessage: string, config?: any): HL7Message {
    const lines = rawMessage.trim().split('\r');
    const segments: HL7Segment[] = [];

    for (const line of lines) {
      if (!line) continue;

      const segmentId = line.substring(0, 3);
      const fieldSeparator = line.charAt(3) || '|';
      const fields = line.substring(4).split(fieldSeparator);

      segments.push({
        id: segmentId,
        fields,
      });
    }

    this.logger.debug(`Parsed ${segments.length} HL7 segments`);

    return {
      segments,
      raw: rawMessage,
    };
  }

  /**
   * Extract specific segment from message
   */
  getSegment(message: HL7Message, segmentId: string): HL7Segment | null {
    return message.segments.find((s) => s.id === segmentId) || null;
  }

  /**
   * Extract multiple segments of same type
   */
  getSegments(message: HL7Message, segmentId: string): HL7Segment[] {
    return message.segments.filter((s) => s.id === segmentId);
  }

  /**
   * Get field value from segment
   */
  getFieldValue(segment: HL7Segment, fieldIndex: number): string {
    return segment.fields[fieldIndex] || '';
  }

  /**
   * Validate HL7 message structure
   */
  validate(message: HL7Message): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!message.segments || message.segments.length === 0) {
      errors.push('No segments found in message');
    }

    const firstSegment = message.segments[0];
    if (!firstSegment || firstSegment.id !== 'MSH') {
      errors.push('First segment must be MSH (Message Header)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate HL7 message from segments
   */
  generateMessage(segments: HL7Segment[]): string {
    return segments
      .map((segment) => {
        if (segment.id === 'MSH') {
          // MSH has special format
          return `${segment.id}${segment.fields[0]}${segment.fields.slice(1).join(segment.fields[0])}`;
        }
        return `${segment.id}|${segment.fields.join('|')}`;
      })
      .join('\r');
  }

  /**
   * Extract PID (Patient Identification) segment
   */
  extractPatientInfo(message: HL7Message) {
    const pidSegment = this.getSegment(message, 'PID');
    if (!pidSegment) return null;

    return {
      patientId: this.getFieldValue(pidSegment, 3),
      patientName: this.getFieldValue(pidSegment, 5),
      dateOfBirth: this.getFieldValue(pidSegment, 7),
      gender: this.getFieldValue(pidSegment, 8),
      address: this.getFieldValue(pidSegment, 11),
    };
  }

  /**
   * Extract OBR (Observation Request) segment
   */
  extractOrderInfo(message: HL7Message) {
    const obrSegment = this.getSegment(message, 'OBR');
    if (!obrSegment) return null;

    return {
      orderId: this.getFieldValue(obrSegment, 1),
      universalServiceId: this.getFieldValue(obrSegment, 4),
      orderStatus: this.getFieldValue(obrSegment, 25),
      orderDateTime: this.getFieldValue(obrSegment, 6),
    };
  }

  /**
   * Extract ORC (Order Common) segment
   */
  extractOrderControl(message: HL7Message) {
    const orcSegment = this.getSegment(message, 'ORC');
    if (!orcSegment) return null;

    return {
      orderControl: this.getFieldValue(orcSegment, 1),
      placerOrderNumber: this.getFieldValue(orcSegment, 2),
      fillerOrderNumber: this.getFieldValue(orcSegment, 3),
      orderStatus: this.getFieldValue(orcSegment, 5),
      priority: this.getFieldValue(orcSegment, 7),
    };
  }
}
