import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('cash_deposits')
export class CashDeposit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.cashDeposits)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column()
  agentId: string;

  @Column()
  branch: string;

  @Column()
  tillSessionRef: string;

  @Column()
  bankName: string;

  @Column()
  accountNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  depositDate: Date;

  @Column()
  bankReference: string;

  @Column()
  receiptName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  statementAmount: number;

  @Column({ type: 'enum', enum: ['Pending verification', 'Verified', 'Mismatch'], default: 'Pending verification' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
