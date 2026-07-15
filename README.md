# Healthcare Interoperability Switch

Production-ready Healthcare Transaction Switching Platform inspired by Postilion architecture. Routes, maps, and transforms healthcare messages between protocols (HL7 v2, FHIR R4) with dynamic rule-based routing and real-time event tracing.

Part of the [RxSoft monorepo](https://github.com/anomalyco/rxsoft).

## Stack

| Aspect | Technology |
|---|---|
| Runtime | Node.js |
| Framework | NestJS 11 |
| Database | SQLite (dev/test) / PostgreSQL (prod) |
| ORM | TypeORM 0.3 |
| Auth | JWT + Passport |
| Validation | class-validator + class-transformer |
| Scheduler | `@nestjs/schedule` |
| PM | npm |

## Quick Start

```bash
npm install
npm run dev  # ts-node development mode
```

The API defaults to **port 3000** (configurable via `PORT`).

## Modules

| Module | Description |
|---|---|
| **ae** | Application Entity registry — CRUD for AE definitions |
| **routing** | Rule-based message routing with conditions and table evaluation |
| **mapping** | Template-based message transformation (HL7 ↔ Canonical, FHIR ↔ Canonical) |
| **hl7** | HL7 v2 parser, transformer, TCP bridge (port 2575) |
| **fhir** | FHIR R4 validator, transformer, HTTP bridge |
| **event** | Real-time audit and event tracing |
| **core** | Canonical data models (Patient, Order), shared types |
| **health** | Health check endpoint |
| **validation** | Message validation rules |

## Architecture

- **Phases 1–4 complete**: Canonical models, backend core, protocol layer, integration flows
- **Phases 5–7 (next)**: React dashboard, graph visualization, trace explorer
- Auto-seeding of demo data on startup (AEs, mappings, routes)
- Configurable database: SQLite (no setup) / PostgreSQL (connection pool)
- Bridges: HL7 via TCP/MLLP on port 2575, FHIR via HTTP REST

## End-to-End Flow

1. Message arrives at `POST /api/v1/flow/healthstack/order` or `/patient`
2. AE lookups and routing rules evaluate the destination
3. Message is mapped from source protocol to canonical model
4. Canonical model is mapped to target protocol (HL7 for DCM4CHEE, FHIR for OpenELIS)
5. Message is sent via the appropriate bridge (TCP for HL7, HTTP for FHIR)
6. Event is traced and logged

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Development mode (ts-node, not nest start) |
| `npm run build` | Compile TypeScript |
| `npm run start:prod` | Production start |
| `npm test` | Unit tests |
| `npm run test:cov` | Test coverage |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | 3000 | Server port |
| `DB_TYPE` | `sqlite` | Database type (`sqlite` or `postgres`) |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_USER` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `DB_NAME` | `health_interop_db` | Database name |
| `DB_LOGGING` | `false` | TypeORM query logging |
| `NODE_ENV` | `development` | Environment |
| `SWITCH_AE_ID` | `switch` | This switch's AE identifier |
| `SWITCH_APPLICATION_NAME` | `HEALTH_INTEROPERABILITY_SWITCH` | Application name for HL7 |
| `SWITCH_APPLICATION_NAMESPACE_ID` | `HEALTH_INTEROPERABILITY_SWITCH` | HL7 namespace |
| `SWITCH_APPLICATION_UUID` | — | Application UUID |
| `SWITCH_APPLICATION_ID_TYPE` | `UUID` | ID type |
| `CODING_CONCEPT_BASE_URL` | `http://127.0.0.1:8004/api/v1` | Healthcare Concepts API base |
| `ENABLE_ROUTE_VALIDATIONS` | `true` | Toggle route validation |

## API Endpoints

### Application Entities
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/aes` | List all AEs |
| `POST` | `/api/v1/aes` | Create AE |
| `GET` | `/api/v1/aes/:id` | Get AE details |
| `PUT` | `/api/v1/aes/:id` | Update AE |
| `DELETE` | `/api/v1/aes/:id` | Delete AE |

### Message Processing
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/flow/healthstack/order` | Process order from Healthstack |
| `POST` | `/api/v1/flow/healthstack/patient` | Process patient from Healthstack |

### Health
| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service health check |

## Database

- **Development/Testing**: SQLite in-memory (no setup required)
- **Production**: PostgreSQL with connection pooling
- Auto-seeds demo data: AEs (Healthstack HL7, DCM4CHEE HL7, OpenELIS FHIR), mappings, routing rules

## See Also

- [`../BACKEND_SEARCH_ARCHITECTURE.md`](https://github.com/anomalyco/rxsoft/blob/main/BACKEND_SEARCH_ARCHITECTURE.md) — List/search endpoint standards
- [`../AGENTS.md`](https://github.com/anomalyco/rxsoft/blob/main/AGENTS.md) — Monorepo overview
