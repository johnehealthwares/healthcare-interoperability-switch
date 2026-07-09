Refactor the current `ValidationRuleService` into a new `ContextEnrichmentService` focused on runtime enrichment, lookup resolution, terminology expansion, formulation assistance, and dynamic mapping context generation rather than strict validation.

The current implementation incorrectly treats enrichment and contextual data resolution as validation. The new architecture should clearly separate:

* Validation → correctness and protocol compliance
* Enrichment → dynamic runtime context resolution
* Mapping → structural transformation
* Formulation → destination-specific population logic

The goal is to evolve the interoperability engine into a scalable architecture suitable for HL7, FHIR, DICOM, OpenELIS, RIS/PACS, LIS, and custom JSON integrations.

---

# Refactor Goals

Replace:

```ts
validationRuleService.evaluateRouteValidations(...)
```

with:

```ts
contextEnrichmentService.resolve(...)
```

The service should return:

```ts
{
  context,
  warnings,
  errors,
}
```

Where:

* `errors` → stop the message flow immediately
* `warnings` → record but continue processing
* `context` → runtime enrichment data passed into mappings and transformers

---

# New Service Responsibilities

The new `ContextEnrichmentService` should support:

* terminology resolution
* facility resolution
* practitioner/provider lookup
* patient enrichment
* routing hints
* destination-specific formulation support
* computed fields
* integration metadata
* protocol-specific formulation assistance
* OpenELIS enrichment
* PACS/RIS enrichment
* HL7 formulation assistance
* FHIR formulation assistance

This service is NOT responsible for protocol validation.

---

# Expected Return Type

```ts
interface ContextEnrichmentResult {
  context: EnrichmentContext;
  warnings: string[];
  errors: string[];
}
```

---

# Enrichment Context Model

Use strongly typed enrichment models internally.

```ts
interface TerminologyConcept {
  id?: string;
  code?: string;
  display?: string;
  system?: string;
  version?: string;
}

interface TerminologyEnrichment {
  local?: TerminologyConcept;

  loinc?: TerminologyConcept;

  snomed?: TerminologyConcept;

  modality?: TerminologyConcept;

  mappings?: TerminologyConcept[];

  normalizedText?: string;
}
```

---

# Facility Enrichment

```ts
interface FacilityEnrichment {
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
```

---

# Terminology Enrichment

```ts
interface TerminologyEnrichment {
  localCode?: string;
  loinc?: string;
  snomed?: string;
  modality?: string;
}
```

---

# Architectural Requirements

The enrichment context must NOT become part of canonical metadata.

Keep canonical models:

* transport-neutral
* integration-neutral
* stable
* deterministic

The enrichment context is runtime-specific and should remain external to canonical models.

Bad:

```ts
canonical.metadata.loinc
canonical.metadata.hl7FacilityCode
```

Good:

```ts
context.terminology.loinc
context.facility.hl7.facilityCode
```

---

# Message Processing Pipeline

Refactor the flow into:

```txt
Inbound Message
    ↓
Protocol Parser
    ↓
Inbound Enrichment
    ↓
Canonical Transformation
    ↓
Canonical Enrichment
    ↓
Routing
    ↓
Outbound Enrichment
    ↓
Dynamic Mapping Engine
    ↓
Protocol Serialization
    ↓
Transport
```

---

# Dynamic Mapping Requirements

The mapping engine must support passing runtime enrichment context into mappings.

Update mapping execution:

```ts
await mappingEngine.mapMessage(source, mapping, {
  sourceMessage: source,
  context: enrichmentContext,
  variables: {
    now: new Date().toISOString(),
  },
});
```

Mappings should support:

* expressions
* templates
* lookup values
* enrichment variables
* terminology resolution
* facility codes
* computed fields
* routing hints

---

# Dynamic Mapping Expression Examples

Examples of supported mapping expressions:

```txt
{{ context.facility.hl7.facilityCode }}
{{ context.terminology.loinc }}
{{ context.practitioner.npi }}
{{ context.routingHints.targetSystem }}
{{ variables.now }}
```

Mappings should remain declarative while still supporting runtime dynamic behavior.

Avoid imperative logic embedded directly in mappings or transformers.

Bad:

```ts
if (facility.type === 'RAD') {
  obr24 = 'CR';
}
```

Good:

```json
{
  "targetPath": "OBR.24",
  "expression": "context.terminology.modality"
}
```

---

# Transformer Integration

Pass the same enrichment context into hardcoded HL7 and FHIR transformers.

Example:

```ts
transformOrder(order, enrichmentContext)
```

The same context model should be shared between:

* dynamic mappings
* HL7 transformers
* FHIR transformers
* outbound formulation logic

However:

* mappings access context dynamically
* transformers access context using strong typing

---

# Transformation Strategy

The architecture should preserve:

## Hardcoded Typed Transformers

Used for:

* HL7 ↔ Canonical
* FHIR ↔ Canonical

These transformers should remain protocol-aware and strongly typed.

## Dynamic Mapping Engine

Used for:

* Custom JSON ↔ Canonical

Dynamic mappings should support:

* expression evaluation
* template rendering
* contextual enrichment
* configurable formulation logic

---

# Mapping Execution Context

Introduce a richer mapping execution context:

```ts
interface MappingExecutionContext {
  sourceMessage: unknown;

  canonical?: CanonicalFlowMessage;

  context?: EnrichmentContext;

  variables?: Record<string, unknown>;

  helpers?: Record<string, (...args: any[]) => unknown>;
}
```

---

# Enrichment Scope

The enrichment layer should support:

## Inbound Enrichment

Examples:

* custom payload normalization
* terminology resolution
* facility identification
* Z-segment extraction

## Canonical Enrichment

Examples:

* code translation
* routing hints
* patient/provider resolution

## Outbound Enrichment

Examples:

* OpenELIS accession generation
* HL7 facility code population
* PACS modality AE lookup
* FHIR organization references
* destination-specific formulation logic

---

# Important Constraints

Do NOT:

* place DB/API lookups inside transformers
* pollute canonical metadata with enrichment data
* tightly couple mappings to transport protocols
* mix validation concerns with enrichment concerns

Transformers should remain mostly pure.

Enrichment should happen BEFORE mapping/transformation.

---

# Desired Outcome

The final architecture should support:

* scalable interoperability workflows
* protocol-neutral canonical processing
* runtime contextual formulation
* configurable dynamic mappings
* HL7/FHIR/DICOM/OpenELIS integration
* declarative mappings with dynamic behavior
* strong typing internally
* flexible runtime expression evaluation externally

The system should resemble a lightweight interoperability engine architecture similar to enterprise healthcare integration platforms while remaining modular and maintainable.
