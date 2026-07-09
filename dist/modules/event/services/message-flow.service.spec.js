"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_flow_service_1 = require("./message-flow.service");
const enums_1 = require("../../../common/enums");
describe('MessageFlowService helpers', () => {
    it('normalizes HealthStack custom orders into a routable canonical message', () => {
        const canonical = (0, message_flow_service_1.normalizeCanonicalMessage)({
            messageType: enums_1.MessageType.ORDER,
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
        }, {
            order_category: 'Imaging',
            targetAE: 'dcm4chee',
        }, enums_1.ProtocolType.CUSTOM_JSON, enums_1.MessageType.ORDER);
        expect(canonical.metadata.orderCategory).toBe('RADIOLOGY');
        expect(canonical.metadata.targetAE).toBe('dcm4chee');
        expect(canonical.order?.category).toEqual(['radiology']);
        expect(canonical.order?.subject?.id).toBe('patient-1');
    });
    it('detects inbound protocol from payload shape', () => {
        expect((0, message_flow_service_1.detectInboundProtocol)('MSH|^~\\&|SWITCH')).toBe(enums_1.ProtocolType.HL7_V2);
        expect((0, message_flow_service_1.detectInboundProtocol)({
            resourceType: 'ServiceRequest',
        })).toBe(enums_1.ProtocolType.FHIR_R4);
        expect((0, message_flow_service_1.detectInboundProtocol)({
            order_category: 'LABORATORY',
        })).toBe(enums_1.ProtocolType.CUSTOM_JSON);
    });
    it('normalizes route categories consistently', () => {
        expect((0, message_flow_service_1.normalizeOrderCategory)('X-Ray')).toBe('RADIOLOGY');
        expect((0, message_flow_service_1.normalizeOrderCategory)('Lab')).toBe('LABORATORY');
    });
    it('extracts target AE from raw HL7 metadata segment', () => {
        expect((0, message_flow_service_1.extractTargetAE)(undefined, ['MSH|^~\\&|HEALTHSTACK|HS|SWITCH|RX|202604251200||ORM^O01|MSG-1|P|2.5', 'ZRT|openelis'].join('\r'))).toBe('openelis');
    });
});
//# sourceMappingURL=message-flow.service.spec.js.map