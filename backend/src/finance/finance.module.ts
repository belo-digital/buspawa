import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { PaymentsController } from './payments.controller';
import { TillSession } from './entities/till-session.entity';
import { TillLineItem } from './entities/till-line-item.entity';
import { CashDeposit } from './entities/cash-deposit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TillSession, TillLineItem, CashDeposit])],
  controllers: [FinanceController, PaymentsController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
