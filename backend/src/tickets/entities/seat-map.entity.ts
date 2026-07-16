import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Trip } from '../../fleet/entities/trip.entity';

@Entity('seat_map')
@Index(['tripId', 'seatNumber'], { unique: true })
export class SeatMap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Trip, (trip) => trip.passengers)
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @Column()
  tripId: string;

  @Column({ type: 'int' })
  seatNumber: number;

  @Column({
    type: 'enum',
    enum: ['free', 'held', 'confirmed'],
    default: 'free',
  })
  status: 'free' | 'held' | 'confirmed';

  @Column({ type: 'varchar', nullable: true })
  heldByUserId: string | null;

  @Column({ type: 'varchar', nullable: true })
  heldByPhone: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  holdExpiresAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  ticketRef: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  heldFare: number | null;

  @Column({ type: 'int', default: 0 })
  holdVersion: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
