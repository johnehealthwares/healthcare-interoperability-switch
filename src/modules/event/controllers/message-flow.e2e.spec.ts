import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { MockReceiverService } from '../services/mock-receiver.service';

jest.setTimeout(20000);

describe('Message Flow E2E', () => {
  let app: INestApplication;
  let mockReceiver: MockReceiverService;

  beforeAll(async () => {
    process.env.DB_TYPE = 'sqlite';
    process.env.MOCK_DCM4CHEE_HL7_PORT = '19080';
    process.env.MOCK_OPENELIS_FHIR_PORT = '19081';
    process.env.MOCK_CUSTOM_JSON_PORT = '19082';
    process.env.SWITCH_HL7_LISTENER_PORT = '19275';
    process.env.ENABLE_ROUTE_VALIDATIONS = 'false';
    process.env.SWITCH_APPLICATION_UUID = '00000000-0000-0000-0000-000000000099';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    app.setGlobalPrefix('api');
    await app.init();

    mockReceiver = moduleFixture.get(MockReceiverService);
    await mockReceiver.waitUntilReady();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    mockReceiver.reset();
  });

  it('routes custom radiology orders from HealthStack to DCM4CHEE', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/flow/healthstack/order-model')
      .send({
        orderModel: buildHealthstackOrder({
          id: 'custom-rad-1',
          patientId: 'patient-rad-1',
          order: 'Chest X-Ray',
          orderCategory: 'RADIOLOGY',
          targetAE: 'dcm4chee',
        }),
      })
      .expect(201);

    await waitFor(() => mockReceiver.snapshot().hl7Messages.length === 1);

    const snapshot = mockReceiver.snapshot();
    expect(response.body.success).toBe(true);
    expect(response.body.result.targetAE).toBe('dcm4chee');
    expect(snapshot.hl7Messages).toHaveLength(1);
    expect(snapshot.fhirResources).toHaveLength(0);
    expect(snapshot.hl7Messages[0]).toContain('PID|');
    expect(snapshot.hl7Messages[0]).toContain('OBR|1|custom-rad-1');
    expect(snapshot.hl7Messages[0]).toContain('Chest X-Ray');
  });

  it('routes custom laboratory orders from HealthStack to OpenELIS', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/flow/healthstack/order-model')
      .send({
        orderModel: buildHealthstackOrder({
          id: 'custom-lab-1',
          patientId: 'patient-lab-1',
          order: 'Complete Blood Count',
          orderCategory: 'LABORATORY',
          targetAE: 'openelis',
        }),
      })
      .expect(201);

    await waitFor(() => mockReceiver.snapshot().fhirResources.length === 1);

    const snapshot = mockReceiver.snapshot();
    expect(response.body.success).toBe(true);
    expect(response.body.result.targetAE).toBe('openelis');
    expect(snapshot.hl7Messages).toHaveLength(0);
    expect(snapshot.fhirResources).toHaveLength(1);
    expect(snapshot.fhirResources[0]).toMatchObject({
      resourceType: 'ServiceRequest',
      id: 'custom-lab-1',
      subject: { reference: 'Patient/patient-lab-1' },
    });
  });

  it('routes HL7 radiology orders from HealthStack to DCM4CHEE', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/flow/healthstack/order')
      .send({
        hl7Message: buildRadiologyHl7Order(),
        targetAE: 'dcm4chee',
      })
      .expect(201);

    await waitFor(() => mockReceiver.snapshot().hl7Messages.length === 1);

    const snapshot = mockReceiver.snapshot();
    expect(response.body.success).toBe(true);
    expect(response.body.result.targetAE).toBe('dcm4chee');
    expect(snapshot.fhirResources).toHaveLength(0);
    expect(snapshot.hl7Messages[0]).toContain('PID|');
    expect(snapshot.hl7Messages[0]).toContain('ORDER-RAD-2');
  });

  it('routes FHIR laboratory orders from HealthStack to OpenELIS', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/flow/healthstack/order-fhir')
      .send({
        targetAE: 'openelis',
        resource: {
          resourceType: 'ServiceRequest',
          id: 'fhir-lab-1',
          status: 'active',
          intent: 'order',
          priority: 'routine',
          category: [
            {
              text: 'LABORATORY',
            },
          ],
          code: {
            text: 'Complete Blood Count',
            coding: [
              {
                system: 'urn:test',
                code: 'CBC',
                display: 'Complete Blood Count',
              },
            ],
          },
          subject: {
            reference: 'Patient/patient-fhir-lab-1',
          },
          requester: {
            reference: 'Practitioner/doc-fhir-lab-1',
          },
          authoredOn: '2026-04-25T10:15:00.000Z',
        },
      })
      .expect(201);

    await waitFor(() => mockReceiver.snapshot().fhirResources.length === 1);

    const snapshot = mockReceiver.snapshot();
    expect(response.body.success).toBe(true);
    expect(response.body.result.targetAE).toBe('openelis');
    expect(snapshot.hl7Messages).toHaveLength(0);
    expect(snapshot.fhirResources[0]).toMatchObject({
      resourceType: 'ServiceRequest',
      id: 'fhir-lab-1',
      subject: {
        reference: 'Patient/patient-fhir-lab-1',
      },
    });
  });
});

function buildHealthstackOrder(input: {
  id: string;
  patientId: string;
  order: string;
  orderCategory: string;
  targetAE: string;
}) {
  return {
    _id: input.id,
    documentationId: input.id,
    order_category: input.orderCategory,
    order_code: input.order.replace(/\s+/g, '-').toUpperCase(),
    order: input.order,
    targetAE: input.targetAE,
    order_status: 'Pending',
    requestingdoctor_Id: 'doc-1',
    requestingdoctor_facilityId: 'facility-1',
    requestingdoctor_facilityname: 'HealthStack Hospital',
    clientId: input.patientId,
    clientname: 'Doe',
    client: {
      _id: input.patientId,
      firstname: 'Jane',
      lastname: 'Doe',
      dob: '1984-05-01',
      gender: 'F',
    },
    createdAt: '2026-04-25T09:00:00.000Z',
  };
}

function buildRadiologyHl7Order(): string {
  return [
    'MSH|^~\\&|HEALTHSTACK|HS|SWITCH|RX|202604251200||ORM^O01|MSG-RAD-2|P|2.5',
    'PID|1||PATIENT-RAD-2||Doe^Jane||19840501|F',
    'ORC|NW|ORDER-RAD-2|ORDER-RAD-2||||R',
    'OBR|1|ORDER-RAD-2|ORDER-RAD-2|RADIOLOGY CHEST XRAY|||202604251200',
  ].join('\r');
}

async function waitFor(
  predicate: () => boolean,
  timeoutMs: number = 2000,
  intervalMs: number = 50,
): Promise<void> {
  const start = Date.now();

  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('Timed out waiting for asynchronous condition');
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
