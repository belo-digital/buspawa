import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Parcel } from './parcel.entity';

@Entity('parcel_scan_events')
export class ParcelScanEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Parcel, (parcel) => parcel.scanEvents)
  @JoinColumn({ name: 'parcelId' })
  parcel: Parcel;

  @Column()
  parcelId: string;

  @Column({ type: 'enum', enum: ['loaded', 'received', 'collected'] })
  scanType: 'loaded' | 'received' | 'collected';

  @Column({ type: 'varchar', nullable: true })
  scannedByUserId: string | null;

  @Column({ type: 'varchar', nullable: true })
  scannedByName: string | null;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ type: 'varchar', nullable: true })
  vehicleReg: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  receiverSignatureUrl: string | null;

  @CreateDateColumn()
  scannedAt: Date;
}
