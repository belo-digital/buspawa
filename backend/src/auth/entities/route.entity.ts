import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Station } from './station.entity';

@Entity('service_routes')
export class ServiceRoute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column('simple-array')
  intermediateStops: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  baseFare: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
