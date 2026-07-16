import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TillSession } from './till-session.entity';

@Entity('till_line_items')
export class TillLineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TillSession, (session) => session.lineItems)
  @JoinColumn({ name: 'tillSessionId' })
  tillSession: TillSession;

  @Column()
  tillSessionId: string;

  @Column({ type: 'enum', enum: ['Ticket', 'Parcel'] })
  type: string;

  @Column()
  reference: string;

  @Column()
  detail: string;

  @Column({ type: 'enum', enum: ['Cash', 'M-Pesa'] })
  method: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;
}
