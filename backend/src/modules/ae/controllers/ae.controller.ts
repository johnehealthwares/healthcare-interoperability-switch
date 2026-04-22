import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { AERegistryService } from '../services';
import { ApplicationEntityContract } from '../../../common/models';
import { ProtocolType, AEStatus } from '../../../common/enums';

@Controller('api/v1/aes')
export class AEController {
  constructor(private aeService: AERegistryService) {}

  @Post()
  async registerAE(
    @Body() contract: Omit<ApplicationEntityContract, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ) {
    return this.aeService.registerAE(contract);
  }

  @Get(':id')
  async getAE(@Param('id') id: string) {
    return this.aeService.getAE(id);
  }

  @Get('by-name/:name')
  async getAEByName(@Param('name') name: string) {
    return this.aeService.getAEByName(name);
  }

  @Get()
  async listAEs(
    @Param('status') status?: AEStatus,
    @Param('protocol') protocol?: ProtocolType,
  ) {
    return this.aeService.listAEs({ status, protocol });
  }

  @Put(':id')
  async updateAE(
    @Param('id') id: string,
    @Body() updates: Partial<ApplicationEntityContract>,
  ) {
    return this.aeService.updateAE(id, updates);
  }

  @Delete(':id')
  async deleteAE(@Param('id') id: string) {
    await this.aeService.deleteAE(id);
    return { message: 'AE deleted successfully' };
  }

  @Put(':id/deactivate')
  async deactivateAE(@Param('id') id: string) {
    await this.aeService.deactivateAE(id);
    return { message: 'AE deactivated successfully' };
  }
}
