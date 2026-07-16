import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { ManifestPassenger } from '../../tickets/entities/manifest-passenger.entity';
import { ManifestParcel } from '../../parcels/entities/manifest-parcel.entity';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.trips)
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column()
  vehicleId: string;

  @Column()
  route: string;

  @Column({ type: 'time' })
  departureTime: string;

  @Column({ type: 'time' })
  arrivalTime: string;

  @Column({ type: 'date' })
  travelDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseFare: number;

  @Column({ type: 'int' })
  totalSeats: number;

  @Column({ type: 'int', default: 0 })
  bookedSeats: number;

  @Column({ type: 'enum', enum: ['scheduled', 'boarding', 'departed', 'in_transit', 'arrived', 'cancelled'], default: 'scheduled' })
  status: string;

  @OneToMany(() => Ticket, (ticket) => ticket.trip)
  tickets: Ticket[];

  @OneToMany(() => ManifestPassenger, (mp) => mp.trip)
  passengers: ManifestPassenger[];

  @OneToMany(() => ManifestParcel, (mp) => mp.trip)
  manifestParcels: ManifestParcel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
