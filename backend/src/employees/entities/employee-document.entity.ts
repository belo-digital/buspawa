import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('employee_documents')
export class EmployeeDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, (emp) => emp.documents)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  employeeId: string;

  @Column({
    type: 'enum',
    enum: [
      'psv_badge',
      'driving_license_d1',
      'driving_license_d2',
      'driving_license_d3',
      'ntsa_medical_certificate',
      'certificate_of_good_conduct',
    ],
  })
  documentType: string;

  @Column()
  documentNumber: string;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ type: 'enum', enum: ['valid', 'expiring_soon', 'expired'] })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  fileUrl: string;

  @Column({ type: 'timestamptz', nullable: true })
  createdAt: Date;
}

export const REQUIRED_DOCS_BY_ROLE: Record<string, string[]> = {
  driver: ['psv_badge', 'driving_license_d1', 'ntsa_medical_certificate', 'certificate_of_good_conduct'],
  conductor: ['psv_badge', 'certificate_of_good_conduct'],
  booking_agent: ['certificate_of_good_conduct'],
};
