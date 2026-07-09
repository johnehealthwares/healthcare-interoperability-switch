# healthcare-interoperability-switch — Status

## What it does

Healthcare transaction switching platform inspired by Postilion architecture. Routes and transforms messages between healthcare protocols (HL7 v2, FHIR R4) using a canonical internal model. Supports TCP/IP (HL7 MLLP) and HTTP bridges.

## Modules

| Module | Description |
|---|---|
| **ae** | Application Entity (AE) registry — systems registered for message exchange |
| **routing** | Rule-based message routing with conditions and routing tables |
| **mapping** | Template-based message transformation between formats |
| **event** | Event tracing, message flow tracking, audit trail |
| **validation** | Message validation rules |
| **hl7** | HL7 v2 parser, transformer, TCP bridge |
| **fhir** | FHIR R4 validator, transformer, HTTP bridge |
| **health** | Service health check |
| **core** | Shared entities (ApplicationEntity, RoutingTable, StandardMapping, Event, EventStream, ValidationRule) |

## Entrypoints

- `src/main.ts` — NestJS bootstrap via `ts-node` (not `nest start`). Swagger at `/docs`.

## Status

| Aspect | Status |
|---|---|
| **Pagination** | Only in AE module (via `executeListQuery` utility). All other modules return full result sets. |
| **Filter system** | Only in AE module. Uses string-based protocol (`TYPE|value|valueTo`) with 10 operators. |
| **Response envelope** | AE module uses `{ data, pagination, meta }`; other modules return raw arrays directly. |
| **Sort** | No sort control from API consumers. Only hardcoded sorts in event/validation modules. |
| **Tests** | Unit tests exist (`npm test`). |
| **Architecture** | Strong enum-driven design. Canonical model pattern for internal representations. Separate HL7 and FHIR transformer layers. |
| **Dev setup** | SQLite in-memory (no external DB). `npm run dev` uses `ts-node` directly. |
