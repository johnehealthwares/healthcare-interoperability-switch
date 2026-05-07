import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { MessageEvent, EventStream } from '../../../common/models';

@Entity('message_events')
@Index(['messageId', 'timestamp'])
@Index(['correlationId'])
@Index(['sourceAE'])
export class MessageEventEntity {
  @PrimaryColumn('varchar', { length: 255 })
  id!: string;

  @Column('varchar', { length: 100 })
  eventType!: string;

  @Column('varchar', { length: 255 })
  messageId!: string;

  @Column('varchar', { length: 255 })
  correlationId!: string;

  @Column('datetime')
  timestamp!: Date;

  @Column('integer')
  sequenceNumber!: number;

  @Column('varchar', { length: 255 })
  sourceAE!: string;

  @Column('varchar', { length: 255, nullable: true })
  targetAE?: string;

  @Column('varchar', { length: 50 })
  status!: string;

  @Column('simple-json')
  metadata!: any;

  @Column('simple-json')
  snapshot!: any;

  @Column('integer', { nullable: true })
  duration?: number;

  @Column('text', { nullable: true })
  errorMessage?: string;

  @Column('text', { nullable: true })
  stackTrace?: string;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity('event_streams')
@Index(['messageId'])
export class EventStreamEntity {
  @PrimaryColumn('varchar', { length: 255 })
  messageId!: string;

  @Column('simple-json')
  events!: any[];

  @Column('varchar', { length: 50 })
  status!: string;

  @Column('datetime')
  startTime!: Date;

  @Column('datetime', { nullable: true })
  endTime?: Date;

  @Column('integer', { nullable: true })
  totalDuration?: number;

  @Column('integer', { default: 0 })
  errorCount!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
