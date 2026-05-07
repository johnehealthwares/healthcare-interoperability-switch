# Healthcare Interoperability Switch - Backend Introduction

## Overview

The Healthcare Interoperability Switch Backend is a production-ready platform for healthcare transaction switching, inspired by Postilion architecture. It facilitates seamless communication between healthcare systems using multiple protocols including HL7 v2, FHIR R4, HTTP, TCP, and custom JSON formats.

Key features include:
- **Multi-Protocol Support**: Handles HL7 v2 and FHIR R4 messages with dedicated parsers, transformers, and bridges.
- **Canonical Model**: Unified internal data representation for patients, orders, and other entities.
- **Dynamic Routing**: Rule-based message routing with conditional logic.
- **Flexible Mapping**: Template-based message transformations.
- **Event Tracing**: Real-time audit and event tracking system.
- **Database Support**: PostgreSQL for production, SQLite for testing/development.
- **Auto-Seeding**: Pre-configured Application Entities (AEs), mappings, and routes for demo purposes.

## Architecture

The backend is built using NestJS, a progressive Node.js framework for building efficient and scalable server-side applications. It follows a modular architecture with the following key modules:

- **Core Module**: Contains entities, services, and repositories for core functionality (Application Entities, Routing Tables, Mappings, Events, Validation Rules).
- **AE Module**: Manages Application Entities (AEs) that represent external systems or endpoints.
- **Routing Module**: Handles dynamic routing of messages based on rules and conditions.
- **Mapping Module**: Provides template-based message transformation capabilities.
- **Event Module**: Manages event tracing and auditing.
- **HL7 Module**: Implements HL7 v2 protocol support with TCP bridges.
- **FHIR Module**: Implements FHIR R4 protocol support with HTTP bridges.
- **Validation Module**: Provides message validation rules and services.
- **Common Module**: Shared utilities, enums, models, types, and a seeder service for demo data.

The application uses TypeORM for database interactions, supporting both SQLite (for development/testing) and PostgreSQL (for production). Configuration is managed via environment variables using NestJS ConfigModule.

## Setup and Running

### Prerequisites
- Node.js (version 18+ recommended)
- npm or yarn
- PostgreSQL (for production) or SQLite (for development)

### Installation
1. Navigate to the backend directory:
   ```bash
   cd ./health-interoperability-switch/
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create a `.env` file based on `.env.example` if available):
   - `DB_TYPE`: 'sqlite' or 'postgres'
   - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` (for PostgreSQL)
   - `PORT`: Server port (default 3000)

### Running the Application
- Development mode: `npm run dev`
- Production build: `npm run build` then `npm start`
- Testing: `npm test`

The API is accessible at `http://localhost:3000/api` with CORS enabled.

## Key Files and Structure
- `src/main.ts`: Application bootstrap with CORS and global prefix setup.
- `src/app.module.ts`: Root module importing all feature modules and configuring TypeORM.
- `src/modules/`: Feature modules organized by domain.
- `src/common/`: Shared utilities and seeder service.
- `package.json`: Dependencies including NestJS, TypeORM, HL7 library, etc.
- `tsconfig.json`: TypeScript configuration.

## Troubleshooting Frontend Build Issues

The admin frontend (`/Users/john/develop/rxsoft/rxsoft-admin`) is failing to build due to TypeScript errors in `src/features/communication/components/message-templates.tsx`. The errors indicate:

1. **Missing 'label' prop**: Components like `SelectField`, `JsonEditorField`, and `ConfirmDialog` do not accept a `label` prop, but the code is passing it.
2. **Type mismatches**: The `variables` and `metadata` fields expect `Record<string, unknown>` but are receiving `Record<string, unknown> | unknown[]`, causing incompatibility.

### Potential Fixes
- **Update component props**: Check the component definitions for `SelectFieldProps`, `JsonEditorFieldProps`, and `ConfirmDialogProps`. Remove invalid props like `label` and `description` if not supported.
- **Fix type handling**: Ensure `onChange` handlers for `variables` and `metadata` properly handle the expected types. Cast or validate the input to match `Record<string, unknown>`.
- **Component library updates**: Verify if the component library (likely a custom UI library) has been updated and props have changed. Update imports or component usage accordingly.
- **Type definitions**: Review and update TypeScript interfaces for `MessageTemplateFormState` to align with component expectations.

To debug further, run `pnpm build` in the frontend directory and address each error individually. If using a custom component library, consult its documentation or source code for correct prop usage.