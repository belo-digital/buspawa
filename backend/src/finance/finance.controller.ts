import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Post('till/open')
  openSession(@Body() body: { agentId: string; branch: string; shift: string; expected: number }) {
    return this.financeService.openSession(body);
  }

  @Get('till/sessions')
  getSessions(@Query() query: { branch?: string; status?: string }) {
    return this.financeService.findAllSessions(query);
  }

  @Post('till/:sessionId/items')
  addLineItem(@Param('sessionId') sessionId: string, @Body() body: any) {
    return this.financeService.addLineItem(sessionId, body);
  }

  @Patch('till/:sessionId/close')
  closeSession(@Param('sessionId') sessionId: string) {
    return this.financeService.closeSession(sessionId);
  }

  @Get('till/:sessionId/items')
  getSessionItems(@Param('sessionId') sessionId: string) {
    return this.financeService.getSessionLineItems(sessionId);
  }

  @Post('deposits')
  submitDeposit(@Body() body: any) {
    return this.financeService.submitCashDeposit(body);
  }

  @Patch('deposits/:id/verify')
  verifyDeposit(@Param('id') id: string, @Body() body: { statementAmount: number; verifiedBy: string }) {
    return this.financeService.verifyCashDeposit(id, body.statementAmount, body.verifiedBy);
  }

  @Get('deposits')
  getDeposits(@Query() query: { status?: string; branch?: string }) {
    return this.financeService.getDeposits(query);
  }

  @Get('summary')
  getSummary(@Query('branch') branch?: string) {
    return this.financeService.getFinanceSummary(branch);
  }
}
