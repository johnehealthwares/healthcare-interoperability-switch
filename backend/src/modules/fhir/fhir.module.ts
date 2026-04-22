import { Module } from '@nestjs/common';
import { FHIRValidatorService } from './services';
import { FHIRToCanonicalTransformer, CanonicalToFHIRTransformer } from './transformers';

@Module({
  providers: [FHIRValidatorService, FHIRToCanonicalTransformer, CanonicalToFHIRTransformer],
  exports: [FHIRValidatorService, FHIRToCanonicalTransformer, CanonicalToFHIRTransformer],
})
export class FHIRModule {}
