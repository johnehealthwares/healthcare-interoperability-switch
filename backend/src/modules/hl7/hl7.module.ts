import { Module } from '@nestjs/common';
import { HL7ParserService } from './services';
import { HL7ToCanonicalTransformer, CanonicalToHL7Transformer } from './transformers';

@Module({
  providers: [HL7ParserService, HL7ToCanonicalTransformer, CanonicalToHL7Transformer],
  exports: [HL7ParserService, HL7ToCanonicalTransformer, CanonicalToHL7Transformer],
})
export class HL7Module {}
