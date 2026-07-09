# Graph Report - /Users/john/develop/rxsoft/healthcare-interoperability-switch  (2026-07-09)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 706 nodes · 1598 edges · 27 communities (26 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.77)
- Token cost: 1,270 input · 1,945 output

## Graph Freshness
- Built from commit: `5f78422a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AE Registry
- Canonical Models
- Message Enrichment
- HL7 Parsing & Bootstrap
- Validation Rules
- Mapping Engine
- Event & Status Enums
- Message Routing
- Docker & Services
- NestJS Modules
- Package Dependencies
- FHIR Bridge & Validation
- TypeScript Configuration
- Message Flow Controller
- Database Entities
- Enrichment Providers
- NPM Scripts
- Validation Entity
- Package Metadata
- Jest Configuration
- App Controller
- Database Seeder
- Mapping Entity
- Application Entity
- Dev Dependencies
- DB Setup Script

## God Nodes (most connected - your core abstractions)
1. `ProtocolType` - 39 edges
2. `MessageFlowService` - 27 edges
3. `MessageType` - 26 edges
4. `ApplicationEntityContract` - 23 edges
5. `AERegistryService` - 23 edges
6. `ApplicationEntityEntity` - 23 edges
7. `MappingEngineService` - 23 edges
8. `ValidationRuleEntity` - 21 edges
9. `HL7ParserService` - 21 edges
10. `RoutingTableEntity` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Postilion-Inspired Architecture` --conceptually_related_to--> `Canonical Patient & Order Model`  [INFERRED]
  wellformed.aiprompt.md → IMPLEMENTATION_STATUS.md
- `health-interoperability-switch Docker Service` --conceptually_related_to--> `AE Registry Service`  [INFERRED]
  docker-compose-dev.yml → IMPLEMENTATION_STATUS.md
- `Graph Visualization (React Flow, Cytoscape)` --conceptually_related_to--> `AE Registry Service`  [INFERRED]
  wellformed.aiprompt.md → IMPLEMENTATION_STATUS.md
- `health-interoperability-switch Docker Service` --conceptually_related_to--> `Routing Engine Service`  [INFERRED]
  docker-compose-dev.yml → IMPLEMENTATION_STATUS.md
- `health-interoperability-switch Docker Service` --conceptually_related_to--> `Mapping Engine Service`  [INFERRED]
  docker-compose-dev.yml → IMPLEMENTATION_STATUS.md

## Import Cycles
- 3-file cycle: `src/modules/event/services/index.ts -> src/modules/event/services/message-flow.service.ts -> src/modules/routing/services/routing-engine.service.ts -> src/modules/event/services/index.ts`

## Hyperedges (group relationships)
- **Core Backend Services** — implementation_status_ae_registry_service, implementation_status_routing_engine_service, implementation_status_mapping_engine_service, implementation_status_event_tracer_service, implementation_status_message_pipeline_service [EXTRACTED 1.00]
- **Seeded Application Entities for Demo** — implementation_status_healthstack_ae, implementation_status_dcm4chee_ae, implementation_status_openelis_ae [EXTRACTED 1.00]
- **Enrichment Pipeline Stages** — enrichment_ai_inbound_enrichment, enrichment_ai_canonical_enrichment, enrichment_ai_outbound_enrichment [EXTRACTED 1.00]

## Communities (27 total, 1 thin omitted)

### Community 0 - "AE Registry"
Cohesion: 0.05
Nodes (35): Cron, HttpCode, AEStatus, AECreatePayload, AEFacilityProfile, AEListFilter, AEListResponse, AEResponse (+27 more)

### Community 1 - "Canonical Models"
Cohesion: 0.06
Nodes (23): Priority, Address, CanonicalMessage, CanonicalOrder, CanonicalPatient, ContactPoint, HumanName, Identifier (+15 more)

### Community 2 - "Message Enrichment"
Cohesion: 0.08
Nodes (42): MessageType, ProtocolType, AEMappingBinding, ApplicationEntityContract, ContextEnrichmentResolveInput, ContextEnrichmentResult, FacilityEnrichment, IntegrationMetadataEnrichment (+34 more)

### Community 3 - "HL7 Parsing & Bootstrap"
Cohesion: 0.05
Nodes (15): Catch, AppModule, Module, GlobalExceptionFilter, bootstrap(), waitFor(), MockReceiverService, MockReceiverSnapshot (+7 more)

### Community 4 - "Validation Rules"
Cohesion: 0.06
Nodes (25): ValidationAction, ValidationActionType, ValidationExecutionResult, ValidationFailureResponse, ValidationRule, getValueByPath(), parsePath(), PathToken (+17 more)

