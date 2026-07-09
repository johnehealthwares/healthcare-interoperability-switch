# Auth Guard — healthcare-interoperability-switch

## Purpose

Add authentication to switch endpoints.

## When to invoke

When protecting endpoints or adding service-to-service auth.

## When not to invoke

For health check or public webhook endpoints.

## Workflow

1. `@nestjs/jwt` and `passport` are already in dependencies. Create a `JwtAuthGuard` that validates `JWT_ACCESS_SECRET`.
2. Support `x-api-key` header for internal service-to-service calls (like the mock receiver pattern).
3. Register globally with `APP_GUARD`, add `@Public()` for opt-out.

## Refactoring

This package currently has **no authentication** — JWT libraries are installed but unused. Add auth by following the rxsoft-identity pattern:
- Validate Bearer token against shared `JWT_ACCESS_SECRET`
- Support `x-api-key` for internal calls
- Add `@CurrentUser()` decorator