import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { TillLineItem } from './till-line-item.entity';

@Entity('till_sessions')
export class TillSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.tillSessions)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column()
  agentId: string;

  @Column()
  branch: string;

  @Column({ type: 'date' })
  sessionDate: Date;

  @Column({ type: 'enum', enum: ['Morning', 'Afternoon', 'Night'] })
  shift: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  expected: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cashReceived: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  mpesaReceived: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  variance: number;

  @Column({ type: 'enum', enum: ['open', 'closed', 'reconciled'], default: 'open' })
  status: string;

  @Column({ type: 'timestamptz', nullable: true })
  closedAt: Date;

  @OneToMany(() => TillLineItem, (item) => item.tillSession)
  lineItems: TillLineItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
