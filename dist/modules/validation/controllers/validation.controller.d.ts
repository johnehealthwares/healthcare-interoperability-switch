import { ValidationRuleService } from '../services';
import { ValidationRule } from '../../../common/models';
export declare class ValidationController {
    private readonly validationService;
    constructor(validationService: ValidationRuleService);
    list(): Promise<ValidationRule[]>;
    get(id: string): Promise<ValidationRule>;
    create(payload: Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ValidationRule>;
    update(id: string, payload: Partial<ValidationRule>): Promise<ValidationRule>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=validation.controller.d.ts.map