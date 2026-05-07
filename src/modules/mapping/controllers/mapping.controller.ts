import { Controller, Post, Get, Put, Body, Param, Query } from '@nestjs/common';
import { MappingEngineService } from '../services';
import { StandardMapping, MappingContext } from '../../../common/models';

@Controller('v1/mappings')
export class MappingController {
  constructor(private mappingService: MappingEngineService) {}

  @Post()
  async createMapping(
    @Body() mapping: Omit<StandardMapping, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    return this.mappingService.createMapping(mapping);
  }

  @Get(':id')
  async getMapping(@Param('id') id: string) {
    return this.mappingService.getMapping(id);
  }

  @Put(':id')
  async updateMapping(
    @Param('id') id: string,
    @Body() updates: Partial<StandardMapping>,
  ) {
    return this.mappingService.updateMapping(id, updates);
  }

  @Get()
  async listMappings(
    @Query('sourceProtocol') sourceProtocol?: string,
    @Query('targetProtocol') targetProtocol?: string,
    @Query('active') active?: boolean,
  ) {
    return this.mappingService.listMappings({
      sourceProtocol,
      targetProtocol,
      active,
    });
  }

  @Post(':id/map')
  async mapMessage(
    @Param('id') mappingId: string,
    @Body()
    data: {
      message: any;
      context?: MappingContext;
    },
  ) {
    const mapping = await this.mappingService.getMapping(mappingId);
    if (!mapping) {
      return { success: false, errors: ['Mapping not found'] };
    }

    return this.mappingService.mapMessage(data.message, mapping, data.context);
  }
}
