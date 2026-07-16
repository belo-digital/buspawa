import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Trip } from '../../fleet/entities/trip.entity';

@Entity('manifest_parcels')
export class ManifestParcel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Trip, (trip) => trip.manifestParcels)
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @Column()
  tripId: string;

  @Column()
  parcelTrackingCode: string;

  @Column()
  description: string;

  @Column()
  receiverName: string;

  @Column({ default: false })
  handed: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  handedAt: Date;
}
