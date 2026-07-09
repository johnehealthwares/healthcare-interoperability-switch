# Healthcare Interoperability Switch Agent

## Overview

NestJS 11 healthcare transaction switching platform inspired by Postilion architecture. Port 3000. npm package manager.

## DB

SQLite (dev) / PostgreSQL (prod). `synchronize: true` in dev. 6 TypeORM entities: AEs, routing tables, mappings, events, streams, validation rules.

## Key commands

- `npm run dev` — `ts-node src/main.ts` (not nest start)
- `npm test` — unit tests

## Auth

**No authentication currently.** `@nestjs/jwt` and `passport` are in deps but unused. When adding: use shared `JWT_ACCESS_SECRET`, support `x-api-key` for service-to-service.

## Architecture

Canonical data model (`CanonicalPatient`, `CanonicalOrder`, `CanonicalMessage`) decouples protocol-specific formats. Full pipeline: detect protocol → parse to canonical → evaluate route → enrich context → map to target → dispatch → trace.

## Modules

- **ae**: Application Entity registry
- **core**: Core orchestration, entities, legacy pipeline
- **routing**: Dynamic message routing with condition matching
- **mapping**: Template-based transformation with JS expressions
- **event**: Message flow + event tracing
- **hl7**: HL7 v2 parser, transformer, TCP/MLLP bridge (port 2575)
- **fhir**: FHIR R4 validator, transformer, HTTP bridge
- **validation**: Code validation + context enrichment
- **health**: Cron-based health monitoring

## Refactoring deviations (fix when touching)

### List endpoints
- **No shared ListQueryDto** — raw `@Query()` params in all controllers
- **Pagination only in AE module** — mapping, routing, event, validation modules return all rows
- **No sort control** — API consumers can't sort
- **meta/pagination duplicate bug** — same as healthcare-concepts (shared copy of same flawed list.ts)
- `executeListQuery()` only works in AE module

### Auth
- **NO AUTHENTICATION** — `@nestjs/jwt` and `passport` installed but completely unused
- When adding: create `JwtAuthGuard`, register as `APP_GUARD` with `@Public()` support

### Tests (4 files — minimal)
- Unit tests: 3 files (pure mocks)
- E2E: 1 file (SQLite + MockReceiverService — good pattern)
- Needs more coverage, especially for mapping, routing, validation modules

### Seeding
- **NOT idempotent** — uses `create()` + `save()`, creates duplicates on every restart
- **No `SEED_ON_START` gate** — always seeds unconditionally
- **Fix**: add `SEED_ON_START` env var, make all seeds use upsert
- Seeds 6 AEs, 3 mappings, 2 validation rules, 4 routing rules

### Schema
- `synchronize: true` in dev, `synchronize: false` in prod via `NODE_ENV` — correct
- No migration files — needs them for production schema management