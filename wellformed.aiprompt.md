You are a Principal Software Architect + Senior Full-Stack Engineer specializing in:

Healthcare interoperability systems
High-throughput message switching platforms
Event-driven distributed systems
Enterprise-grade observability tools
Fintech-style transaction switches (Postilion-like architectures)

You are tasked with designing and generating a complete production-ready system.

🏥 SYSTEM GOAL

Build a Healthcare Transaction Switching Platform (Postilion-style architecture) supporting:

HL7 v2 messaging
FHIR R4 resources
Custom JSON APIs
Canonical internal model transformation
Routing + mapping engine
Real-time tracing + audit system
Graph-based network visualization

Only implement use cases for below including request response and acknoledegements as the case may be:

✅ Order (Service Request)
✅ Patient

🧱 HIGH-LEVEL ARCHITECTURE

Generate a full system with:

Backend
NestJS modular architecture
PostgreSQL (system of record)
MongoDB (schemaless ingestion + EAV + tracing snapshots)
Frontend
React 
Enterprise dense UI design
Real-time WebSocket integration
🧩 BACKEND MODULE STRUCTURE

Create the following NestJS modules:

1. AE Module (Application Entities)

Define:

Application Entity model (AE)
Protocol types (HL7, FHIR, HTTP, TCP)
Host, port, security settings
inbound/outbound capabilities

Each AE contains:

inboundMappingId
outboundMappingId
attributes (EAV-based dynamic metadata)
2. Shared Module

Contains reusable:

Enums:
MessageType (ORDER, PATIENT)
ProtocolType (HL7, FHIR, CUSTOM)
AEStatus
RouteStatus
Utilities:
JSONPath helpers
Expression engine (JS-like DSL)
validation helpers
3. Core Module (Canonical Model)

Define a canonical healthcare model for:

Patient
id
identifiers
name
demographics
Order (Service Request)
orderId
patientId
testCode
status
priority

This is the single source of truth internal format.

4. HL7 Module
HL7 parser (v2)
Segment extractor (PID, OBR, ORC, OBX)
HL7 → Canonical transformer
Canonical → HL7 transformer
Runtime HL7 simulator
5. FHIR Module
FHIR R4 parser
ServiceRequest mapping
Patient resource mapping
FHIR → Canonical transformer
Canonical → FHIR transformer
Runtime FHIR simulator
6. Mapping Engine Module

Define a declarative mapping system:

Mapping Definition:
sourceFormat
targetFormat
fieldMappings

Each mapping supports:

JSONPath expressions
transformation expressions (JS-like DSL)
nested field mapping

Example:

{
  "source": "PID.3.1",
  "target": "patient.id",
  "transform": "toString(value)"
}
7. Routing Module

Define routing engine:

sourceAE → multiple target AEs
condition-based routing
message-type filtering

Routing rules structure:

sourceAE
targetAEs[]
conditions (messageType, patient attributes, etc.)
8. Event Pipeline

Implement lifecycle:

Ingestion
Security validation
Routing decision
Mapping execution (per AE)
Outbound dispatch 
Audit logging
9. EAV IMPLEMENTATION (IMPORTANT)

Use EAV where applicable:

HL7 custom fields and estentions
FHIR extensions
AE dynamic attributes
custom attribbues and metadata :

Structure:

10. DATABASE DESIGN
PostgreSQL (Core System)
AE registry
routing rules
mapping definitions
canonical records
MongoDB (Flexible Layer)
HL7 raw payloads
FHIR raw payloads
transformation traces
EAV attributes
debug snapshots
🌐 FRONTEND SYSTEM (REACT)
🎯 UI PRINCIPLES
Dense enterprise UI (not modern spacious UI)
High data-per-viewport design
Table-first layout
Operator console style
🧪 1. TESTING MODULE
Features:
Message Simulator
Send HL7, FHIR, Custom JSON
Select source AE
Payload Editor
HL7 monospace editor with validation
FHIR JSON editor
Canonical viewer
Replay Engine
Replay historical messages
Modify payload before replay
Compare results
Mock AE Sender
Simulate hospitals, labs, LIS systems
🔍 2. TRACE MODULE (CRITICAL)

Real-time message lifecycle visualization:

Timeline View:
Incoming AE → Security → Routing → Mapping → Outbound AE(s)
Step Inspector:
Raw HL7
Parsed structure
Canonical model
Outbound format
Diff Viewer:
before vs after mapping
canonical vs HL7/FHIR
Live Stream Console:
WebSocket real-time updates
filter by AE, message type
📊 3. AUDIT MODULE
Must support:
immutable logs
full message provenance chain
search by:
patientId
AE
message type
status
Export:
CSV
JSON
compliance reports
🌐 4. GRAPH UI (POSTILION-STYLE CORE FEATURE)
Core Concept:
Nodes = AEs
Edges = Routes
Messages = animated flows
Node Features:
AE name
protocol
status
throughput
Edge Features:
directional routes
filtering by message type
active/inactive states
Message Flow:
animated packets
color coding:
HL7 = blue
FHIR = green
error = red
Interaction:
click node → view messages + config
click edge → route rules + performance
click message → full trace drilldown
Layout:
[Hospital A]
     ↓
[Switch Core]
  ↓   ↓   ↓
[Lab][FHIR][Audit]
🧠 5. ADVANCED FEATURES
5.1 Time Travel Debugging
replay system at any timestamp
5.2 Bottleneck Heatmap
slow AEs
failing routes
latency visualization
5.3 Mapping Debugger

Field-level trace:

PID.3 → patient.id → FHIR.identifier
5.4 Rule Simulation Mode
test routing rules before deployment


