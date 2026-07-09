# Backend CRUD Resource — healthcare-interoperability-switch

## Purpose

Scaffold a new CRUD resource in the switch (entity + controller + service).

## When to invoke

When adding a new entity that needs CRUD endpoints.

## When not to invoke

When the resource is better modeled as a configuration (seeded data, not user-managed).

## Inputs

- **Entity name**
- **Table name**
- **Fields** with TypeORM decorators

## Workflow

1. Create TypeORM entity in `src/modules/{module}/entities/` with `@Entity()` and `@PrimaryGeneratedColumn('uuid')`.
2. Create service with CRUD methods — use `src/common/repository/list.ts` `executeListQuery()` for list endpoints.
3. Create controller with validated DTOs.
4. Register entity in module's `TypeOrmModule.forFeature()` and module in `ModulesModule`.

## Refactor

When adding entities, ensure they follow the existing pattern: soft-deletable where applicable, UUID primary keys, proper indexes on lookup columns.