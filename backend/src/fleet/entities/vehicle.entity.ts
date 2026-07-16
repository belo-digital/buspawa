import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Trip } from '../../fleet/entities/trip.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  registration: string;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'enum', enum: ['2+2', '2+1'], default: '2+2' })
  layout: string;

  @Column({ type: 'varchar', nullable: true })
  routeId: string;

  @Column({ type: 'varchar', nullable: true })
  homeStation: string;

  @Column({ type: 'varchar', nullable: true })
  driverName: string;

  @Column({ type: 'varchar', nullable: true })
  conductorName: string;

  @Column({ type: 'date', nullable: true })
  nextServiceDate: Date;

  @Column({ type: 'date', nullable: true })
  insuranceExpiry: Date;

  @Column({ type: 'date', nullable: true })
  ntsaExpiry: Date;

  @Column({ type: 'date', nullable: true })
  tlbExpiry: Date;

  @Column({ type: 'enum', enum: ['active', 'maintenance', 'retired'], default: 'active' })
  status: string;

  @OneToMany(() => Trip, (trip) => trip.vehicle)
  trips: Trip[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
