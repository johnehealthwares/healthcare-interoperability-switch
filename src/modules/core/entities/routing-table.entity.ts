import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { RoutingTable } from '../../../common/models';

@Entity('routing_tables')
@Index(['name'], { unique: true })
export class RoutingTableEntity {
  @PrimaryColumn('varchar', { length: 255 })
  id!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column('simple-json')
  routes!: any[];

  @Column('varchar', { length: 255, nullable: true })
  defaultRoute!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
