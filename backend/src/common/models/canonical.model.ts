import { Priority } from '../enums';

export interface Identifier {
  system: string;
  value: string;
  type?: string;
}

export interface HumanName {
  use?: string;
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
}

export interface ContactPoint {
  system: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
}

export interface Address {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Period {
  start?: Date;
  end?: Date;
}

export interface Reference {
  reference: string;
  type?: string;
  identifier?: Identifier;
  display?: string;
}

/** Canonical Patient Model */
export interface CanonicalPatient {
  id: string;
  resourceType: 'Patient';
  identifiers: Identifier[];
  active: boolean;
  name: HumanName[];
  telecom?: ContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Address[];
  maritalStatus?: string;
  contact?: {
    relationship?: string[];
    name?: HumanName;
    telecom?: ContactPoint[];
    address?: Address;
    organization?: Reference;
    period?: Period;
  }[];
  generalPractitioner?: Reference[];
  managingOrganization?: Reference;
  link?: {
    other: Reference;
    type: 'replaced-by' | 'replaces' | 'refer' | 'seealso';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

/** Canonical Order (Service Request) Model */
export interface CanonicalOrder {
  id: string;
  resourceType: 'ServiceRequest';
  identifier: Identifier[];
  status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';
  priority: Priority;
  intent: 'proposal' | 'plan' | 'directive' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  category?: string[];
  code: {
    coding?: {
      system: string;
      code: string;
      display?: string;
    }[];
    text: string;
  };
  subject: Reference;
  encounter?: Reference;
  occurrenceDateTime?: string;
  occurrencePeriod?: Period;
  authoredOn: Date;
  requester?: Reference;
  performerType?: string;
  performer?: Reference[];
  locationCode?: string[];
  reasonCode?: string[];
  reasonReference?: Reference[];
  supportingInfo?: Reference[];
  specimen?: Reference[];
  note?: {
    author?: Reference;
    time?: Date;
    text: string;
  }[];
  patientInstruction?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Generic Canonical Message */
export interface CanonicalMessage {
  id: string;
  messageType: 'PATIENT' | 'ORDER';
  timestamp: Date;
  sourceAE: string;
  targetAE: string;
  payload: CanonicalPatient | CanonicalOrder;
  metadata?: Record<string, any>;
}
