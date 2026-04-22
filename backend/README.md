# Healthcare Interoperability Switch - Backend

A production-ready Healthcare Transaction Switching Platform inspired by Postilion architecture.

## Features

- **Multi-Protocol Support**: HL7 v2, FHIR R4, HTTP, TCP, Custom JSON
- **Canonical Model**: Unified internal representation
- **Dynamic Routing**: Rule-based message routing with conditions
- **Flexible Mapping**: Template-based message transformation
- **Event Tracing**: Real-time audit and trace system
- **Enterprise-Grade**: PostgreSQL + MongoDB for data persistence

## Architecture

### Phase 1: Architecture Definition ✅
- Canonical data models (Patient, Order)
- AE (Application Entity) contract
- Routing and mapping DSL
- Event lifecycle

### Phase 2: Backend Core ✅
- NestJS modular architecture
- AE Registry service
- Routing Engine
- Mapping Engine
- Event Tracer

### Phase 3: Protocol Layer (In Progress)
- HL7 v2 parser and transformer
- FHIR R4 converter
- Protocol simulators

### Phase 4-7: Frontend, Visualization, AI
- React dashboard
- Graph visualization
- Trace explorer

## Setup

```bash
npm install
npm run build
npm start
```

## Environment Variables

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=health_interop_db
NODE_ENV=development
PORT=3000
```

## API Endpoints

- `POST /api/v1/aes` - Register Application Entity
- `GET /api/v1/aes/:id` - Get AE details
- `POST /api/v1/routing/tables` - Create routing table
- `POST /api/v1/routing/tables/:id/evaluate` - Evaluate routing rules
- `POST /api/v1/mappings` - Create mapping
- `POST /api/v1/mappings/:id/map` - Transform message
