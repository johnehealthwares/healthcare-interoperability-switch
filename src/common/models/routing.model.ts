import { RouteStatus, MessageType, ProtocolType } from '../enums';
import { HDIdentifier } from './ae.model';

export interface RouteCondition {
  field: string;
  operator:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'regex'
    | 'in'
    | 'between'
    | 'gt'
    | 'lt'
    | 'gte'
    | 'lte';
  value: any;
  jsonPath?: string;
}

export interface RoutingRule {
  id: string;
  name: string;
  description?: string;
  priority: number;
  sourceAE: string;
  targetAE: string;
  applicationId?: string;
  applicationName?: string;
  applicationIdentifier?: HDIdentifier;
  messageType: MessageType;
  protocol?: ProtocolType;
  conditions: RouteCondition[];
  mappingId?: string;
  enrichmentIds?: string[];
  enrichmentConfig?: {
    enabled?: boolean;
    useCodingServer?: boolean;
    metadata?: boolean;
    mode?: 'search' | 'match';
    stopOnLookupMiss?: boolean;
  };
  validationIds?: string[];
  validationConfig?: {
    enabled?: boolean;
    useCodingServer?: boolean;
    metadata?: boolean;
    mode?: 'search' | 'match';
  };
  enabled: boolean;
  status: RouteStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutingTable {
  id: string;
  name: string;
  description?: string;
  routes: RoutingRule[];
  defaultRoute?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteEvaluationContext {
  message: any;
  sourceAE: string;
  targetAE?: string;
  metadata?: Record<string, any>;
}

export interface RouteEvaluationResult {
  matched: boolean;
  route?: RoutingRule;
  targetAE: string;
  applicationId?: string;
  applicationName?: string;
  mappingId?: string;
  metadata?: Record<string, any>;
}
