import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Trip } from '../../fleet/entities/trip.entity';

@Entity('manifest_passengers')
export class ManifestPassenger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Trip, (trip) => trip.passengers)
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @Column()
  tripId: string;

  @Column()
  ticketRef: string;

  @Column()
  passengerName: string;

  @Column({ type: 'int' })
  seatNumber: number;

  @Column({ default: false })
  boarded: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  boardingTime: Date;
}
