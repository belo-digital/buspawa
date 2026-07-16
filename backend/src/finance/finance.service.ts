import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TillSession } from './entities/till-session.entity';
import { TillLineItem } from './entities/till-line-item.entity';
import { CashDeposit } from './entities/cash-deposit.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(TillSession) private tillRepo: Repository<TillSession>,
    @InjectRepository(TillLineItem) private lineItemRepo: Repository<TillLineItem>,
    @InjectRepository(CashDeposit) private depositRepo: Repository<CashDeposit>,
  ) {}

  async openSession(data: { agentId: string; branch: string; shift: string; expected: number }) {
    const session = this.tillRepo.create({
      ...data,
      sessionDate: new Date(),
      status: 'open',
    });
    return this.tillRepo.save(session);
  }

  async addLineItem(sessionId: string, data: { type: string; ref: string; detail: string; method: string; amount: number }) {
    const session = await this.tillRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status === 'closed') throw new BadRequestException('Session is already closed');

    const item = this.lineItemRepo.create({ ...data, tillSessionId: sessionId });
    await this.lineItemRepo.save(item);

    if (data.method === 'Cash') session.cashReceived += data.amount;
    else session.mpesaReceived += data.amount;

    await this.tillRepo.save(session);
    return item;
  }

  async closeSession(sessionId: string) {
    const session = await this.tillRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    session.status = 'closed';
    session.closedAt = new Date();
    session.variance = Number(session.cashReceived) + Number(session.mpesaReceived) - Number(session.expected);
    return this.tillRepo.save(session);
  }

  async findAllSessions(filters?: { branch?: string; status?: string; agentId?: string }) {
    const qb = this.tillRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.agent', 'agent');

    if (filters?.branch) qb.andWhere('s.branch = :branch', { branch: filters.branch });
    if (filters?.status) qb.andWhere('s.status = :status', { status: filters.status });
    if (filters?.agentId) qb.andWhere('s.agentId = :agentId', { agentId: filters.agentId });

    return qb.orderBy('s."sessionDate"', 'DESC').getMany();
  }

  async getSessionLineItems(sessionId: string) {
    return this.lineItemRepo.find({ where: { tillSessionId: sessionId } });
  }

  async submitCashDeposit(data: {
    agentId: string; branch: string; tillSessionRef: string;
    bankName: string; accountNumber: string; amount: number;
    depositDate: Date; bankReference: string; receiptName: string;
  }) {
    const deposit = this.depositRepo.create({ ...data, status: 'Pending verification' });
    return this.depositRepo.save(deposit);
  }

  async verifyCashDeposit(depositId: string, statementAmount: number, verifiedBy: string) {
    const deposit = await this.depositRepo.findOne({ where: { id: depositId } });
    if (!deposit) throw new NotFoundException('Deposit not found');
    if (deposit.status === 'Verified') throw new BadRequestException('Already verified');

    if (deposit.amount !== statementAmount) {
      deposit.status = 'Mismatch';
      deposit.statementAmount = statementAmount;
      deposit.verifiedBy = verifiedBy;
      deposit.verifiedAt = new Date();
      await this.depositRepo.save(deposit);
      return { success: false, message: 'Amount mismatch' };
    }

    deposit.status = 'Verified';
    deposit.statementAmount = statementAmount;
    deposit.verifiedBy = verifiedBy;
    deposit.verifiedAt = new Date();
    await this.depositRepo.save(deposit);
    return { success: true, deposit };
  }

  async getDeposits(filters?: { status?: string; branch?: string }) {
    const qb = this.depositRepo.createQueryBuilder('d');
    if (filters?.status) qb.andWhere('d.status = :status', { status: filters.status });
    if (filters?.branch) qb.andWhere('d.branch = :branch', { branch: filters.branch });
    return qb.orderBy('d."createdAt"', 'DESC').getMany();
  }

  async getFinanceSummary(branch?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await this.tillRepo
      .createQueryBuilder('s')
      .select('SUM(s.expected)', 'totalExpected')
      .addSelect('SUM(s."cashReceived")', 'totalCash')
      .addSelect('SUM(s."mpesaReceived")', 'totalMpesa')
      .addSelect('AVG(s.variance)', 'avgVariance')
      .where('s."sessionDate" >= :today', { today })
      .getRawOne();

    const pendingDeposits = await this.depositRepo.count({ where: { status: 'Pending verification' as any } });

    return {
      todayExpected: Number(sessions?.totalExpected || 0),
      todayCash: Number(sessions?.totalCash || 0),
      todayMpesa: Number(sessions?.totalMpesa || 0),
      avgVariance: Number(sessions?.avgVariance || 0),
      pendingDeposits,
    };
  }
}
