# Seeding — healthcare-interoperability-switch

## Purpose

Add seed data for AEs, mappings, validation rules, or routing tables.

## When to invoke

When adding new seed configuration for development.

## Workflow

1. Add seed data to `SeederService` (implements `OnModuleInit`).
2. Use `upsertBy()` pattern with unique constraint keys (e.g., `{ facilityCode, name }` for AEs).
3. The service auto-seeds on startup — no env flag gating currently.

## Refactoring

Currently seeds unconditionally on startup. Add `SEED_ON_START` env flag gating to be consistent with other packages.