import { MessageType } from '../enums';
import { RouteCondition } from './routing.model';

export type ValidationActionType = 'coding-concept-exists';

export interface ValidationAction {
  type: ValidationActionType;
  module: string;
  codePath: string;
  searchMode?: 'search' | 'match';
  includeMetadata?: boolean;
}

export interface ValidationFailureResponse {
  statusCode: number;
  code: string;
  message: string;
}

export interface ValidationRule {
  id: string;
  name: string;
  description?: string;
  sourceAE?: string;
  messageType?: MessageType;
  enabled: boolean;
  conditions: RouteCondition[];
  action: ValidationAction;
  failureResponse: ValidationFailureResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationExecutionResult {
  id: string;
  name: string;
  passed: boolean;
  codeValue?: string;
  module?: string;
  metadata?: Record<string, any>;
  failure?: ValidationFailureResponse;
}
