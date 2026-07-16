import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Trip } from '../../fleet/entities/trip.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ticketRef: string;

  @ManyToOne(() => Trip, (trip) => trip.tickets)
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @Column()
  tripId: string;

  @ManyToOne(() => User, (user) => user.tickets, { nullable: true })
  @JoinColumn({ name: 'bookedById' })
  bookedBy: User;

  @Column({ type: 'varchar', nullable: true })
  bookedById: string;

  @Column()
  passengerName: string;

  @Column({ type: 'varchar', nullable: true })
  passengerPhone: string;

  @Column({ type: 'int' })
  seatNumber: number;

  @Column({ type: 'enum', enum: ['Regular', 'VIP'], default: 'Regular' })
  ticketClass: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fare: number;

  @Column({ type: 'enum', enum: ['Cash', 'M-Pesa', 'Card'], default: 'M-Pesa' })
  paymentMethod: string;

  @Column({ type: 'enum', enum: ['booked', 'checked_in', 'boarded', 'cancelled', 'no_show'], default: 'booked' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  bookingCode: string;

  @Column({ type: 'varchar', nullable: true })
  mpesaReceipt: string;

  @Column({ type: 'text', nullable: true })
  qrCodeData: string;

  @Column({ type: 'varchar', nullable: true })
  verifiedByConductorId: string;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
