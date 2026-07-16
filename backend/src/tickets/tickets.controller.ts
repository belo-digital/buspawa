import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get('seat-map/:tripId')
  getSeatMap(@Param('tripId') tripId: string) {
    return this.ticketsService.getSeatMap(tripId);
  }

  @Post('hold')
  holdSeat(@Body() body: { tripId: string; seatNumber: number }, @Request() req: any) {
    return this.ticketsService.holdSeat(body.tripId, body.seatNumber, req.user.sub, req.user.email);
  }

  @Post('release-holds')
  releaseExpiredHolds() {
    return this.ticketsService.releaseExpiredHolds();
  }

  @Post('book')
  confirmBooking(@Body() body: any, @Request() req: any) {
    return this.ticketsService.confirmBooking({ ...body, bookedById: req.user.sub });
  }

  @Get()
  findAll(@Query() query: { tripId?: string; status?: string }) {
    return this.ticketsService.findAll(query);
  }

  @Get('stats')
  getStats(@Query('branch') branch?: string) {
    return this.ticketsService.getStats(branch);
  }

  @Post('verify/:ticketRef')
  verifyByConductor(@Param('ticketRef') ticketRef: string, @Request() req: any) {
    return this.ticketsService.verifyTicketByConductor(ticketRef, req.user.sub);
  }
}
