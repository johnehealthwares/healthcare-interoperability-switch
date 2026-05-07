import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AERegistryService } from '../services';
import {
  ApplicationEntityContract,
  AECreatePayload,
  AEUpdatePayload,
  AEListFilter,
} from '../../../common/models';
import { ProtocolType, AEStatus } from '../../../common/enums';

@Controller('v1/aes')
export class AEController {
  constructor(private aeService: AERegistryService) {}

  @Post()
  @HttpCode(201)
  async registerAE(@Body() contract: AECreatePayload) {
    if (!contract.name) {
      throw new BadRequestException('AE name is required');
    }
    if (!contract.inboundCapabilities?.length && !contract.outboundCapabilities?.length) {
      throw new BadRequestException(
        'At least one inbound or outbound capability is required',
      );
    }
    return this.aeService.registerAE(contract);
  }

  @Get('stats')
  async getStatistics() {
    return this.aeService.getAEStatistics();
  }

  @Get(':id')
  async getAE(@Param('id') id: string) {
    const ae = await this.aeService.getAE(id);
    if (!ae) {
      throw new NotFoundException(`AE with id ${id} not found`);
    }
    return ae;
  }

  @Get('by-name/:name')
  async getAEByName(@Param('name') name: string) {
    const ae = await this.aeService.getAEByName(name);
    if (!ae) {
      throw new NotFoundException(`AE with name ${name} not found`);
    }
    return ae;
  }

  @Get()
  async listAEs(
    @Query() query,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
        const {page: _, limit: __, ...filters} = query; 
    return this.aeService.listAEs({filters, page, limit});
  }

  @Put(':id')
  async updateAE(
    @Param('id') id: string,
    @Body() updates: AEUpdatePayload,
  ) {
    const ae = await this.aeService.getAE(id);
    if (!ae) {
      throw new NotFoundException(`AE with id ${id} not found`);
    }
    return this.aeService.updateAE(id, updates);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteAE(@Param('id') id: string) {
    const ae = await this.aeService.getAE(id);
    if (!ae) {
      throw new NotFoundException(`AE with id ${id} not found`);
    }
    await this.aeService.deleteAE(id);
  }

  @Put(':id/deactivate')
  async deactivateAE(@Param('id') id: string) {
    const ae = await this.aeService.getAE(id);
    if (!ae) {
      throw new NotFoundException(`AE with id ${id} not found`);
    }
    await this.aeService.deactivateAE(id);
    return { message: 'AE deactivated successfully', id };
  }

  @Put(':id/activate')
  async activateAE(@Param('id') id: string) {
    const ae = await this.aeService.getAE(id);
    if (!ae) {
      throw new NotFoundException(`AE with id ${id} not found`);
    }
    return this.aeService.updateAE(id, { status: AEStatus.ACTIVE });
  }

  @Get(':id/connectivity')
  async testConnectivity(@Param('id') id: string) {
    const ae = await this.aeService.getAE(id);
    if (!ae) {
      throw new NotFoundException(`AE with id ${id} not found`);
    }
    return this.aeService.testAEConnectivity(id);
  }

  @Get('protocol/:protocol/inbound')
  async getInboundByProtocol(@Param('protocol') protocol: ProtocolType) {
    return this.aeService.getAEsByProtocol(protocol, 'inbound');
  }

  @Get('protocol/:protocol/outbound')
  async getOutboundByProtocol(@Param('protocol') protocol: ProtocolType) {
    return this.aeService.getAEsByProtocol(protocol, 'outbound');
  }

  @Post(':id/validate-access')
  async validateAccess(
    @Param('id') id: string,
    @Body('protocol') protocol: ProtocolType,
    @Body('direction') direction: 'inbound' | 'outbound',
  ) {
    if (!['inbound', 'outbound'].includes(direction)) {
      throw new BadRequestException('Direction must be inbound or outbound');
    }
    const isValid = await this.aeService.validateAEAccess(id, protocol, direction);
    return { id, protocol, direction, isValid };
  }
}
