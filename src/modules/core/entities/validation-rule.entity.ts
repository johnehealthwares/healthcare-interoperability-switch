import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('validation_rules')
@Index(['name'], { unique: true })
export class ValidationRuleEntity {
  @PrimaryColumn('varchar', { length: 255 })
  id!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column('varchar', { length: 255, nullable: true })
  sourceAE?: string;

  @Column('varchar', { length: 50, nullable: true })
  messageType?: string;

  @Column('boolean', { default: true })
  enabled!: boolean;

  @Column('simple-json')
  conditions!: any[];

  @Column('simple-json')
  action!: any;

  @Column('simple-json')
  failureResponse!: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
