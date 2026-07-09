# Healthcare Interoperability Switch - Backend

A production-ready Healthcare Transaction Switching Platform inspired by Postilion architecture.

## Features

- **Multi-Protocol Support**: HL7 v2, FHIR R4, HTTP, TCP, Custom JSON
- **Canonical Model**: Unified internal representation
- **Dynamic Routing**: Rule-based message routing with conditions
- **Flexible Mapping**: Template-based message transformation
- **Event Tracing**: Real-time audit and trace system
- **Bridge Communication**: TCP/IP for HL7, HTTP for FHIR
- **Auto-Seeding**: Pre-configured AEs, mappings, and routes
- **Testing Support**: In-memory SQLite for testing, PostgreSQL for production
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

### Phase 3: Protocol Layer ✅
- HL7 v2 parser, transformer, and TCP bridge
- FHIR R4 validator, transformer, and HTTP bridge
- Protocol simulators and bridges

### Phase 4: Integration & Flows ✅
- Complete message flows: Healthstack → DCM4CHEE (HL7) + OpenELIS (FHIR)
- Auto-seeding of demo data
- Unit tests
- Configurable database (SQLite/PostgreSQL)

### Phase 5-7: Frontend, Visualization, AI (Next)
- React dashboard
- Graph visualization
- Trace explorer

## Setup

```bash
npm install
npm run build
npm run dev  # Development mode
```

## Environment Variables

```bash
# Database Configuration
DB_TYPE=sqlite  # or postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=health_interop_db

# Application
NODE_ENV=development
PORT=3000
DB_LOGGING=true
```

## API Endpoints

### Application Entities
- `GET /api/v1/aes` - List all AEs
- `POST /api/v1/aes` - Create AE
- `GET /api/v1/aes/:id` - Get AE details
- `PUT /api/v1/aes/:id` - Update AE
- `DELETE /api/v1/aes/:id` - Delete AE

### Message Processing
- `POST /api/v1/flow/healthstack/order` - Process order from Healthstack
- `POST /api/v1/flow/healthstack/patient` - Process patient from Healthstack

### Health Check
- `GET /health` - Service health check

## Testing

```bash
npm run test
npm run test:cov  # With coverage
```

## Database

- **Development/Testing**: Uses SQLite in-memory (no setup required)
- **Production**: PostgreSQL with connection pooling

## Bridges

- **HL7 Bridge**: TCP/IP server on port 2575, supports MLLP protocol
- **FHIR Bridge**: HTTP client for RESTful FHIR operations

## Demo Data

On startup, the application seeds:
- **AEs**: Healthstack (HL7), DCM4CHEE (HL7), OpenELIS (FHIR)
- **Mappings**: HL7 ↔ Canonical, FHIR ↔ Canonical
- **Routing**: Healthstack → DCM4CHEE + OpenELIS
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
