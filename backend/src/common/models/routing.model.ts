import { RouteStatus, MessageType, ProtocolType } from '../enums';

export interface RouteCondition {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'in' | 'between' | 'gt' | 'lt' | 'gte' | 'lte';
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
  messageType: MessageType;
  protocol?: ProtocolType;
  conditions: RouteCondition[];
  mappingId?: string;
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
  mappingId?: string;
  metadata?: Record<string, any>;
}
