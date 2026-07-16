import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Post()
  create(@Body() body: any) {
    return this.employeesService.create(body);
  }

  @Get()
  findAll(@Query() query: { role?: string; branch?: string; status?: string }) {
    return this.employeesService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.employeesService.getStats();
  }

  @Get('expiring-documents')
  getExpiringDocuments() {
    return this.employeesService.getExpiringDocuments();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.employeesService.update(id, body);
  }

  @Post(':id/documents')
  addDocument(@Param('id') id: string, @Body() body: any) {
    return this.employeesService.addDocument(id, body);
  }

  @Get(':id/documents')
  getDocuments(@Param('id') id: string) {
    return this.employeesService.getDocuments(id);
  }

  @Get(':id/compliance')
  checkCompliance(@Param('id') id: string) {
    return this.employeesService.isCompliant(id);
  }
}
