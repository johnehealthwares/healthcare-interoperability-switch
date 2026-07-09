# Backend List Endpoint — healthcare-interoperability-switch

## Purpose

Create or fix list/search endpoints in the switch following `BACKEND_SEARCH_ARCHITECTURE.md`.

## When to invoke

When adding or modifying a list endpoint in any module (ae, routing, mapping, event, validation).

## When not to invoke

For single-entity retrieval or non-NestJS.

## Inputs

- **Module** (ae, routing, mapping, event, validation)
- **Entity name**
- **Searchable columns**
- **Filterable columns**

## Workflow

1. Use the existing `executeListQuery()` from `src/common/repository/list.ts` which supports `page`, `limit`, and the filter DSL (`field=TYPE|value|valueTo`).

2. Add a validated DTO in the module's `dto/` directory extending a base `ListQueryDto`.

3. Controller returns `{ data, meta: { page, limit, total } }`.

4. **Refactoring**: If the module returns all rows without pagination, add pagination support.

## Refactoring consistency

Known deviations:
- **Pagination only in AE module** — every other module returns all rows unfiltered
- **No sort control** — API consumers cannot sort results
- **No DTO validation** — controllers accept raw query params
- **Fix**: spread `executeListQuery` to all modules, add `sortBy`/`sortOrder`, add validated DTOs