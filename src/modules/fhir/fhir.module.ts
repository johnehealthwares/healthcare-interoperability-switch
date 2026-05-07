import { Module } from '@nestjs/common';
import { FHIRValidatorService, FHIRBridgeService } from './services';
import { FHIRToCanonicalTransformer, CanonicalToFHIRTransformer } from './transformers';

@Module({
  providers: [FHIRValidatorService, FHIRBridgeService, FHIRToCanonicalTransformer, CanonicalToFHIRTransformer],
  exports: [FHIRValidatorService, FHIRBridgeService, FHIRToCanonicalTransformer, CanonicalToFHIRTransformer],
})
export class FHIRModule {}
