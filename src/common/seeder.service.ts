import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AEStatus,
  MessageType,
  ProtocolType,
  RouteStatus,
} from './enums';
import { ApplicationEntityEntity } from '../modules/core/entities/application-entity.entity';
import { RoutingTableEntity } from '../modules/core/entities/routing-table.entity';
import { StandardMappingEntity } from '../modules/core/entities/standard-mapping.entity';
import { ValidationRuleEntity } from '../modules/core/entities/validation-rule.entity';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(ApplicationEntityEntity)
    private readonly aeRepo: Repository<ApplicationEntityEntity>,
    @InjectRepository(RoutingTableEntity)
    private readonly routingRepo: Repository<RoutingTableEntity>,
    @InjectRepository(StandardMappingEntity)
    private readonly mappingRepo: Repository<StandardMappingEntity>,
    @InjectRepository(ValidationRuleEntity)
    private readonly validationRepo: Repository<ValidationRuleEntity>,
  ) {}

  async onModuleInit() {
    await this.seedAEs();
    await this.seedMappings();
    await this.seedValidations();
    await this.seedRouting();
  }

  private async seedAEs() {
    const dcmPort = Number(process.env.MOCK_DCM4CHEE_HL7_PORT || 18080);
    const openElisPort = Number(process.env.MOCK_OPENELIS_FHIR_PORT || 18081);
    const customPort = Number(process.env.MOCK_CUSTOM_JSON_PORT || 18082);
    const switchApplicationUuid =
      process.env.SWITCH_APPLICATION_UUID || '00000000-0000-0000-0000-000000000001';

    await this.aeRepo.save([
      this.aeRepo.create({
        id: process.env.SWITCH_AE_ID || 'switch',
        name: 'Switch',
        description: 'Internal switch identity used for outbound sending application/facility metadata.',
        status: AEStatus.ACTIVE,
        facilityId: 'SWITCH-FACILITY',
        facilityName: 'RxSoft Switch Facility',
        customId: switchApplicationUuid,
        facilityIdentifier: {
          namespaceId: 'RXSOFT_SWITCH',
          id: 'SWITCH-FACILITY',
          idType: 'UUID',
        },
        facility: {
          facilityId: 'SWITCH-FACILITY',
          facilityName: 'RxSoft Switch Facility',
          customId: switchApplicationUuid,
          identifier: {
            namespaceId: 'RXSOFT_SWITCH',
            id: 'SWITCH-FACILITY',
            idType: 'UUID',
          },
        },
        inboundCapabilities: [
          ProtocolType.CUSTOM_JSON,
          ProtocolType.HL7_V2,
          ProtocolType.FHIR_R4,
        ],
        outboundCapabilities: [
          ProtocolType.CUSTOM_JSON,
          ProtocolType.HL7_V2,
          ProtocolType.FHIR_R4,
        ],
        inboundConfig: [],
        outboundConfig: [],
        mappings: {
          inbound: [],
          outbound: [],
        },
        securitySettings: { tlsEnabled: false },
      }),
      this.aeRepo.create({
        id: 'healthstack',
        name: 'Healthstack',
        description: 'Source EMR that can submit orders in custom JSON',
        status: AEStatus.ACTIVE,
        facilityId: 'HS-FAC-001',
        facilityName: 'Healthstack Hospital',
        customId: 'HS',
        facilityIdentifier: {
          namespaceId: 'HEALTHSTACK',
          id: 'HS-FAC-001',
          idType: 'UUID',
        },
        facility: {
          facilityId: 'HS-FAC-001',
          facilityName: 'Healthstack Hospital',
          customId: 'HS',
          identifier: {
            namespaceId: 'HEALTHSTACK',
            id: 'HS-FAC-001',
            idType: 'UUID',
          },
        },
        inboundCapabilities: [
          ProtocolType.CUSTOM_JSON
        ],
        outboundCapabilities: [
          ProtocolType.CUSTOM_JSON
        ],
        inboundConfig: [
          {
            protocol: ProtocolType.CUSTOM_JSON,
            host: '127.0.0.1',
            port: 3000,
          }
        ],
        outboundConfig: [
          {
            protocol: ProtocolType.CUSTOM_JSON,
            host: '127.0.0.1',
            port: 3000,
          }
        ],
        mappings: {
          inbound: [
            {
              messageType: MessageType.ORDER,
              protocol: ProtocolType.CUSTOM_JSON,
              mappingId: 'healthstack-order-model-to-canonical',
            },
          ],
          outbound: [],
        },
        securitySettings: { tlsEnabled: false },
      }),
      this.aeRepo.create({
        id: 'dcm4chee',
        name: 'DCM4CHEE',
        description: 'Radiology downstream system receiving HL7 orders.',
        status: AEStatus.ACTIVE,
        facilityId: 'RAD-FAC-001',
        facilityName: 'DCM4CHEE Radiology',
        customId: 'DCM4CHEE',
        facilityIdentifier: {
          namespaceId: 'DCM4CHEE',
          id: 'RAD-FAC-001',
          idType: 'UUID',
        },
        facility: {
          facilityId: 'RAD-FAC-001',
          facilityName: 'DCM4CHEE Radiology',
          customId: 'DCM4CHEE',
          identifier: {
            namespaceId: 'DCM4CHEE',
            id: 'RAD-FAC-001',
            idType: 'UUID',
          },
        },
        inboundCapabilities: [ProtocolType.HL7_V2],
        outboundCapabilities: [ProtocolType.HL7_V2],
        inboundConfig: [
          {
            protocol: ProtocolType.HL7_V2,
            host: '127.0.0.1',
            port: dcmPort,
          },
        ],
        outboundConfig: [
          {
            protocol: ProtocolType.HL7_V2,
            host: '127.0.0.1',
            port: dcmPort,
          },
        ],
        mappings: {
          outbound: [
            {
              messageType: MessageType.ORDER,
              protocol: ProtocolType.HL7_V2,
            },
            {
              messageType: MessageType.PATIENT,
              protocol: ProtocolType.HL7_V2,
            },
          ],
        },
        securitySettings: { tlsEnabled: false },
      }),
      this.aeRepo.create({
        id: 'openelis',
        name: 'OpenELIS',
        description: 'Laboratory downstream system receiving FHIR resources.',
        status: AEStatus.ACTIVE,
        facilityId: 'LAB-FAC-001',
        facilityName: 'OpenELIS Laboratory',
        customId: 'OPENELIS',
        facilityIdentifier: {
          namespaceId: 'OPENELIS',
          id: 'LAB-FAC-001',
          idType: 'UUID',
        },
        facility: {
          facilityId: 'LAB-FAC-001',
          facilityName: 'OpenELIS Laboratory',
          customId: 'OPENELIS',
          identifier: {
            namespaceId: 'OPENELIS',
            id: 'LAB-FAC-001',
            idType: 'UUID',
          },
        },
        inboundCapabilities: [ProtocolType.FHIR_R4],
        outboundCapabilities: [ProtocolType.FHIR_R4],
        inboundConfig: [
          {
            protocol: ProtocolType.FHIR_R4,
            host: '127.0.0.1',
            port: openElisPort,
          },
        ],
        outboundConfig: [
          {
            protocol: ProtocolType.FHIR_R4,
            host: '127.0.0.1',
            port: openElisPort,
          },
        ],
        mappings: {
          outbound: [
            {
              messageType: MessageType.ORDER,
              protocol: ProtocolType.FHIR_R4,
            },
            {
              messageType: MessageType.PATIENT,
              protocol: ProtocolType.FHIR_R4,
            },
          ],
        },
        securitySettings: { tlsEnabled: false },
      }),
      this.aeRepo.create({
        id: 'mock-custom',
        name: 'Mock Custom Receiver',
        description: 'Custom JSON sink used for custom outbound mapping tests.',
        status: AEStatus.ACTIVE,
        facilityId: 'CUSTOM-FAC-001',
        facilityName: 'Mock Custom Receiver',
        customId: 'MOCK-CUSTOM',
        facilityIdentifier: {
          namespaceId: 'MOCK_CUSTOM',
          id: 'CUSTOM-FAC-001',
          idType: 'UUID',
        },
        facility: {
          facilityId: 'CUSTOM-FAC-001',
          facilityName: 'Mock Custom Receiver',
          customId: 'MOCK-CUSTOM',
          identifier: {
            namespaceId: 'MOCK_CUSTOM',
            id: 'CUSTOM-FAC-001',
            idType: 'UUID',
          },
        },
        inboundCapabilities: [ProtocolType.CUSTOM_JSON],
        outboundCapabilities: [ProtocolType.CUSTOM_JSON],
        inboundConfig: [
          {
            protocol: ProtocolType.CUSTOM_JSON,
            host: '127.0.0.1',
            port: customPort,
          },
        ],
        outboundConfig: [
          {
            protocol: ProtocolType.CUSTOM_JSON,
            host: '127.0.0.1',
            port: customPort,
          },
        ],
        mappings: {
          outbound: [
            {
              messageType: MessageType.ORDER,
              protocol: ProtocolType.CUSTOM_JSON,
              mappingId: 'canonical-order-to-custom-json',
            },
          ],
        },
        securitySettings: { tlsEnabled: false },
      }),
    ]);
  }

  private async seedMappings() {
    await this.mappingRepo.save([
      this.mappingRepo.create({
        id: 'healthstack-order-model-to-canonical',
        name: 'HealthStack Order Model -> Canonical',
        description:
          'Maps the Feathers/Mongoose order payload produced by HealthStack into the switch canonical envelope.',
        sourceProtocol: ProtocolType.CUSTOM_JSON,
        targetProtocol: 'CANONICAL',
        sourceMessageType: MessageType.ORDER,
        targetMessageType: MessageType.ORDER,
        version: '1.0.0',
        active: true,
        mappingSteps: [
          {
            id: '1',
            name: 'Message Type',
            type: 'field-map',
            sourceField: '',
            targetField: 'messageType',
            transformation: '"ORDER"',
          },
          {
            id: '2',
            name: 'Order Id',
            type: 'field-map',
            sourceField: '_id',
            targetField: 'order.id',
            transformation: 'String(value || sourceMessage.documentationId || "")',
          },
          {
            id: '3',
            name: 'Order Identifier',
            type: 'field-map',
            sourceField: 'documentationId',
            targetField: 'order.identifier[0].value',
            transformation:
              'String(value || sourceMessage._id || sourceMessage.order || "unknown-order")',
          },
          {
            id: '4',
            name: 'Order Identifier System',
            type: 'field-map',
            sourceField: '',
            targetField: 'order.identifier[0].system',
            transformation: '"urn:healthstack:order"',
          },
          {
            id: '5',
            name: 'Order Code',
            type: 'field-map',
            sourceField: 'order_code',
            targetField: 'order.code.code',
            transformation:
              'String(value || sourceMessage.code || sourceMessage.order || sourceMessage.order_category || "UNKNOWN")',
          },
          {
            id: '6',
            name: 'Order Display',
            type: 'field-map',
            sourceField: 'order',
            targetField: 'order.code.display',
            transformation:
              'String(value || sourceMessage.code_display || sourceMessage.order_category || "Unknown")',
          },
          {
            id: '7',
            name: 'Authored On',
            type: 'field-map',
            sourceField: 'createdAt',
            targetField: 'order.authoredOn',
            transformation: 'value ? new Date(value).toISOString() : now',
          },
          {
            id: '8',
            name: 'Requester',
            type: 'field-map',
            sourceField: 'requestingdoctor_Id',
            targetField: 'order.requester.id',
            transformation:
              'String(value || sourceMessage.requestingdoctor_facilityId || "unknown-requester")',
          },
          {
            id: '9',
            name: 'Patient Subject',
            type: 'field-map',
            sourceField: 'clientId',
            targetField: 'order.subject.id',
            transformation:
              'String(value || sourceMessage.client?._id || sourceMessage.client?.id || "unknown-patient")',
          },
          {
            id: '10',
            name: 'Order Status',
            type: 'field-map',
            sourceField: 'order_status',
            targetField: 'order.status',
            transformation:
              'String(value || "active").toLowerCase() === "pending" ? "active" : String(value || "active").toLowerCase()',
          },
          {
            id: '11',
            name: 'Order Priority',
            type: 'field-map',
            sourceField: 'priority',
            targetField: 'order.priority',
            transformation: 'String(value || "ROUTINE").toUpperCase()',
          },
          {
            id: '12',
            name: 'Order Category Metadata',
            type: 'field-map',
            sourceField: 'order_category',
            targetField: 'metadata.orderCategory',
            transformation: 'String(value || sourceMessage.order || "").toUpperCase()',
          },
          {
            id: '13',
            name: 'Target AE',
            type: 'field-map',
            sourceField: 'targetAE',
            targetField: 'metadata.targetAE',
            transformation:
              'String(value || sourceMessage.targetAe || sourceMessage.destination_ae || "")',
          },
          {
            id: '14',
            name: 'Patient Id',
            type: 'field-map',
            sourceField: 'clientId',
            targetField: 'patient.id',
            transformation:
              'String(value || sourceMessage.client?._id || sourceMessage.client?.id || "unknown-patient")',
          },
          {
            id: '15',
            name: 'Patient Identifier Value',
            type: 'field-map',
            sourceField: 'clientId',
            targetField: 'patient.identifier[0].value',
            transformation:
              'String(value || sourceMessage.client?._id || sourceMessage.client?.id || "unknown-patient")',
          },
          {
            id: '16',
            name: 'Patient Identifier System',
            type: 'field-map',
            sourceField: '',
            targetField: 'patient.identifier[0].system',
            transformation: '"urn:healthstack:patient"',
          },
          {
            id: '17',
            name: 'Patient Family Name',
            type: 'field-map',
            sourceField: 'client.lastname',
            targetField: 'patient.name.family',
            transformation:
              'String(value || sourceMessage.clientname || sourceMessage.client?.family || "Unknown")',
          },
          {
            id: '18',
            name: 'Patient Given Name',
            type: 'field-map',
            sourceField: 'client.firstname',
            targetField: 'patient.name.given[0]',
            transformation:
              'String(value || sourceMessage.client?.given?.[0] || "Patient")',
          },
          {
            id: '19',
            name: 'Patient Birth Date',
            type: 'field-map',
            sourceField: 'client.dob',
            targetField: 'patient.birthDate',
            transformation:
              'value ? new Date(value).toISOString().split("T")[0] : (sourceMessage.client?.dateOfBirth || undefined)',
          },
          {
            id: '20',
            name: 'Patient Gender',
            type: 'field-map',
            sourceField: 'client.gender',
            targetField: 'patient.gender',
            transformation:
              'String(value || "unknown").toUpperCase() === "F" ? "female" : String(value || "unknown").toUpperCase() === "M" ? "male" : String(value || "unknown").toLowerCase()',
          },
        ],
      }),
      this.mappingRepo.create({
        id: 'canonical-order-to-custom-json',
        name: 'Canonical Order -> Custom JSON',
        description: 'Example outbound mapping for custom JSON sinks.',
        sourceProtocol: 'CANONICAL',
        targetProtocol: ProtocolType.CUSTOM_JSON,
        sourceMessageType: MessageType.ORDER,
        targetMessageType: MessageType.ORDER,
        version: '1.0.0',
        active: true,
        mappingSteps: [
          {
            id: '1',
            name: 'Order Reference',
            type: 'field-map',
            sourceField: 'order.id',
            targetField: 'orderReference',
            transformation: 'String(value || "")',
          },
          {
            id: '2',
            name: 'Patient Id',
            type: 'field-map',
            sourceField: 'patient.id',
            targetField: 'patientId',
            transformation: 'String(value || sourceMessage.order?.subject?.id || "")',
          },
          {
            id: '3',
            name: 'Patient Name',
            type: 'field-map',
            sourceField: 'patient.name.family',
            targetField: 'patientName',
            transformation:
              '[value, sourceMessage.patient?.name?.given?.[0]].filter(Boolean).join(", ")',
          },
          {
            id: '4',
            name: 'Requested Test',
            type: 'field-map',
            sourceField: 'order.code.display',
            targetField: 'requestedTest',
            transformation:
              'String(value || sourceMessage.order?.code?.code || sourceMessage.metadata?.orderCategory || "Unknown")',
          },
          {
            id: '5',
            name: 'Normalized Category',
            type: 'field-map',
            sourceField: 'metadata.orderCategory',
            targetField: 'orderCategory',
            transformation: 'String(value || "")',
          },
        ],
      }),
    ]);
  }

  private async seedValidations() {
    await this.validationRepo.save([
      this.validationRepo.create({
        id: 'validate-laboratory-loinc-code',
        name: 'Validate Laboratory LOINC Code',
        description:
          'Ensure laboratory orders reference a valid LOINC code before dispatch.',
        sourceAE: 'healthstack',
        messageType: MessageType.ORDER,
        enabled: true,
        conditions: [
          {
            field: 'metadata.orderCategory',
            operator: 'equals',
            value: 'LABORATORY',
          },
        ],
        action: {
          type: 'coding-concept-exists',
          module: 'LOINC',
          codePath: 'order.code.code',
          searchMode: 'search',
          includeMetadata: false,
        },
        failureResponse: {
          statusCode: 422,
          code: 'LABORATORY_CODE_NOT_FOUND',
          message:
            'The canonical order code was not found in the coding concept service for module LOINC.',
        },
      }),
      this.validationRepo.create({
        id: 'validate-radiology-dicom-code',
        name: 'Validate Radiology DICOM Code',
        description:
          'Ensure radiology orders reference a valid DICOM code before dispatch.',
        sourceAE: 'healthstack',
        messageType: MessageType.ORDER,
        enabled: true,
        conditions: [
          {
            field: 'metadata.orderCategory',
            operator: 'equals',
            value: 'RADIOLOGY',
          },
        ],
        action: {
          type: 'coding-concept-exists',
          module: 'DICOM',
          codePath: 'order.code.code',
          searchMode: 'search',
          includeMetadata: false,
        },
        failureResponse: {
          statusCode: 422,
          code: 'RADIOLOGY_CODE_NOT_FOUND',
          message:
            'The canonical order code was not found in the coding concept service for module DICOM.',
        },
      }),
    ]);
  }

  private async seedRouting() {
    await this.routingRepo.save(
      this.routingRepo.create({
        id: 'default-routing',
        name: 'Default Routing',
        description: 'Dynamic order routing from Healthstack to downstream systems.',
        defaultRoute: null as any,
        routes: [
          {
            id: 'route-order-dcm4chee',
            name: 'Healthstack Order -> DCM4CHEE',
            description: 'Orders explicitly targeting DCM4CHEE are sent as HL7.',
            priority: 1,
            sourceAE: 'healthstack',
            targetAE: 'dcm4chee',
            applicationId: process.env.DCM4CHEE_APPLICATION_ID || 'DCM4CHEE-ORM',
            applicationName: process.env.DCM4CHEE_APPLICATION_NAME || 'DCM4CHEE',
            applicationIdentifier: {
              namespaceId: process.env.DCM4CHEE_APPLICATION_NAMESPACE_ID || 'DCM4CHEE_APP',
              id: process.env.DCM4CHEE_APPLICATION_ID || 'DCM4CHEE-ORM',
              idType: process.env.DCM4CHEE_APPLICATION_ID_TYPE || 'UUID',
            },
            messageType: MessageType.ORDER,
            protocol: ProtocolType.HL7_V2,
            conditions: [],
            validationIds: ['validate-radiology-dicom-code'],
            validationConfig: {
              enabled: true,
              useCodingServer: true,
              mode: 'search',
            },
            enabled: true,
            status: RouteStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'route-order-openelis',
            name: 'Healthstack Order -> OpenELIS',
            description: 'Orders explicitly targeting OpenELIS are sent as FHIR.',
            priority: 2,
            sourceAE: 'healthstack',
            targetAE: 'openelis',
            applicationId: process.env.OPENELIS_APPLICATION_ID || 'OPENELIS-SR',
            applicationName: process.env.OPENELIS_APPLICATION_NAME || 'OPENELIS',
            applicationIdentifier: {
              namespaceId: process.env.OPENELIS_APPLICATION_NAMESPACE_ID || 'OPENELIS_APP',
              id: process.env.OPENELIS_APPLICATION_ID || 'OPENELIS-SR',
              idType: process.env.OPENELIS_APPLICATION_ID_TYPE || 'UUID',
            },
            messageType: MessageType.ORDER,
            protocol: ProtocolType.FHIR_R4,
            conditions: [],
            validationIds: ['validate-laboratory-loinc-code'],
            validationConfig: {
              enabled: true,
              useCodingServer: true,
              mode: 'search',
            },
            enabled: true,
            status: RouteStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'route-patient-default',
            name: 'Healthstack Patient -> DCM4CHEE',
            description: 'Patient updates are forwarded to DCM4CHEE as HL7 ADT.',
            priority: 10,
            sourceAE: 'healthstack',
            targetAE: 'dcm4chee',
            applicationId: process.env.DCM4CHEE_APPLICATION_ID || 'DCM4CHEE-ADT',
            applicationName: process.env.DCM4CHEE_APPLICATION_NAME || 'DCM4CHEE',
            applicationIdentifier: {
              namespaceId: process.env.DCM4CHEE_APPLICATION_NAMESPACE_ID || 'DCM4CHEE_APP',
              id: process.env.DCM4CHEE_APPLICATION_ID || 'DCM4CHEE-ADT',
              idType: process.env.DCM4CHEE_APPLICATION_ID_TYPE || 'UUID',
            },
            messageType: MessageType.PATIENT,
            protocol: ProtocolType.HL7_V2,
            conditions: [],
            enabled: true,
            status: RouteStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    );
  }
}
