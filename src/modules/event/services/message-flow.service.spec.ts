import {
  detectInboundProtocol,
  extractTargetAE,
  normalizeCanonicalMessage,
  normalizeOrderCategory,
} from './message-flow.service';
import { MessageType, ProtocolType } from '../../../common/enums';

describe('MessageFlowService helpers', () => {
  it('normalizes HealthStack custom orders into a routable canonical message', () => {
    const canonical = normalizeCanonicalMessage(
      {
        messageType: MessageType.ORDER,
        order: {
          id: 'order-1',
          subject: { id: 'patient-1' },
        },
        patient: {
          id: 'patient-1',
        },
        metadata: {
          orderCategory: 'Imaging',
        },
      },
      {
        order_category: 'Imaging',
        targetAE: 'dcm4chee',
      },
      ProtocolType.CUSTOM_JSON,
      MessageType.ORDER,
    );

    expect(canonical.metadata.orderCategory).toBe('RADIOLOGY');
    expect(canonical.metadata.targetAE).toBe('dcm4chee');
    expect(canonical.order?.category).toEqual(['radiology']);
    expect(canonical.order?.subject?.id).toBe('patient-1');
  });

  it('detects inbound protocol from payload shape', () => {
    expect(detectInboundProtocol('MSH|^~\\&|SWITCH')).toBe(ProtocolType.HL7_V2);
    expect(
      detectInboundProtocol({
        resourceType: 'ServiceRequest',
      }),
    ).toBe(ProtocolType.FHIR_R4);
    expect(
      detectInboundProtocol({
        order_category: 'LABORATORY',
      }),
    ).toBe(ProtocolType.CUSTOM_JSON);
  });

  it('normalizes route categories consistently', () => {
    expect(normalizeOrderCategory('X-Ray')).toBe('RADIOLOGY');
    expect(normalizeOrderCategory('Lab')).toBe('LABORATORY');
  });

  it('extracts target AE from raw HL7 metadata segment', () => {
    expect(
      extractTargetAE(
        undefined,
        ['MSH|^~\\&|HEALTHSTACK|HS|SWITCH|RX|202604251200||ORM^O01|MSG-1|P|2.5', 'ZRT|openelis'].join('\r'),
      ),
    ).toBe('openelis');
  });
});
