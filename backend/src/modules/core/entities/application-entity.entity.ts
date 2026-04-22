import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { AEStatus, ProtocolType } from '../../../common/enums';
import { ApplicationEntityContract } from '../../../common/models';

@Entity('application_entities')
@Index(['facilityCode', 'name'], { unique: true })
export class ApplicationEntityEntity {
  @PrimaryColumn('varchar', { length: 255 })
  id!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column('varchar', { length: 100, nullable: true })
  facilityCode!: string;

  @Column('varchar', { length: 255, nullable: true })
  organizationId!: string;

  @Column('enum', { enum: AEStatus, default: AEStatus.ACTIVE })
  status!: AEStatus;

  @Column('simple-array')
  inboundCapabilities!: ProtocolType[];

  @Column('simple-array')
  outboundCapabilities!: ProtocolType[];

  @Column('jsonb', { default: {} })
  inboundConfig!: any[];

  @Column('jsonb', { default: {} })
  outboundConfig!: any[];

  @Column('jsonb')
  mappings!: { inboundMappingId: string; outboundMappingId: string };

  @Column('jsonb', { default: {} })
  securitySettings!: any;

  @Column('jsonb', { nullable: true })
  attributes?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
