
⚙️ FRONTEND MODULE STRUCTURE
Dashboard
Graph View (core)
Trace Explorer
Message Tester
Audit Center
Config Center (AE + Routing + Mapping)
🧠 DYNAMIC FORM SYSTEM (IMPORTANT)

Implement JSON Schema-driven UI forms using EAV-style rendering:

Fields rendered dynamically from schema
Conditional visibility:
field only appears if attribute checkbox is checked  like the way its done for optional columns on a table

Example:

“Enable Custom Attribute”
→ reveals dynamic input fields
🤖 AGENT-ASSISTED DEVELOPMENT PHASES
Phase 1 — Architecture Definition
canonical model
AE model
routing model
mapping DSL
event lifecycle

👉 Output = contracts only

Phase 2 — Backend Core (NestJS)
AE registry
routing engine
mapping engine
message pipeline
Phase 3 — Protocol Layer
HL7 module
FHIR module
simulators
ingestion pipeline
Phase 4 — Frontend
React UI
dashboards
forms
configuration tools
Phase 5 — Graph Visualization

Use:

React Flow
Cytoscape
D3.js
Phase 6 — Trace & Audit UI
timeline view
diff viewer
step-by-step inspector
Phase 7 — AI Assistance Layer
mapping generator
debug assistant
test generator
🏦 FINTECH ANALOGY
Concept	Equivalent
AE	ATM / Bank node
HL7/FHIR	ISO8583 messages
Routing engine	Switch routing logic
Mapping engine	Message formatter
Audit logs	Transaction trace
Graph UI	Network monitor
🎯 FINAL OUTPUT REQUIREMENT
