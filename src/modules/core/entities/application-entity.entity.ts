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
import { MappingReference } from '../../../common/models';

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
  facilityId!: string;

  @Column('varchar', { length: 255, nullable: true })
  facilityName!: string;

  @Column('varchar', { length: 255, nullable: true })
  customId!: string;

  @Column('simple-json', { nullable: true })
  facilityIdentifier?: Record<string, any>;

  @Column('simple-json', { nullable: true })
  facility?: Record<string, any>;

  @Column('varchar', { length: 255, nullable: true })
  organizationId!: string;

  @Column('simple-enum', { enum: AEStatus, default: AEStatus.ACTIVE })
  status!: AEStatus;

  @Column('boolean', { default: false })
  online: boolean;

  @Column('simple-array')
  inboundCapabilities!: ProtocolType[];

  @Column('simple-array')
  outboundCapabilities!: ProtocolType[];

  @Column('simple-json')
  inboundConfig!: any[];

  @Column('simple-json')
  outboundConfig!: any[];

  @Column('simple-json')
  mappings!: MappingReference;

  @Column('simple-json')
  securitySettings!: any;

  @Column('simple-json', { nullable: true })
  attributes?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