### Community 5 - "Mapping Engine"
Cohesion: 0.09
Nodes (18): LookupConfig, MappingContext, MappingEngine, MappingResult, MappingStep, MappingTransformation, StandardMapping, MappingController (+10 more)

### Community 6 - "Event & Status Enums"
Cohesion: 0.09
Nodes (18): EventType, MessageStatus, EventMetadata, EventSnapshot, EventStream, EventTracer, MessageEvent, MessageEventAuditEntry (+10 more)

### Community 7 - "Message Routing"
Cohesion: 0.10
Nodes (18): RouteStatus, HDIdentifier, RouteCondition, RouteEvaluationContext, RouteEvaluationResult, RoutingRule, RoutingTable, MessagePipelineContext (+10 more)

### Community 8 - "Docker & Services"
Cohesion: 0.09
Nodes (24): health-interoperability-switch Docker Service, AE Contract, AE Registry Service, Canonical Patient & Order Model, DCM4CHEE AE, Event Tracer Service, FHIR Bridge (HTTP), FHIR R4 Module (+16 more)

### Community 9 - "NestJS Modules"
Cohesion: 0.16
Nodes (18): AEModule, Module, CoreModule, Module, EventModule, Module, FHIRModule, Module (+10 more)

### Community 10 - "Package Dependencies"
Cohesion: 0.08
Nodes (26): dependencies, axios, class-transformer, class-validator, hl7-standard, jest, @nestjs/common, @nestjs/config (+18 more)

### Community 11 - "FHIR Bridge & Validation"
Cohesion: 0.13
Nodes (6): FHIRBridgeService, Injectable, FHIRValidatorService, Injectable, HL7StandardValidatorService, Injectable

### Community 12 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (20): compilerOptions, declaration, declarationMap, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, lib (+12 more)

### Community 13 - "Message Flow Controller"
Cohesion: 0.19
Nodes (7): MessageFlowController, Body, Controller, Get, Param, Post, Query

### Community 14 - "Database Entities"
Cohesion: 0.23
Nodes (7): RoutingTableEntity, Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn

### Community 15 - "Enrichment Providers"
Cohesion: 0.23
Nodes (11): Canonical Enrichment Stage, ContextEnrichmentService, DicomWorklistProvider, Enrichment Context Model, FacilityEnrichmentProvider, Inbound Enrichment Stage, OpenElisAccessionProvider, Outbound Enrichment Stage (+3 more)

### Community 16 - "NPM Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, lint, start, start:debug, start:dev, start:prod (+3 more)

### Community 17 - "Validation Entity"
Cohesion: 0.20
Nodes (9): CommonModule, Module, Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn (+1 more)

### Community 18 - "Package Metadata"
Cohesion: 0.22
Nodes (8): author, description, keywords, license, main, name, type, version

### Community 19 - "Jest Configuration"
Cohesion: 0.22
Nodes (9): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+1 more)

### Community 20 - "App Controller"
Cohesion: 0.28
Nodes (5): AppController, Controller, Get, ModulesModule, Module

### Community 21 - "Database Seeder"
Cohesion: 0.33
Nodes (3): SeederService, Injectable, InjectRepository

### Community 22 - "Mapping Entity"
Cohesion: 0.22
Nodes (8): StandardMappingEntity, Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn, InjectRepository

### Community 23 - "Application Entity"
Cohesion: 0.25
Nodes (8): DeleteDateColumn, ApplicationEntityEntity, Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn

### Community 24 - "Dev Dependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @nestjs/cli, @nestjs/testing, ts-jest, @types/jest

## Knowledge Gaps
- **120 isolated node(s):** `name`, `version`, `description`, `main`, `build` (+115 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ProtocolType` connect `Message Enrichment` to `AE Registry`, `Canonical Models`, `Validation Rules`, `Mapping Engine`, `Event & Status Enums`, `Message Routing`, `Database Entities`, `Application Entity`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `AERegistryService` connect `AE Registry` to `Canonical Models`, `Message Enrichment`, `Message Routing`, `NestJS Modules`, `FHIR Bridge & Validation`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `MessageFlowService` connect `Message Enrichment` to `Event & Status Enums`, `NestJS Modules`, `FHIR Bridge & Validation`, `Message Flow Controller`, `Database Entities`, `Mapping Entity`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _120 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AE Registry` be split into smaller, more focused modules?**
  _Cohesion score 0.05333333333333334 - nodes in this community are weakly interconnected._
- **Should `Canonical Models` be split into smaller, more focused modules?**
  _Cohesion score 0.05879692446856626 - nodes in this community are weakly interconnected._
- **Should `Message Enrichment` be split into smaller, more focused modules?**
  _Cohesion score 0.07688492063492064 - nodes in this community are weakly interconnected._