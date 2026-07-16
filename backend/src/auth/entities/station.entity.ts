import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stations')
export class Station {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  town: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: ['Active', 'Inactive'], default: 'Active' })
  status: string;

  @Column({ default: 0 })
  agentCount: number;

  @Column({ default: 'Tickets · Parcels' })
  operations: string;

  @CreateDateColumn()
  createdAt: Date;
}
