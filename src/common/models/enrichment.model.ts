import { MessageType, ProtocolType } from '../enums';
import { ApplicationEntityContract } from './ae.model';
import { RoutingRule } from './routing.model';

export interface TerminologyConcept {
  id?: string;
  code?: string;
  display?: string;
  system?: string;
  version?: string;
  metadata?: Record<string, unknown>;
}

export interface TerminologyEnrichment {
  local?: TerminologyConcept;
  loinc?: TerminologyConcept;
  snomed?: TerminologyConcept;
  modality?: TerminologyConcept;
  mappings?: TerminologyConcept[];
  normalizedText?: string;
  localCode?: string;
}

export interface FacilityEnrichment {
  id: string;
  name?: string;
  hl7?: {
    facilityCode?: string;
    locationCode?: string;
  };
  dicom?: {
    aet?: string;
    modalityWorklistStation?: string;
  };
  fhir?: {
    organizationReference?: string;
  };
}

export interface PatientEnrichment {
  id?: string;
  identifiers?: Array<{ system?: string; value?: string }>;
  display?: string;
}

export interface PractitionerEnrichment {
  id?: string;
  npi?: string;
  display?: string;
}

export interface OrderMetadataEnrichment {
  id?: string;
  category?: string;
  requestedCode?: string;
  requestedDisplay?: string;
}

export interface RoutingHints {
  targetAE?: string;
  targetSystem?: string;
  targetProtocol?: ProtocolType;
  routeId?: string;
  routeName?: string;
  applicationId?: string;
  applicationName?: string;
}

export interface IntegrationMetadataEnrichment {
  sourceAE?: string;
  sourceProtocol?: ProtocolType;
  targetAE?: string;
  targetProtocol?: ProtocolType;
  messageType?: MessageType;
}

export interface ProtocolFormulationEnrichment {
  hl7?: Record<string, unknown>;
  fhir?: Record<string, unknown>;
  dicom?: Record<string, unknown>;
  openelis?: Record<string, unknown>;
  risPacs?: Record<string, unknown>;
}

export interface EnrichmentContext {
  patient?: PatientEnrichment;
  practitioner?: PractitionerEnrichment;
  facility?: FacilityEnrichment;
  terminology?: TerminologyEnrichment;
  orderMetadata?: OrderMetadataEnrichment;
  routingHints?: RoutingHints;
  integration?: IntegrationMetadataEnrichment;
  formulation?: ProtocolFormulationEnrichment;
  computed?: Record<string, unknown>;
}

export interface ContextEnrichmentResult {
  context: EnrichmentContext;
  warnings: string[];
  errors: string[];
}

export interface ContextEnrichmentResolveInput {
  route?: RoutingRule;
  sourceMessage?: any;
  canonicalMessage?: any;
  sourceAE?: ApplicationEntityContract;
  targetAE?: ApplicationEntityContract;
  sourceProtocol?: ProtocolType;
  targetProtocol?: ProtocolType;
  messageType?: MessageType;
}
