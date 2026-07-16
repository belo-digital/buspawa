import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { EmployeeDocument } from './employee-document.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column()
  role: string;

  @Column()
  branch: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salary: number;

  @Column({ type: 'enum', enum: ['active', 'on_leave', 'terminated'], default: 'active' })
  employmentStatus: string;

  @Column({ type: 'date', nullable: true })
  dateJoined: Date;

  @OneToMany(() => EmployeeDocument, (doc) => doc.employee)
  documents: EmployeeDocument[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
