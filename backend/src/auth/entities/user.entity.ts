import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Parcel } from '../../parcels/entities/parcel.entity';
import { TillSession } from '../../finance/entities/till-session.entity';
import { CashDeposit } from '../../finance/entities/cash-deposit.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['super_admin', 'booking_agent', 'finance_officer', 'hr_officer', 'conductor', 'auditor'] })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  stationId: string;

  @OneToMany(() => Ticket, (ticket) => ticket.bookedBy)
  tickets: Ticket[];

  @OneToMany(() => Parcel, (parcel) => parcel.createdBy)
  parcels: Parcel[];

  @OneToMany(() => TillSession, (session) => session.agent)
  tillSessions: TillSession[];

  @OneToMany(() => CashDeposit, (deposit) => deposit.agent)
  cashDeposits: CashDeposit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
