import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { ParcelScanEvent } from './parcel-scan-event.entity';

@Entity('parcels')
export class Parcel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  trackingCode: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  actualWeight: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  volumetricWeight: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  chargeableWeight: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  length: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  width: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  height: number | null;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column()
  senderName: string;

  @Column({ type: 'varchar', nullable: true })
  senderPhone: string | null;

  @Column()
  receiverName: string;

  @Column({ type: 'varchar', nullable: true })
  receiverPhone: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fare: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  baseFare: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  modifierFare: number;

  @Column({ type: 'enum', enum: ['standard', 'express'], default: 'standard' })
  serviceLevel: string;

  @Column({ type: 'boolean', default: false })
  isFragile: boolean;

  @Column({ type: 'boolean', default: false })
  isPerishable: boolean;

  @Column({ type: 'boolean', default: false })
  isHighValue: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  declaredValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  insuranceRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  insuranceFee: number;

  @Column({ type: 'boolean', default: false })
  isDocument: boolean;

  @Column({ type: 'enum', enum: ['Cash', 'M-Pesa', 'Card'], default: 'M-Pesa' })
  paymentMethod: string;

  @Column({ type: 'enum', enum: ['created', 'in_transit', 'arrived', 'delivered', 'returned'], default: 'created' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  assignedTripId: string | null;

  @Column({ type: 'varchar', nullable: true })
  assignedVehicleReg: string | null;

  @Column({ type: 'text', nullable: true })
  qrCodeData: string | null;

  @Column({ type: 'text', nullable: true })
  receiverSignatureUrl: string | null;

  @ManyToOne(() => User, (user) => user.parcels, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'varchar', nullable: true })
  createdById: string | null;

  @OneToMany(() => ParcelScanEvent, (event) => event.parcel)
  scanEvents: ParcelScanEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
