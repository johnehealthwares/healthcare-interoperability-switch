"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const hl7_parser_service_1 = require("./hl7-parser.service");
describe('HL7ParserService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [hl7_parser_service_1.HL7ParserService],
        }).compile();
        service = module.get(hl7_parser_service_1.HL7ParserService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should parse HL7 message', () => {
        const hl7Message = `MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|20231201120000||ADT^A01|MSG_ID|P|2.5
PID|1||123456^^^MR||DOE^JOHN^^^^^L||19800101|M|||123 MAIN ST^^ANYTOWN^CA^12345||555-1234|||M|NON|123456789`;
        const result = service.parseMessage(hl7Message);
        expect(result).toBeDefined();
        expect(result.segments).toBeDefined();
        expect(result.segments.length).toBeGreaterThan(0);
        expect(result.segments[0].id).toBe('MSH');
        expect(result.segments[1].id).toBe('PID');
    });
    it('should extract segments', () => {
        const hl7Message = `MSH|^~\\&|APP|FAC|APP|FAC|20231201||ADT^A01|ID|P|2.5
PID|1||123||DOE^JOHN||19800101|M`;
        const message = service.parseMessage(hl7Message);
        const mshSegment = service.getSegment(message, 'MSH');
        const pidSegment = service.getSegment(message, 'PID');
        expect(mshSegment).toBeDefined();
        expect(pidSegment).toBeDefined();
        expect(mshSegment.id).toBe('MSH');
        expect(pidSegment.id).toBe('PID');
    });
});
//# sourceMappingURL=hl7-parser.service.spec.js.map