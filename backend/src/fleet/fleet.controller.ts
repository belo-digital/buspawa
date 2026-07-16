import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { FleetService } from './fleet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('fleet')
@UseGuards(JwtAuthGuard)
export class FleetController {
  constructor(private fleetService: FleetService) {}

  @Post('vehicles')
  createVehicle(@Body() body: any) {
    return this.fleetService.createVehicle(body);
  }

  @Get('vehicles')
  findAllVehicles(@Query() query: { status?: string }) {
    return this.fleetService.findAllVehicles(query);
  }

  @Get('vehicles/:id')
  findVehicle(@Param('id') id: string) {
    return this.fleetService.findVehicle(id);
  }

  @Patch('vehicles/:id')
  updateVehicle(@Param('id') id: string, @Body() body: any) {
    return this.fleetService.updateVehicle(id, body);
  }

  @Post('trips')
  createTrip(@Body() body: any) {
    return this.fleetService.createTrip(body);
  }

  @Get('trips')
  findAllTrips(@Query() query: { status?: string; route?: string; date?: string }) {
    return this.fleetService.findAllTrips(query);
  }

  @Get('trips/:id')
  findTrip(@Param('id') id: string) {
    return this.fleetService.findTrip(id);
  }

  @Patch('trips/:id/status')
  updateTripStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.fleetService.updateTripStatus(id, body.status);
  }

  @Get('stats')
  getFleetStats() {
    return this.fleetService.getFleetStats();
  }

  @Get('compliance')
  getComplianceAlerts() {
    return this.fleetService.getComplianceAlerts();
  }

  @Get('compliance/crew')
  getEmployeeComplianceAlerts() {
    return this.fleetService.getEmployeeComplianceAlerts();
  }
}
