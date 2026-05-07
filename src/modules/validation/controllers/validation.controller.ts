import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ValidationRuleService } from '../services';
import { ValidationRule } from '../../../common/models';

@Controller('v1/validations')
export class ValidationController {
  constructor(private readonly validationService: ValidationRuleService) {}

  @Get()
  async list() {
    return this.validationService.list();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.validationService.get(id);
  }

  @Post()
  async create(
    @Body()
    payload: Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    return this.validationService.create(payload);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() payload: Partial<ValidationRule>,
  ) {
    return this.validationService.update(id, payload);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.validationService.delete(id);
    return { success: true };
  }
}