Note 
include defaults in mappings
Validate with Zod  on top of the types
Version the schema (v1, v2) early
Keep mapping logic isolated (FHIR ↔ canonical)

create a HL7Protocol wrapper that uses TCP/IP and nest js appropriate librbaries to 
ability to ping AEs
abbility to ping and echo this system
send , receive messages, sync and async
write appropriate unit tests
don't overbload module creation

use swagger, NO RBAC


Generate:

Full NestJS backend (modular, production-ready)
PostgreSQL + MongoDB schema
HL7 + FHIR runtime simulators
Mapping + routing engine
React frontend (dense enterprise UI)
Graph-based live system visualization
Trace + audit system
Dynamic JSON-schema form engine
Seeded demo data:
Sample HL7 AE
Sample FHIR AE
Sample Custom API AE
Default HL7 ↔ FHIR mapping
MLLP server and receiverfor hl7


export type IdentifierType = 'MRN' | 'NIN' | 'PASSPORT' | 'OTHER';

export interface Identifier {
  system: string;
  value: string;
  type?: IdentifierType;
}

export type Gender = 'male' | 'female' | 'other' | 'unknown';

export interface HumanName {
  family: string;
  given: string[];
  prefix?: string[];
  suffix?: string[];
}

export type TelecomSystem = 'phone' | 'email';
export type TelecomUse = 'home' | 'work' | 'mobile';

export interface Telecom {
  system: TelecomSystem;
  value: string;
  use?: TelecomUse;
}

export interface Address {
  use?: 'home' | 'work';
  line: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Contact {
  name: string;
  relationship?: 'parent' | 'spouse' | 'guardian' | string;
  telecom?: string[];
}

export interface Reference {
  id: string;
  display?: string;
}

export interface Patient {
  id: string;
  identifier?: Identifier[];

  name: HumanName;
  gender?: Gender;
  birthDate?: string; // ISO date

  deceased?: {
    boolean?: boolean;
    dateTime?: string; // ISO datetime
  };

  telecom?: Telecom[];
  address?: Address[];

  contact?: Contact[];

  generalPractitioner?: Reference[];
  managingOrganization?: Reference;

  active?: boolean;

  communication?: {
    language: string;
    preferred?: boolean;
  }[];

  meta?: {
    lastUpdated?: string; // ISO datetime
    source?: string;
  };

  extension?: {
    payment?: PatientExtension;
  [key: string]: unknown;
  };
  
}

export type OrderStatus =
  | 'draft'
  | 'active'
  | 'completed'
  | 'cancelled';

export type OrderIntent = 'order' | 'plan';

export type Priority = 'routine' | 'urgent' | 'stat';

export type CodeSystem =
  | 'LOINC'
  | 'SNOMED'
  | 'RxNorm'
  | string;

export interface CodeableConcept {
  system: CodeSystem;
  code: string;
  display?: string;
}

export type OrderCategory =
  | 'lab'
  | 'imaging'
  | 'medication'
  | 'procedure';

export interface Period {
  start?: string; // ISO datetime
  end?: string;   // ISO datetime
}

export interface DosageInstruction {
  text?: string;
  timing?: string; // simplified
  route?: string;
  dose?: {
    value: number;
    unit: string;
  };
}

export interface Order {
  id: string;

  identifier?: Identifier[];

  status: OrderStatus;
  intent: OrderIntent;
  priority?: Priority;

  code: CodeableConcept;
  category: OrderCategory;

  subject: Reference;   // Patient
  encounter?: Reference;
  requester?: Reference;

  reasonCode?: CodeableConcept[];
  note?: string[];
  bodySite?: string[];

  authoredOn?: string;

  occurrence?: {
    dateTime?: string;
    period?: Period;
  };

  performer?: Reference[];
  location?: Reference;

  dosageInstruction?: DosageInstruction[]; // meds only

  basedOn?: string[];
  replaces?: string[];
  partOf?: string[];

  meta?: {
    lastUpdated?: string;
    source?: string;
  };

  paymentSummary?: {
    total: number;
    currency: string;
    status: PaymentStatus;
  };

  paymentIds?: string[];

  extension?: Record<string, unknown>;
}
export type PaymentMethodType =
  | 'cash'
  | 'card'
  | 'bank_transfer'
  | 'mobile_money'
  | 'insurance';

export interface PaymentMethod {
  type: PaymentMethodType;

  // For insurance
  provider?: string;
  policyNumber?: string;
  coveragePercent?: number;

  // For card / bank
  maskedAccount?: string; // e.g. ****1234
  expiry?: string;

  // Mobile money (common in Nigeria/Africa)
  mobileProvider?: 'MTN' | 'Airtel' | 'Glo' | string;
  phoneNumber?: string;

  preferred?: boolean;
}

Always update a progress.md file of the progress compared to the instructions here
Also a readme.md file about the project
once a feature is completed, remove from this file, so we know what's left

Go over this file again and implement what hasn't been implemented, delete what has been implemented, add unit tests,
Add seeds on startup,
- Add two AEs, Healthstack(localhost:9090) and DCM4CHEE(localhost:8080) ✅
- Add appropriate routing and mapping ✅
- Implement complete flow to send healthstack order and patient to DCM4CHEE  via HL7 ✅
- Implement complete flow to send healthstack order and patient to open elis  via FHir ✅
- test with inmemory db  while addinng real db configs so it can be switched , use nestJS config service to get env vars ✅
- Implement the HL7 Bridge and FHir BBridge for sending, receiving , pinging and echoing other systems ✅
- Also keep the frontend up to date as new features are added 

