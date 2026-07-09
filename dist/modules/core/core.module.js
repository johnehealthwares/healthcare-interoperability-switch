"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModule = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("./services");
const ae_module_1 = require("../ae/ae.module");
const routing_module_1 = require("../routing/routing.module");
const mapping_module_1 = require("../mapping/mapping.module");
const event_module_1 = require("../event/event.module");
const hl7_module_1 = require("../hl7/hl7.module");
const fhir_module_1 = require("../fhir/fhir.module");
let CoreModule = class CoreModule {
};
exports.CoreModule = CoreModule;
exports.CoreModule = CoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ae_module_1.AEModule,
            routing_module_1.RoutingModule,
            mapping_module_1.MappingModule,
            event_module_1.EventModule,
            hl7_module_1.HL7Module,
            fhir_module_1.FHIRModule,
        ],
        providers: [services_1.MessagePipelineService],
        exports: [services_1.MessagePipelineService],
    })
], CoreModule);
//# sourceMappingURL=core.module.js.map