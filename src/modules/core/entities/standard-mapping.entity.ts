import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { StandardMapping } from '../../../common/models';

@Entity('standard_mappings')
@Index(['name', 'version'], { unique: true })
export class StandardMappingEntity {
  @PrimaryColumn('varchar', { length: 255 })
  id!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column('varchar', { length: 50 })
  sourceProtocol!: string;

  @Column('varchar', { length: 50 })
  targetProtocol!: string;

  @Column('varchar', { length: 50 })
  sourceMessageType!: string;

  @Column('varchar', { length: 50 })
  targetMessageType!: string;

  @Column('simple-json')
  mappingSteps!: any[];

  @Column('simple-json', { nullable: true })
  globalLookups?: Record<string, any>;

  @Column('varchar', { length: 20 })
  version!: string;

  @Column('boolean', { default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
