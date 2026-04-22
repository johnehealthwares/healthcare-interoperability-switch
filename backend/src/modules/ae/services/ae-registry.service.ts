import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApplicationEntityEntity } from '../../core/entities';
import { ApplicationEntityContract } from '../../../common/models';
import { ProtocolType, AEStatus } from '../../../common/enums';

@Injectable()
export class AERegistryService {
  private readonly logger = new Logger(AERegistryService.name);

  constructor(
    @InjectRepository(ApplicationEntityEntity)
    private aeRepository: Repository<ApplicationEntityEntity>,
  ) {}

  async registerAE(
    aeContract: Omit<ApplicationEntityContract, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<ApplicationEntityContract> {
    const id = uuidv4();
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

  async listAEs(
    filters?: {
      status?: AEStatus;
      protocol?: ProtocolType;
      facilityCode?: string;
    },
  ): Promise<ApplicationEntityContract[]> {
    const query = this.aeRepository.createQueryBuilder('ae');

    if (filters?.status) {
      query.andWhere('ae.status = :status', { status: filters.status });
    }

    if (filters?.facilityCode) {
      query.andWhere('ae.facilityCode = :facilityCode', {
        facilityCode: filters.facilityCode,
      });
    }

    return query.getMany();
  }

  async updateAE(
    id: string,
    updates: Partial<ApplicationEntityContract>,
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

    return query.getMany();
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
}
