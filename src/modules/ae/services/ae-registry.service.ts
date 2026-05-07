import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { ApplicationEntityEntity } from '../../core/entities';
import {
  ApplicationEntityContract,
  AECreatePayload,
  AEUpdatePayload,
} from '../../../common/models';
import { ProtocolType, AEStatus } from '../../../common/enums';
import { executeListQuery, ListResult } from '../../../common/repository/list';

@Injectable()
export class AERegistryService {
  private readonly logger = new Logger(AERegistryService.name);

  constructor(
    @InjectRepository(ApplicationEntityEntity)
    private aeRepository: Repository<ApplicationEntityEntity>,
  ) {}

  async registerAE(aeContract: AECreatePayload): Promise<ApplicationEntityContract> {
    const id = randomUUID();
    const ae = this.aeRepository.create({
      id,
      ...aeContract,
    });
    const saved = await this.aeRepository.save(ae);
    this.logger.log(`AE registered: ${saved.id} (${saved.name})`);
    return saved;
  }

  async getAE(id: string): Promise<ApplicationEntityContract | null> {
    return this.aeRepository.findOne({ where: { id } });
  }

  async getAEByName(name: string): Promise<ApplicationEntityContract | null> {
    return this.aeRepository.findOne({ where: { name } });
  }

  async listAEs(query: {
    page?: number;
    limit?: number;
    filters: Record<string, any>;
  }): Promise<ListResult<ApplicationEntityContract>> {
    const qb = this.aeRepository.createQueryBuilder('ae');
    const result = await executeListQuery(qb, 'ae', query);
    return result;;
  }

  async updateAE(
    id: string,
    updates: AEUpdatePayload,
  ): Promise<ApplicationEntityContract> {
    await this.aeRepository.update(id, updates as any);
    const updated = await this.getAE(id);
    this.logger.log(`AE updated: ${id}`);
    return updated!;
  }

  async deactivateAE(id: string): Promise<void> {
    await this.updateAE(id, { status: AEStatus.INACTIVE });
    this.logger.log(`AE deactivated: ${id}`);
  }

  async deleteAE(id: string): Promise<void> {
    await this.aeRepository.softDelete(id);
    this.logger.log(`AE deleted: ${id}`);
  }

  async getAEsByProtocol(
    protocol: ProtocolType,
    direction: 'inbound' | 'outbound',
  ): Promise<ApplicationEntityContract[]> {
    const query = this.aeRepository.createQueryBuilder('ae');

    if (direction === 'inbound') {
      query.where(':protocol = ANY(ae.inboundCapabilities)', {
        protocol,
      });
    } else {
      query.where(':protocol = ANY(ae.outboundCapabilities)', {
        protocol,
      });
    }

    return query.andWhere('ae.status = :status', { status: AEStatus.ACTIVE }).getMany();
  }

  async validateAEAccess(
    aeId: string,
    protocol: ProtocolType,
    direction: 'inbound' | 'outbound',
  ): Promise<boolean> {
    const ae = await this.getAE(aeId);
    if (!ae || ae.status !== AEStatus.ACTIVE) {
      return false;
    }

    if (direction === 'inbound') {
      return ae.inboundCapabilities.includes(protocol);
    } else {
      return ae.outboundCapabilities.includes(protocol);
    }
  }

  async testAEConnectivity(aeId: string): Promise<{
    success: boolean;
    message: string;
    timestamp: Date;
  }> {
    const ae = await this.getAE(aeId);
    if (!ae) {
      return {
        success: false,
        message: 'AE not found',
        timestamp: new Date(),
      };
    }

    if (ae.status !== AEStatus.ACTIVE) {
      return {
        success: false,
        message: 'AE is not active',
        timestamp: new Date(),
      };
    }

    // Simple validation - in real implementation, would test actual connectivity
    const hasInbound = ae.inboundConfig?.length > 0;
    const hasOutbound = ae.outboundConfig?.length > 0;

    return {
      success: hasInbound || hasOutbound,
      message: hasInbound || hasOutbound ? 'AE is configured' : 'AE has no configuration',
      timestamp: new Date(),
    };
  }

  async getAEStatistics(): Promise<{
    totalAEs: number;
    activeAEs: number;
    inactiveAEs: number;
    byProtocol: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const total = await this.aeRepository.count();
    const active = await this.aeRepository.count({
      where: { status: AEStatus.ACTIVE },
    });
    const inactive = await this.aeRepository.count({
      where: { status: AEStatus.INACTIVE },
    });

    return {
      totalAEs: total,
      activeAEs: active,
      inactiveAEs: inactive,
      byProtocol: {},
      byStatus: {
        [AEStatus.ACTIVE]: active,
        [AEStatus.INACTIVE]: inactive,
      },
    };
  }
}
