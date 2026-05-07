import { Injectable, Logger } from '@nestjs/common';

type HL7StandardConstructor = new (message?: string, options?: Record<string, any>) => {
  transform: (callback?: (error?: Error | null) => void) => void;
};

@Injectable()
export class HL7StandardValidatorService {
  private readonly logger = new Logger(HL7StandardValidatorService.name);
  private readonly hl7Standard?: HL7StandardConstructor;

  constructor() {
    try {
      const loaded = require('hl7-standard');
      this.hl7Standard = (loaded?.default || loaded) as HL7StandardConstructor;
    } catch (error) {
      this.logger.warn(
        'hl7-standard is not installed; falling back to structural HL7 validation.',
      );
    }
  }

  validateRawMessage(message: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const rawMessage = String(message || '').trim();

    if (!rawMessage) {
      errors.push('HL7 message is empty');
      return { valid: false, errors };
    }

    if (!rawMessage.startsWith('MSH')) {
      errors.push('HL7 message must start with MSH');
    }

    if (this.hl7Standard) {
      try {
        const document = new this.hl7Standard(rawMessage);
        document.transform();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'hl7-standard rejected the message';
        errors.push(message);
      }
    } else {
      const segments = rawMessage.split(/\r\n|\n|\r/).filter(Boolean);
      if (segments.length === 0) {
        errors.push('HL7 message does not contain any segments');
      }
      if (!segments.some((segment) => segment.startsWith('PID|'))) {
        this.logger.debug('HL7 message does not contain a PID segment.');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
